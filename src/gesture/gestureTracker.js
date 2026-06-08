import { getGestureDefinition } from "./index.js";

function getGestureSignature(gesture) {
  const definition = getGestureDefinition(gesture.gesture);

  if (!definition || !definition.signature) {
    return gesture.gesture;
  }

  return definition.signature(gesture);
}

export function createGestureTracker(options = {}) {
  const minDurationMs = options.minDurationMs ?? 1000;

  const state = new Map();

  function update(gestures, now) {
    const stableGestures = [];

    const activeSignatures = new Set();

    for (const gesture of gestures) {
      const signature = getGestureSignature(gesture);

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
