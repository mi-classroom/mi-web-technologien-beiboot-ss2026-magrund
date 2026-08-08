import { builtinGestures } from "../gesture/builtinGestures.js";
import type { GestureDefinition } from "../gesture/GestureDefinition.js";
import type {
    GestureConfiguration,
    GestureDetectionResult,
    GestureInput,
} from "../types.js";
import type { GestureType } from "../gesture/GestureType.js";

interface GestureState {
    configuration: Partial<GestureConfiguration>;
    since: number | null;
    emitted: boolean;
}

class GestureTracker {
    private readonly gestureDefinitions =
        new Map<GestureType, GestureDefinition>();

    private readonly gestureState =
        new Map<GestureType, GestureState>();

    constructor(
        definitions: GestureDefinition[] = builtinGestures,
    ) {
        for (const definition of definitions) {
            this.gestureDefinitions.set(
                definition.type,
                definition,
            );

            this.gestureState.set(
                definition.type,
                {
                    configuration: {
                        ...definition.defaultConfiguration,
                    },
                    since: null,
                    emitted: false,
                },
            );
        }
    }

    detect(
        input: GestureInput,
        timestamp = Date.now(),
    ): GestureDetectionResult | null {
        const activeGestures = new Set<GestureType>();

        for (const definition of this.gestureDefinitions.values()) {
            const state = this.gestureState.get(definition.type);

            if (!state) {
                continue;
            }

            if (state.configuration.enabled === false) {
                continue;
            }

            const gesture = definition.detect(input);

            if (!gesture) {
                continue;
            }

            activeGestures.add(definition.type);

            if (state.since === null) {
                state.since = timestamp;
                state.emitted = false;
            }

            const minDurationMs =
                state.configuration.minDurationMs ?? 0;

            if (
                !state.emitted &&
                timestamp - state.since >= minDurationMs
            ) {
                state.emitted = true;
                console.log(`[GestureTracker] ${definition.type} triggered`);

                return gesture;
            }
        }

        for (const [gestureType, state] of this.gestureState.entries()) {
            if (!activeGestures.has(gestureType)) {
                state.since = null;
                state.emitted = false;
            }
        }

        return null;
    }

    configureGesture(
        gesture: GestureType,
        configuration: Partial<GestureConfiguration>,
    ): void {
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

export function createGestureTracker(): GestureTracker {
    return new GestureTracker();
}