# Gesture Library

The gesture detection logic is encapsulated as a small TypeScript library in `src/index.ts`. The demo application in `src/main.ts` only serves as the browser entry point and is not part of the public API.

## Public API

The following functions are intended for external use:

* `createGestureRegistry(initialDefinitions)` creates a gesture registry with the provided gesture definitions.
* `registerGestureDefinition(definition)` registers a new gesture in the default registry.
* `detectGestures(leftHandLandmarks, rightHandLandmarks, { registry })` returns all currently detected gestures.
* `createGestureTracker({ minDurationMs, registry })` stabilizes gesture detections over time.
* `createGestureCounterController(elements, { registry })` maps detected gestures to counters and updates the corresponding DOM elements.

## Intentionally Private

The heuristic helper functions, the built-in gesture implementations, the rendering logic, and the demo application remain internal. This allows the implementation to evolve without introducing breaking changes to the public API.

## Usage

```ts
import {
  createGestureRegistry,
  detectGestures,
  createGestureTracker,
  registerGestureDefinition,
} from "mi-web-technologien-beiboot-ss2026-magrund";

const customRegistry = createGestureRegistry();

registerGestureDefinition({
  name: "MyGesture",
  action() {
    return "start";
  },
  detect() {
    return [];
  },
});

const detected = detectGestures(leftHandLandmarks, rightHandLandmarks, {
  registry: customRegistry,
});

const tracker = createGestureTracker({
  minDurationMs: 1000,
  registry: customRegistry,
});

const stableGestures = tracker.update(detected, performance.now());
```

## Required Input

The gesture detection functions expect landmark data in the MediaPipe format. Each landmark is represented as an object containing at least `x` and `y` coordinates, with optional `z` and `visibility` properties. Hand landmarks for the left and right hands are passed separately.

## Extending the Library

New gestures can be added by defining a gesture with at least a `name` and a `detect` function. If the gesture should also be logged or counted, the optional `label`, `action`, and `signature` properties can be provided. Once registered in a gesture registry, the new gesture becomes available without requiring any modifications to the existing gesture implementations.
