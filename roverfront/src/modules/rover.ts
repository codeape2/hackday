import { IRover } from "../rover";
import { RoverConnection, RangeFinder } from "./connections";
import { roverSettings } from "./globals";

export default class Rover implements IRover {

    private connection: RoverConnection;
    private distance: RangeFinder;

    constructor() {
        this.connection = new RoverConnection(roverSettings.host);
        this.distance = new RangeFinder(roverSettings.host);
    }

    public async forward(seconds:number=0, speed:number=1.0): Promise<void> {
        await this.connection.execute("forward", {seconds: seconds, speed: speed});
    }

    public async stop(): Promise<void> {
        await this.connection.execute("stop", {});
    }

    public async right(seconds:number=0, speed:number=0.5): Promise<void> {
        await this.connection.execute("right", {seconds: seconds, speed: speed})
    }

    public async left(seconds:number=0, speed:number=0.5): Promise<void> {
        await this.connection.execute("left", {seconds: seconds, speed: speed})
    }

    public async wait(waitInSeconds: number): Promise<void> {
        return new Promise<void>(resolve => {
            setTimeout(() => {
                resolve();
            }, waitInSeconds * 1000);
        });
    }

    public async stopWhenRangeIsLessThan(range: number) {
        await this.waitForRangeLessThan(range);
        await this.stop();
    }

    public async waitForRangeLessThan(range: number) {
        return new Promise<void>(resolve => {
            const interval = setInterval(() => {
                if (this.distance.getLatestDistance().value < range) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }
}