# Simplify and Redesign the Gesture Library Public API

- Status: accepted
- Workload: 12h
- Decider: [Marcel Grund](https://github.com/MaGrund)
- Issue: [5](https://github.com/mi-classroom/mi-web-technologien-beiboot-ss2026-magrund/issues/5)
- Date: 2026-08-23

## Context and Problem Statement

The API test in Issue [#4](https://github.com/mi-classroom/mi-web-technologien-beiboot-ss2026-magrund/issues/4) showed that the public API of the gesture library was too large and complicated for the actual use case.

The library exposed more functionality than was necessary for a typical consumer. Concepts such as gesture registries, gesture definitions, renderers, formatters, logging utilities and other implementation details made the public API harder to understand. There were too many concepts to understand before they could do a simple detection task.

This became especially apparent while building the demo application. Even as the original author, I had to spend time understanding how the different exported components were intended to work together. The API test therefore showed that the library needed a more focused public interface before being used for a larger application.

During the planning process for Issue [#5](https://github.com/mi-classroom/mi-web-technologien-beiboot-ss2026-magrund/issues/5), I decided to redesign the API, because I was unhappy with the result. This would make it much easier to use my API for my Vision Application, which is documented in [ARD-0006](0006-Chrome-Extension-for-YouTube.md)

## Decisions

The public API was redesigned around a single high-level abstraction: the `GestureTracker`.

The intended basic usage is now:

```ts
import {
  createGestureTracker,
  Gestures,
} from "...";

const tracker = createGestureTracker();

const gesture = tracker.detect({
  leftHandLandmarks,
  rightHandLandmarks,
});
```

The public entry point was minimised so that consumers only need the functionality required to recognize gestures:

```ts
export { createGestureTracker } from "./tracker/GestureTracker.js";
export { Gestures } from "./gesture/GestureType.js";

export type {
  Landmark,
  LandmarkList,
} from "./types.js";
```

Internal concepts such as gesture registries, internal gesture definitions and implementation-specific tracking logic are no longer required when using the library.

The tracker also provides optional gesture-specific configuration:

```ts
tracker.configureGesture(
  Gestures.pistolForward,
  {
    minDurationMs: 200,
  },
);
```

This allows the common use case to remain simple while still providing control for applications that require different timing behavior.

## Gesture Detection and Application Actions

The library only reports which gesture was detected. It does not define what an application should do with that gesture.

For example, an application can decide what a pistol gesture means:

```ts
switch (gesture?.type) {
  case Gestures.pistolForward:
    //event
    break;

  case Gestures.pistolBackward:
    //event
    break;
}
```

This separation is intentional. The gesture library only describes what the user does, while the application decides what that gesture means.

If a gesture has a clear direction, use separate gestures instead of one generic gesture with a direction property:

```ts
Gestures.pistolForward
Gestures.pistolBackward
```

This decision originated from the Pistol gesture in Issue #4. The previous implementation returned a direction that the consuming application then had to translate into an action.


## Continuous Gesture Interaction

The original API was mainly designed around the question whether a gesture was detected.

This was sufficient for simple interactions, but it was not sufficient for interactions where the duration of a gesture matters. This came up during the design process for my Vision Application, as documented in [ARD-0006](0006-Chrome-Extension-for-YouTube.md)


The tracker therefore maintains the state of an active gesture and can distinguish between a gesture becoming active and a gesture continuing to be held.

A gesture event can contain a phase and duration:

```ts
{
  type: Gestures.pistolForward,
  phase: "start",
  durationMs: 300,
}
```

A continuing gesture can produce:

```ts
{
  type: Gestures.pistolForward,
  phase: "hold",
  durationMs: 900,
}
```

The supported phases are:

```ts
type GesturePhase =
  | "start"
  | "hold";
```

The tracker is responsible for maintaining this state between consecutive detection calls.
Gesture repetition can be configured through the gesture configuration:

```ts
{
  enabled: true,
  minDurationMs: 300,

  repeat: {
    enabled: true,
    intervalMs: 300,
  },
}
```

This allows applications to implement continuous interactions without having to track gesture state themselves.

## Landmark Input

The gesture recognition layer operates on hand landmark data rather than directly on MediaPipe runtime objects.

The public input types are:

```ts
export interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export type LandmarkList = Landmark[];
```

The tracker therefore receives landmark data through:

```ts
tracker.detect({
  leftHandLandmarks,
  rightHandLandmarks,
});
```

MediaPipe remains the current source of these landmarks in the application.

No additional adapter system for multiple hand estimation models was introduced as part of this redesign. The current application only requires MediaPipe, and introducing a generalized provider or adapter architecture would add complexity without solving a concrete problem.

At the same time, the gesture recognition layer does not directly depend on MediaPipe runtime objects. A future implementation can therefore introduce an adapter if another hand estimation model needs to be supported.

## Alternatives considered

### Keep the existing registry-based API

The existing registry approach provided flexibility and allowed gesture definitions to be managed dynamically.
It was rejected because this abstraction was not necessary for the normal use case. Consumers primarily want to detect gestures rather than manage the internal collection of gesture definitions.

### Keep the existing API and improve the documentation

Another option was to keep all existing public building blocks and document them more extensively. This was rejected because the main problem was not a lack of documentation. The public API itself exposed too many concepts. Reducing the number of concepts was considered a more effective solution than explaining the existing complexity in more detail.

### Implement a custom gestures creator

The internal gesture implementation already uses reusable handMath functions, making it easy to build new gestures.
A public API for creating and registering custom gestures was considered but not implemented. It would require additional concepts and configuration that were not needed for the Vision Application.

It still could be a feature for the future.

## Consequences

### Positive consequences

- The public API is significantly smaller and easier to understand.
- The default use case requires very little setup.
- The `GestureTracker` provides a single, clear entry point for consumers.
- New features like holded gestures.
- Remove unnecessary mapping for gesture directions.

### Negative consequences

- The redesign introduces breaking changes compared to the API used in Issue #4.
- Other hand estimation models are not yet supported through a dedicated adapter API.
- Spent much time on the Redesign instread of the Vision Application

## Additional Notes

The previous API implementation is preserved in the repository under `/old/library_old`, together with the presentation demo from Issue #4 under `/old/gesture-presentation-demo-old_library`.

During the redesign of the public API, I updated the presentation demo to use the new library implementation. This updated version is located under `/old/gesture-presentation-demo-new_library`.

The updated presentation demo was used as an validation step to verify that the redesigned API could replace the previous implementation in an existing application.

The old implementation and both presentation demos are kept for comparison and documentation purposes. They make the evolution from the original API to the redesigned API traceable.