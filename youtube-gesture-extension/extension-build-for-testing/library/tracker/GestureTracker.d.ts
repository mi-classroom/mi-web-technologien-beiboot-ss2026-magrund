import type { GestureDefinition } from "../gesture/GestureDefinition.js";
import type { GestureConfiguration, GestureEvent, GestureInput } from "../types.js";
import type { GestureType } from "../gesture/GestureType.js";
declare class GestureTracker {
    private readonly gestureDefinitions;
    private readonly gestureState;
    constructor(definitions?: GestureDefinition[]);
    detect(input: GestureInput, timestamp?: number): GestureEvent | null;
    configureGesture(gesture: GestureType, configuration: Partial<GestureConfiguration>): void;
}
export declare function createGestureTracker(): GestureTracker;
export {};
//# sourceMappingURL=GestureTracker.d.ts.map