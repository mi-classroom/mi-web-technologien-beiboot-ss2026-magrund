import type {
  GestureDetectionResult,
  GestureInput,
} from "../../types.js";

import type { GestureDefinition } from "../GestureDefinition.js";
import { Gestures } from "../GestureType.js";

import { segmentsIntersect } from "../../math/handMath.js";

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

  const leftIndexMcp = leftHandLandmarks[5];
  const leftIndexTip = leftHandLandmarks[8];

  const rightIndexMcp = rightHandLandmarks[5];
  const rightIndexTip = rightHandLandmarks[8];

  if (
    !leftIndexMcp ||
    !leftIndexTip ||
    !rightIndexMcp ||
    !rightIndexTip
  ) {
    return null;
  }

  const detected = segmentsIntersect(
    leftIndexMcp,
    leftIndexTip,
    rightIndexMcp,
    rightIndexTip,
  );

  if (!detected) {
    return null;
  }

  return {
    type: Gestures.crossIndexFinger,
  };
}

export const crossIndexFingerGesture: GestureDefinition = {
  type: Gestures.crossIndexFinger,

  defaultConfiguration: {
    enabled: true,
    minDurationMs: 300,
  },

  detect,
};