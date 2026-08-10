import type {
  GestureDetectionResult,
  GestureInput,
} from "../../types.js";

import type { GestureDefinition } from "../GestureDefinition.js";
import { Gestures } from "../GestureType.js";

import {
  isFingerExtended,
  isFingerPointingUp
} from "../../math/handMath.js";

function detect(
  input: GestureInput,
): GestureDetectionResult | null {
  const {
    leftHandLandmarks,
    rightHandLandmarks,
  } = input;

  if (!leftHandLandmarks || !rightHandLandmarks) {
    return null;
  }

  const leftDetected =
    isFingerExtended(leftHandLandmarks, 8, 6) &&
    isFingerExtended(leftHandLandmarks, 12, 10) &&
    isFingerPointingUp(leftHandLandmarks, 8, 6) &&
    isFingerPointingUp(leftHandLandmarks, 12, 10) &&
    !isFingerExtended(leftHandLandmarks, 16, 14) &&
    !isFingerExtended(leftHandLandmarks, 20, 18);

  const rightDetected =
    isFingerExtended(rightHandLandmarks, 8, 6) &&
    isFingerExtended(rightHandLandmarks, 12, 10) &&
    isFingerPointingUp(rightHandLandmarks, 8, 6) &&
    isFingerPointingUp(rightHandLandmarks, 12, 10) &&
    !isFingerExtended(rightHandLandmarks, 16, 14) &&
    !isFingerExtended(rightHandLandmarks, 20, 18);

  if (!leftDetected || !rightDetected) {
    return null;
  }

  return {
    type: Gestures.twoFingersUp,
  };
}

export const twoFingersUpGesture: GestureDefinition = {
  type: Gestures.twoFingersUp,

  defaultConfiguration: {
    enabled: true,
    minDurationMs: 300,
  },

  detect,
};