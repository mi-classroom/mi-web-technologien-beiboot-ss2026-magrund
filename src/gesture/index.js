import { pistolGestureDefinition } from "./gestures/pistolGesture.js";
import { thumbsUpGestureDefinition } from "./gestures/thumbsUpGesture.js";
import { crossedIndexGestureDefinition } from "./gestures/crossIndexFingerGesture.js";
import { fingersUpGestureDefinition } from "./gestures/twoFingersUpGesture.js";
import { fingersDownGestureDefinition } from "./gestures/twoFingersDownGesture.js";

export const gestureDefinitions = [
  pistolGestureDefinition,
  thumbsUpGestureDefinition,
  crossedIndexGestureDefinition,
  fingersDownGestureDefinition,
  fingersUpGestureDefinition,
];

const gestureDefinitionMap = new Map(
  gestureDefinitions.map((definition) => [definition.name, definition]),
);

export function getGestureDefinition(gestureName) {
  return gestureDefinitionMap.get(gestureName) ?? null;
}
