import { IRover } from "../rover";
import { RoverConnection } from "./connections";
import { roverSettings } from "./globals";

export default class Rover implements IRover {

    private connection: RoverConnection;

    constructor() {
        this.connection = new RoverConnection(roverSettings.host);
    }

    public async forward(): Promise<void> {
        await this.connection.execute("forward", {});
    }

    public async stop(): Promise<void> {
        await this.connection.execute("stop", {});
    }

    public async wait(waitInMs: number): Promise<void> {
        return new Promise<void>(resolve => {
            setTimeout(() => {
                resolve();
            }, waitInMs);
        });
    }
}