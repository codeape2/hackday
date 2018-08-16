import * as React from 'react';
import * as BABYLON from 'babylonjs';
import RoverSimulationScene, { ISceneEventArgs } from './roverSimulationScene';
import { IRoverHandler } from '../contracts';

interface ISimulationParams {
    cameraFollowRover: boolean;
    rover: IRoverHandler;
}

export default class RoverSimulationContainer extends React.Component<ISimulationParams, {}> {

    public onSceneMount = (e: ISceneEventArgs) => {
        const { canvas, scene, engine } = e;

        // This creates and positions a free camera (non-mesh)
        const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(-8, 6, -10), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(canvas, true);

        // Hook up physics
        const physicsPlugin = new BABYLON.CannonJSPlugin();
        const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
        scene.enablePhysics(gravityVector, physicsPlugin);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
        const ground = BABYLON.Mesh.CreateGround("ground", 100, 100, 2, scene);
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);

        this.wallScene(scene);
        const rover = this.createRover(scene);

        engine.runRenderLoop(() => {
            if (scene) {
                if (this.props.cameraFollowRover) {
                    camera.setTarget(rover.position);
                }
                scene.render();
            }
        });

        const roverPhysics = rover.physicsImpostor;
        const angular = roverPhysics && roverPhysics.getAngularVelocity();
        if (roverPhysics && angular) {

            const clear = () => {
                roverPhysics.setAngularVelocity(BABYLON.Vector3.Zero());
                roverPhysics.setLinearVelocity(BABYLON.Vector3.Zero());
            };

            this.props.rover.onForward = (speed) => {
                // Because we're applying forces here instead of using the rover api, we need to clear any forces before trying to move.
                clear();
                roverPhysics.setAngularVelocity(new BABYLON.Vector3(speed, 0, 0));
            };

            this.props.rover.onStop = () => {
                clear();
            }

            this.props.rover.onTurn = (direction, speed) => {
                roverPhysics.setAngularVelocity(new BABYLON.Vector3(0, speed * (direction === "right" ? 1 : -1), 0));
            };

            this.props.rover.clearSimulation = () => {
                // Position the ball inside the track.
                rover.position.x = 5;
                rover.position.y = 3;
                rover.position.z = 5
                rover.rotation = BABYLON.Vector3.Zero();
                rover.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);
                rover.rotate(BABYLON.Axis.Y, Math.PI / 2, BABYLON.Space.WORLD);
            };
        }
    }

    private createRover(scene: BABYLON.Scene) {
        const newRover = BABYLON.Mesh.CreateCylinder("sphere", 2, 3, 3, 24, 1, scene);
        const material = new BABYLON.StandardMaterial("matos", scene);
        material.fillMode = BABYLON.Material.WireFrameFillMode;
        material.diffuseColor = BABYLON.Color3.Green();

        newRover.material = material;
        newRover.physicsImpostor = new BABYLON.PhysicsImpostor(newRover, BABYLON.PhysicsImpostor.SphereImpostor, {
            mass: 1,
            restitution: 0.3
        }, scene);

        // Flip the wheel into the correct orientation.
        newRover.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);
        newRover.rotate(BABYLON.Axis.Y, Math.PI / 2, BABYLON.Space.WORLD);

        // Position the ball inside the track.
        newRover.position.x = 5;
        newRover.position.y = 3;
        newRover.position.z = 5

        return newRover;
    }

    private wallScene(scene: BABYLON.Scene) {
        const mat = new BABYLON.StandardMaterial("mat", scene);
        mat.diffuseColor = BABYLON.Color3.FromInts(121, 189, 224);

        const createWall = (from: BABYLON.Vector2, width: number, height: number) => {
            const wall = BABYLON.Mesh.CreateBox("box", 1.0, scene);
            wall.scaling = new BABYLON.Vector3(width, 2, height);
            wall.position.x = from.x + (width / 2);
            wall.position.z = from.y + (height / 2);
            wall.material = mat;
            wall.physicsImpostor = new BABYLON.PhysicsImpostor(wall, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5, friction: 0.1 }, scene);
            return wall;
        }

        // Left
        createWall(new BABYLON.Vector2(0, 0), 2, 10);
        createWall(new BABYLON.Vector2(0, 10), 2, 10);

        // Right
        createWall(new BABYLON.Vector2(10, 0), 2, 10);
        createWall(new BABYLON.Vector2(10, 10), 2, 10);

        // Back
        createWall(new BABYLON.Vector2(0, 0), 10, 2);
    }

    public render() {
        return (
            <RoverSimulationScene onSceneMount={this.onSceneMount} />
        )
    }
}