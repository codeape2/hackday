export interface IRover {
    forward(seconds?: number, speed?: number): Promise<void>;
    stop(): Promise<void>;
    right(seconds: number, speed: number): Promise<void>;
    left(seconds: number, speed: number): Promise<void>;

    getRange(): number;
    reverse(seconds: number, speed: number): Promise<void>;

    wait(waitInSeconds: number): Promise<void>;
    stopWhenRangeLessThan(range: number): Promise<void>;
    stopWhenRangeGreaterThan(range: number): Promise<void>;
    waitForRangeLessThan(range: number): Promise<void>;
    waitForRangeGreaterThan(range: number): Promise<void>;

}

// For the monaco-editor. We don't have time to inject this properly there.
declare const rover: IRover;