export interface IRover {
    forward(): Promise<void>;
    stop(): Promise<void>;
    wait(waitInMs: number): Promise<void>;
}

// For the monaco-editor. We don't have time to inject this properly there.
declare const rover: IRover;