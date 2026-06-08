import { gestureDefinitions } from "./index.js";

export function detectGestures(leftHandLandmarks, rightHandLandmarks) {
  const gestures = [];
  const input = {
    leftHandLandmarks,
    rightHandLandmarks,
  };

  for (const gestureDefinition of gestureDefinitions) {
    const detectedGestures = gestureDefinition.detect(input);

    gestures.push(...detectedGestures);
  }

  return gestures;
}
