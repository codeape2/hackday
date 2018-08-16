export interface IRoverHandler {
    onForward?: (speed: number) => void;
    onStop?: () => void;
    onTurn?: (direct: "left" | "right", speed: number) => void;

    clearSimulation?: () => void;
}