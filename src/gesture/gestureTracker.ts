import type { GestureDetectionResult, GestureTrackerOptions } from "../types.js";
import { defaultGestureRegistry } from "./gestureRegistry.js";

function getGestureSignature(result: GestureDetectionResult, registry = defaultGestureRegistry): string {
  const definition = registry.getGestureDefinition(result.gesture);

  if (!definition || !definition.signature) {
    return result.gesture;
  }

  return definition.signature(result);
}

export function createGestureTracker(options: GestureTrackerOptions = {}) {
  const minDurationMs = options.minDurationMs ?? 1000;
  const registry = options.registry ?? defaultGestureRegistry;

  const state = new Map<string, { since: number; emitted: boolean }>();

  function update(gestures: GestureDetectionResult[], now: number): GestureDetectionResult[] {
    const stableGestures: GestureDetectionResult[] = [];
    const activeSignatures = new Set<string>();

    for (const gesture of gestures) {
      const signature = getGestureSignature(gesture, registry);

      activeSignatures.add(signature);

      let gestureState = state.get(signature);

      if (!gestureState) {
        state.set(signature, {
          since: now,
          emitted: false,
        });

        continue;
      }

      const duration = now - gestureState.since;

      if (!gestureState.emitted && duration >= minDurationMs) {
        gestureState.emitted = true;
        stableGestures.push(gesture);
      }
    }

    for (const signature of state.keys()) {
      if (!activeSignatures.has(signature)) {
        state.delete(signature);
      }
    }

    return stableGestures;
  }

  return {
    update,
  };
}
