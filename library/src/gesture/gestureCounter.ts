import type {
  GestureAction,
  GestureCounterController,
  GestureCounterElements,
  GestureDetectionResult,
  GestureLogsOptions,
} from "../types.js";
import { defaultGestureRegistry } from "./gestureRegistry.js";

function getGestureAction(
  result: GestureDetectionResult,
  registry = defaultGestureRegistry,
): GestureAction | null {
  const definition = registry.getGestureDefinition(result.gesture);

  if (!definition || !definition.action) {
    return null;
  }

  return definition.action(result);
}

export function createGestureCounterController(
  elements: GestureCounterElements,
  options: GestureLogsOptions = {},
): GestureCounterController {
  const registry = options.registry ?? defaultGestureRegistry;
  const state = {
    counts: {
      forward: 0,
      backward: 0,
      start: 0,
      stop: 0,
      up: 0,
      down: 0,
    },
  };

  function renderCounts(): void {
    if (elements.forwardCountElement) {
      elements.forwardCountElement.textContent = String(state.counts.forward);
    }

    if (elements.backwardCountElement) {
      elements.backwardCountElement.textContent = String(state.counts.backward);
    }

    if (elements.startCountElement) {
      elements.startCountElement.textContent = String(state.counts.start);
    }

    if (elements.stopCountElement) {
      elements.stopCountElement.textContent = String(state.counts.stop);
    }

    if (elements.upCountElement) {
      elements.upCountElement.textContent = String(state.counts.up);
    }

    if (elements.downCountElement) {
      elements.downCountElement.textContent = String(state.counts.down);
    }
  }

  function countGesture(result: GestureDetectionResult): void {
    const action = getGestureAction(result, registry);

    if (!action) {
      return;
    }

    state.counts[action] += 1;

    renderCounts();
  }

  renderCounts();

  return {
    countGesture,
  };
}
