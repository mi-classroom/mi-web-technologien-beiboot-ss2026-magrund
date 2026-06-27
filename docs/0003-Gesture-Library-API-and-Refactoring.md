# Gesture Library API and Boundaries

- Status: accepted
- Workload: 16h+ (Refactor work that has not been done in past issues)
- Decider: [Marcel Grund](https://github.com/MaGrund)
- Issue: [3](https://github.com/mi-classroom/mi-web-technologien-beiboot-ss2026-magrund/issues/3)
- Date: 2026-06-27

## Context and Problem Statement

The prototype gesture logic from the earlier issue had to be turned into a reusable library. The project needed a clear line between public API and internal implementation so that new gestures can be added without changing existing consumers.

## Refactor work

During the meeting, I noticed that D. Hoffmann had a better MediaPipe implementation than mine, so I adapted his approach into my code.

Initially, I used the MediaPipe Holistic model because it provides all the keypoints I needed, including hands, face, and body. However, since my application mainly relies on hand tracking, switching to separate hand and pose models, following D. Hoffmann's implementation, significantly improved both the detection quality and the overall frame rate.

After that, I spent a considerable amount of time refactoring the project. This helped me better structure the codebase and prepare it for a public API release. I extracted the detection logic into separate modules, standardized the output format of all gesture detectors, and introduced a clearer folder structure. Additionally, I integrated ESLint and Prettier to improve code quality and enable consistent formatting.

Overall, I revised all gesture implementations to make them more consistent, fixed issues related to two-hand gestures, and optimized the outputs used for logging, counters, and tracking. Finally, I migrated the project from JavaScript to TypeScript, resulting in a cleaner, more maintainable codebase that is better suited for separating the public API from private implementation details.

## New Gestures

I implemented the Up and Down gestures, which are recognized by extending the index and middle fingers while keeping the remaining fingers closed. The direction of the two extended fingers determines whether the gesture is classified as Up or Down.

Initially, I considered using a Spock-like hand pose for the Up gesture. However, during implementation, I found that this pose was not detected consistently by the tracking system. Additionally, using similar hand poses for both the Up and Down gestures makes the gesture set more intuitive and easier for users to remember. Therefore, I decided to use the same finger configuration for both gestures.

## Decision

The library now exposes a small public surface through [src/index.ts](../src/index.ts):

- `createGestureRegistry(initialDefinitions)`
- `registerGestureDefinition(definition)`
- `getGestureDefinition(name)`
- `getGestureDefinitions()`
- `detectGestures(leftHandLandmarks, rightHandLandmarks, { registry })`
- `createGestureTracker({ minDurationMs, registry })`
- `createGestureCounterController(elements, { registry })`

All gesture implementations, helper heuristics, renderer internals, and DOM wiring stay inside `src/gesture/*`, `src/renderer/*`, and `src/utils/*`.

## Public API

The public API is intentionally small and stable:

- Registries define what gestures exist.
- The detector turns landmark input into gesture results.
- The tracker stabilizes repeated detections over time.
- The counter translates gesture results into application actions.

The API accepts plain landmark arrays and optional registry instances. This keeps the library framework-agnostic and easy to reuse in other browser apps.

## Internal API

The following parts are treated as internal implementation details:

- Gesture-specific helper functions like distance checks and angle heuristics.
- DOM rendering helpers for pose and hand overlays.
- The demo bootstrap in [src/main.ts](../src/main.ts).
- Built-in gesture definitions as concrete implementation objects.

These modules can change without forcing changes for consumers, as long as the public functions above keep their contract.

## Consequences

- New gestures can be added by creating a definition object and registering it in a registry.
- Consumers can supply their own registry without touching the built-in gesture code.
- The demo can remain separate from the library entry point.

## Links

- [Library usage guide](README.md)
- [Gesture mapping table](Hand-Gestures.md)
