import * as React from 'react';
import * as BABYLON from 'babylonjs';
import RoverSimulationScene, { ISceneEventArgs } from './roverSimulationScene';

interface ISimulationParams {

}

export default class RoverSimulationContainer extends React.Component<ISimulationParams, {}> {

    public onSceneMount = (e: ISceneEventArgs) => {
        const { canvas, scene, engine } = e;

        // This creates and positions a free camera (non-mesh)
        let camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

        // This targets the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero());

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        // Hook up physics
        const physicsPlugin = new BABYLON.CannonJSPlugin();
        const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
        scene.enablePhysics(gravityVector, physicsPlugin);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        let light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
        let sphere = BABYLON.Mesh.CreateSphere("sphere", 16, 2, scene);
        const material = new BABYLON.StandardMaterial("matos", scene);
        material.diffuseColor = BABYLON.Color3.Green();

        sphere.material = material;
        sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, {
            mass: 1,
            restitution: 0.9
        }, scene);


        sphere.position.y = 2;

        // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
        let ground = BABYLON.Mesh.CreateGround("ground", 6, 6, 2, scene);
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);

        engine.runRenderLoop(() => {
            if (scene) {
                scene.render();
            }
        });
    }

    public render() {
        return (
            <div>
                <RoverSimulationScene onSceneMount={this.onSceneMount} />
            </div>
        )
    }
}