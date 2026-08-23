import { builtinGestures } from "../gesture/builtinGestures.js";
class GestureTracker {
    gestureDefinitions = new Map();
    gestureState = new Map();
    constructor(definitions = builtinGestures) {
        for (const definition of definitions) {
            this.gestureDefinitions.set(definition.type, definition);
            this.gestureState.set(definition.type, {
                configuration: {
                    ...definition.defaultConfiguration,
                },
                since: null,
                emitted: false,
                lastEmission: null,
            });
        }
    }
    detect(input, timestamp = Date.now()) {
        const activeGestures = new Set();
        for (const definition of this.gestureDefinitions.values()) {
            const state = this.gestureState.get(definition.type);
            if (!state) {
                continue;
            }
            if (state.configuration.enabled === false) {
                continue;
            }
            const detected = definition.detect(input);
            if (!detected) {
                continue;
            }
            const gestureType = definition.type;
            activeGestures.add(gestureType);
            if (state.since === null) {
                state.since = timestamp;
                state.emitted = false;
                state.lastEmission = null;
            }
            const durationMs = timestamp - state.since;
            const minDurationMs = state.configuration.minDurationMs ?? 0;
            if (durationMs < minDurationMs) {
                continue;
            }
            const repeat = state.configuration.repeat;
            if (!state.emitted) {
                state.emitted = true;
                state.lastEmission = timestamp;
                console.log(`[GestureTracker] ${gestureType} started`);
                return {
                    type: gestureType,
                    phase: "start",
                    durationMs,
                };
            }
            if (!repeat?.enabled) {
                continue;
            }
            const intervalMs = repeat.intervalMs ?? 300;
            if (state.lastEmission !== null &&
                timestamp - state.lastEmission < intervalMs) {
                continue;
            }
            state.lastEmission = timestamp;
            console.log(`[GestureTracker] ${gestureType} hold`);
            return {
                type: gestureType,
                phase: "hold",
                durationMs,
            };
        }
        for (const [gestureType, state] of this.gestureState.entries()) {
            if (!activeGestures.has(gestureType)) {
                state.since = null;
                state.emitted = false;
                state.lastEmission = null;
            }
        }
        return null;
    }
    configureGesture(gesture, configuration) {
        const state = this.gestureState.get(gesture);
        if (!state) {
            return;
        }
        state.configuration = {
            ...state.configuration,
            ...configuration,
        };
    }
}
export function createGestureTracker() {
    return new GestureTracker();
}
//# sourceMappingURL=GestureTracker.js.map