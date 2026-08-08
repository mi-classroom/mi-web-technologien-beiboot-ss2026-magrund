import type {
  GestureDetectionResult,
  GestureInput,
} from "../../types.js";

import type { GestureDefinition } from "../GestureDefinition.js";
import { Gestures } from "../GestureType.js";

import {
  areFingertipsClose,
  getHorizontalDirection,
  isFingerExtended,
  isThumbExtended,
} from "../../math/handMath.js";

function detect(
  input: GestureInput,
): GestureDetectionResult | null {
  const {
    leftHandLandmarks,
    rightHandLandmarks,
  } = input;

  const landmarks =
    leftHandLandmarks ?? rightHandLandmarks;

  if (!landmarks) {
    return null;
  }

  const detected =
    isFingerExtended(landmarks, 8, 6) &&
    isThumbExtended(landmarks) &&
    isFingerExtended(landmarks, 12, 10) &&
    !isFingerExtended(landmarks, 16, 14) &&
    !isFingerExtended(landmarks, 20, 18) &&
    areFingertipsClose(landmarks) &&
    getHorizontalDirection(landmarks) === "Forward";

  if (!detected) {
    return null;
  }

  return {
    type: Gestures.pistolForward,
  };
}

export const pistolForwardGesture: GestureDefinition = {
  type: Gestures.pistolForward,

  defaultConfiguration: {
    enabled: true,
    minDurationMs: 300,
  },

  detect,
};