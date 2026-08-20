## Gesture Control Mapping Table

All gestures require to be hold for at least 15 frames and 1000 ms for classification.

## Gesture API

The application now exposes a small public gesture API through `src/index.ts` and the built output `dist/index.js`:

- `detectGestures(leftHandLandmarks, rightHandLandmarks, { registry })`
- `createGestureTracker({ minDurationMs, registry })`
- `createGestureCounterController(elements, { registry })`
- `createGestureRegistry(initialDefinitions)`
- `registerGestureDefinition(definition)`

Built-in gesture definitions stay internal to the gesture folder. To add a new gesture without touching existing consumers, create a definition object with at least `name` and `detect`, register it in a custom registry or with `registerGestureDefinition`, and pass the same registry to detector, tracker, and counter when you want the whole app to use it.

## Finished Gestures

| Interaction | Possible Gesture for Close Range                                    | Available Data & Reliability                                                                   | Possible Gesture for Long Range | Available Data & Reliability |
| :---------- | :------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------- | :------------------------------ | :--------------------------- |
| Next        | Pistol gesture with two fingers and thumb pointing to the **right** | Thumb up, index finger + middle finger extended and close together, ring finger + pinky folded | ""                              | ""                           |
| Back        | Pistol gesture with two fingers and thumb pointing to the **left**  | Thumb up, index finger + middle finger extended and close together, ring finger + pinky folded | ""                              | ""                           |
|             |                                                                     |                                                                                                |                                 |                              |
| Start       | **Two** thumbs up                                                   | Thumb extended upward and all other fingers folded                                             | ""                              | ""                           |
| Stop        | An **X** shape with both index fingers                              | Index fingers extended and crossing diagonally                                                 | ""                              | ""                           |
|             |                                                                     |                                                                                                |                                 |                              |
| Up          | **Both** index & middle fingers pointing upwards                    | Index and middle fingers extended upward, all other fingers folded                             | ""                              | ""                           |
| Down        | **Both** index & middle fingers pointing downward                   | Index and middle fingers extended downward, all other fingers folded                           | ""                              | ""                           |
|             |                                                                     |                                                                                                |                                 |                              |

## Unfinished Gestures

| Interaction    | Possible Gesture for Close Range                              | Available Data & Reliability                                             | Possible Gesture for Long Range | Available Data & Reliability |
| :------------- | :------------------------------------------------------------ | :----------------------------------------------------------------------- | :------------------------------ | :--------------------------- |
| Zoom In        | Glasses gesture with **both** hands                           | Circle formed with thumb and index finger at eye level                   | ""                              | ""                           |
| Zoom Out       | L-shape with **both** hands                                   | Thumb and index finger extended at a 90° angle, all other fingers folded | ""                              | ""                           |
|                |                                                               |                                                                          |                                 |                              |
| Start Gestures | **Both** thumbs and index fingers tapping 2x                  | Thumb and index finger touching, all other fingers folded                | ""                              | ""                           |
| Stop Gestures  | **Both** thumbs and index fingers held together for 3 seconds | Thumb and index finger touching, all other fingers folded                | ""                              | ""                           |
|                |                                                               |                                                                          |                                 |                              |
