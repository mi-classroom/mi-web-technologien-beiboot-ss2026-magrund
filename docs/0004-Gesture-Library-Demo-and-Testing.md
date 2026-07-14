# Gesture Library API Validation through Real Usage

- Status: accepted
- Workload: 8h
- Decider: [Marcel Grund](https://github.com/MaGrund)
- Issue: [4](https://github.com/mi-classroom/mi-web-technologien-beiboot-ss2026-magrund/issues/4)
- Date: 2026-07-14

## Context and Problem Statement

After extracting the gesture recognition into a reusable library in Issue #3, the next step was to validate whether the public API is actually usable in a real application. To do this, I built a separate React application that presents my workshop slides.


## Demo Application

The demo is a small React application that allows me to control my workshop presentation with hand gestures.

For navigation, I chose the Pistol gesture:

- Pistol Forward → Next slide
- Pistol Backward → Previous slide

The application imports only the library's public entry point and therefore acts as a real external consumer.

## Problems discovered

Building an application against my own library after several weeks without working on it turned out to be a very good test. Even as the original author, I first had to understand again which parts of the API were actually necessary to get gesture recognition running.

The main problems were:

- The API exposed functionality that is mainly useful for the original demo, such as the gesture counter controller. For a normal application, this functionality is unnecessary.
- The minimum setup required to detect gestures was larger than expected and not very intuitive.
- Too much of the API consisted of low-level building blocks instead of a simple gesture detection interface.

Another issue appeared while integrating the Pistol gesture.

Originally, the gesture returned:

```ts
direction?: HorizontalDirection;
```

This required every application to implement its own helper that translated the direction into actions such as "next slide" or "previous slide". I considered exposing such a helper in the library, but this would only move the complexity instead of removing it.

## Decision

To simplify the API, I split the original Pistol gesture into two separate gesture definitions:

- `PistolForward`
- `PistolBackward`

Applications can now react directly to meaningful gestures without writing additional mapping logic.

I intentionally decided not to provide a helper function that converts directions into actions because this would still require consumers to understand the intermediate direction concept. The gesture definitions themselves now express the intended behavior.

Additionally, I reorganized the repository structure and separated the library from the demo application. This makes it much clearer which code belongs to the reusable package and which code is only an example implementation.

## Alternatives considered

### Keep the direction property

One option was to keep the original implementation and provide a helper function that translates the direction into application actions.

This was rejected because every consumer would still have to understand and work with the direction concept. Splitting the gesture into two semantic gestures results in a simpler and more intuitive API.

## Consequences

- Applications no longer need custom mapping logic for the Pistol gesture.
- The separation between the reusable library and the demo application is clearer.
- During testing, I found that reducing the gesture tracking duration from 1000 ms to 500 ms provided a smoother user experience
- Building the demo showed that the current public API is not as intuitive as intended. Reducing the amount of required setup and simplifying the integration will be the next step.
