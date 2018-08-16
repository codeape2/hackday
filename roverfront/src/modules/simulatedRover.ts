import { IRoverHandler } from "../contracts";
import { IRover } from "../rover";
import { Firehose } from "./connections";

export default class SimulatedRover implements IRover {

    constructor(private rover: IRoverHandler) { }

    public async forward(seconds: number = 0, speed: number = 1.0): Promise<void> {
        if (this.rover.onForward) {
            this.rover.onForward(speed)
        }

        if (seconds) {
            await this.wait(seconds);
            this.stop();
        }
    }

    public getRange() {
        return 10;
    }

    public async stop(): Promise<void> {
        if (this.rover.onStop) {
            this.rover.onStop();
        }

        return this.wait(0.1);
    }

    public async right(seconds: number = 0, speed: number = 0.5): Promise<void> {
        if (this.rover.onTurn) {
            this.rover.onTurn("right", speed);
        }

        if (seconds) {
            await this.wait(seconds);
            await this.stop();
        }
    }

    public async left(seconds: number = 0, speed: number = 0.5): Promise<void> {
        if (this.rover.onTurn) {
            this.rover.onTurn("left", speed);
        }

        if (seconds) {
            await this.wait(seconds);
            await this.stop();
        }
    }

    public async reverse(seconds: number = 0, speed: number = 1.0): Promise<void> {
        if (this.rover.onForward) {
            this.rover.onForward(-speed)
        }

        if (seconds) {
            await this.wait(seconds);
            await this.stop();
        }
    }

    public async wait(waitInSeconds: number): Promise<void> {
        return new Promise<void>(resolve => {
            setTimeout(() => {
                resolve();
            }, waitInSeconds * 1000);
        });
    }

    public async stopWhenRangeLessThan(range: number): Promise<void> {
        await this.waitForRangeLessThan(range);
        await this.stop();
    }

    public async stopWhenRangeGreaterThan(range: number): Promise<void> {
        await this.waitForRangeGreaterThan(range);
        await this.stop();
    }

    public async waitForRangeLessThan(range: number) {
        return new Promise<void>(resolve => {
            const interval = setInterval(() => {
                if (this.getRange() < range) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }

    public async waitForRangeGreaterThan(range: number) {
        return new Promise<void>(resolve => {
            const interval = setInterval(() => {
                if (this.getRange() > range) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }


}