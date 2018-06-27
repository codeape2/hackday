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

            // The server should respond with what action it has completed.
            const actionId = evt.data.actionId;

            // Find promise to resolve.
            const promiseToResolve = this.resolveFunctionsById[actionId];
            if (promiseToResolve) {
                promiseToResolve(evt.data);
                delete this.resolveFunctionsById.actionId;
            }
        };

        // Wire up the keyhandling here for now just to match old behaviour.
        /*window.addEventListener('keypress', (e) => {
            this.keyPress(e);
        });*/
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

    /*public forward() {
        this.execute('forward', {});
    }

    public left() {
        this.execute('left', {});
    }

    public stop() {
        this.execute('stop', {});
    }

    public right() {
        this.execute('right', {});
    }

    public back() {
        this.execute('reverse', { speed: 0.3 });
    }*/

    /*public keyPress(event: KeyboardEvent) {
        const code = event.keyCode;
        if (code === 119) {
            this.forward();
        }
        else if (code === 97) {
            this.left();
        }
        else if (code === 115) {
            this.stop();
        }
        else if (code === 100) {
            this.right();
        }
        else if (code === 122) {
            this.back();
        }
    }*/
}

export class Firehose {
    private socket: WebSocket;

    constructor(host: string) {
        this.socket = new WebSocket("ws://" + host + "/firehose");
        this.socket.onmessage = (evt) => {
            const obj = JSON.parse(evt.data);
            const accel = obj.accel;
            console.log("X", accel.x, "Y", accel.y, "Z", accel.z);
        };
    }
}

export class RangeFinder {
    private socket: WebSocket;
    constructor(host: string) {
        this.socket = new WebSocket("ws://" + host + "/rangefinder");
        this.socket.onmessage = (evt) => {
            console.log("RANGE", evt.data);
        };
    }
}