import type { GestureDefinition } from "../types.js";
import {
  pistolBackwardGestureDefinition,
  pistolForwardGestureDefinition,
} from "./gestures/pistolGesture.js";
import { thumbsUpGestureDefinition } from "./gestures/thumbsUpGesture.js";
import { crossedIndexGestureDefinition } from "./gestures/crossIndexFingerGesture.js";
import { fingersUpGestureDefinition } from "./gestures/twoFingersUpGesture.js";
import { fingersDownGestureDefinition } from "./gestures/twoFingersDownGesture.js";

export const builtinGestureDefinitions: GestureDefinition[] = [
  pistolForwardGestureDefinition,
  pistolBackwardGestureDefinition,
  thumbsUpGestureDefinition,
  crossedIndexGestureDefinition,
  fingersDownGestureDefinition,
  fingersUpGestureDefinition,
];
