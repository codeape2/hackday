import * as moment from "moment";

interface IInvocation {
    actionId: string;
    method: string;
    kwargs: any;
}

export class RoverConnection {
    private socket: WebSocket;

    private resolveFunctionsById: { [actionId: string]: (args: any) => void }

    constructor(host: string) {
        this.resolveFunctionsById = {};

        this.socket = new WebSocket("ws://" + host + "/roverws");
        this.socket.onmessage = (evt) => {
            if (!evt.data) {
                throw new Error("No .data on execute-response event.")
            }

            const responseData = JSON.parse(evt.data);

            // The server should respond with what action it has completed.
            const actionId = responseData.actionId;

            // Find promise to resolve.
            const promiseToResolve = this.resolveFunctionsById[actionId];
            if (promiseToResolve) {
                promiseToResolve(evt.data);
                delete this.resolveFunctionsById.actionId;
            }
        };
    }

    public execute(method: string, kwargs: object) {
        return new Promise(resolve => {
            const actionId = Math.random().toString();
            this.resolveFunctionsById[actionId] = resolve;

            const invocation: IInvocation = {
                method: method,
                kwargs: kwargs,
                actionId: actionId
            };

            this.socket.send(JSON.stringify(invocation));
        });
    }
}

export class Firehose {
    private socket: WebSocket;
    public static globalHook: ((measurement: IFirehoseData) => void)[] = [];

    constructor(host: string) {
        this.socket = new WebSocket("ws://" + host + "/firehose");
        this.socket.onmessage = (evt) => {
            const obj = JSON.parse(evt.data);
            const accel = obj.accel;
            const data: IFirehoseData = {
                accelerometer: {
                    x: accel.x,
                    y: accel.y
                }
            };

            Firehose.globalHook.forEach(hook => {
                try {
                    hook(data)
                } catch (err) { }
            });
        };
    }
}

export interface IRangeMeasurement {
    tick: number;
    value: number;
}

export interface IFirehoseData {
    accelerometer: {
        x: number;
        y: number
    }
}

export class RangeFinder {
    private socket: WebSocket;

    private measurements: IRangeMeasurement[] = [];
    private latestMeasurement: IRangeMeasurement;

    public static globalHook: ((measurement: IRangeMeasurement) => void)[] = [];

    constructor(host: string) {
        this.socket = new WebSocket("ws://" + host + "/rangefinder");
        this.socket.onmessage = (evt) => {
            //console.log("RANGE", evt.data);
            const range = JSON.parse(evt.data);

            this.addMeasurement(range);
        };
    }

    private addMeasurement(range: number) {
        const measurement: IRangeMeasurement = {
            tick: moment().valueOf(),
            value: range
        };

        this.latestMeasurement = measurement;
        this.measurements.push(measurement);

        // Cheat since we don't have a proper data flow configured.
        RangeFinder.globalHook.forEach(hook => {
            try {
                hook(this.latestMeasurement);
            } catch (err) {
            }
        });
    }

    public getLatestDistance() {
        return this.latestMeasurement;
    }
}