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
}