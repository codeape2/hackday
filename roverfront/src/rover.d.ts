export interface IRover {
    forward(): Promise<void>;
    // sleep(waitInMs: number): Promise<void>;
}

// Make this ambiently available so it works in the 
//declare const rover: IRover;