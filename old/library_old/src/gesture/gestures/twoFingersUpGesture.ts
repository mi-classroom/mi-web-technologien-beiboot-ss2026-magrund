import type {
  GestureAction,
  GestureDetectionResult,
  LandmarkList,
} from "../../types.js";
import type { GestureInput } from "../../types.js";
import { isFingerExtended } from "../gestureCalculator.js";

function isFingerPointingUp(
  landmarks: LandmarkList,
  tipIndex: number,
  pipIndex: number,
): boolean {
  const tip = landmarks[tipIndex];
  const pip = landmarks[pipIndex];

  if (!tip || !pip) {
    return false;
  }

  return tip.y < pip.y;
}

function detectSingleFingersUpGesture(
  landmarks: LandmarkList,
): GestureDetectionResult {
  const indexExtended = isFingerExtended(landmarks, 8, 6);
  const middleExtended = isFingerExtended(landmarks, 12, 10);

  const ringExtended = isFingerExtended(landmarks, 16, 14);
  const pinkyExtended = isFingerExtended(landmarks, 20, 18);

  const indexUp = isFingerPointingUp(landmarks, 8, 6);
  const middleUp = isFingerPointingUp(landmarks, 12, 10);

  const detected =
    indexExtended &&
    middleExtended &&
    indexUp &&
    middleUp &&
    !ringExtended &&
    !pinkyExtended;

  return {
    detected,
    gesture: "FingersUp",
    data: {},
  };
}

export function detectFingersUpGesture(
  leftLandmarks?: LandmarkList | null,
  rightLandmarks?: LandmarkList | null,
): GestureDetectionResult {
  if (!leftLandmarks || !rightLandmarks) {
    return {
      detected: false,
      gesture: "FingersUp",
      data: {},
    };
  }

  const leftFingersUp = detectSingleFingersUpGesture(leftLandmarks);
  const rightFingersUp = detectSingleFingersUpGesture(rightLandmarks);

  return {
    detected: leftFingersUp.detected && rightFingersUp.detected,
    gesture: "FingersUp",
    data: {},
  };
}

export const fingersUpGestureDefinition = {
  name: "FingersUp",
  action(): GestureAction {
    return "up";
  },
  label() {
    return "Up";
  },
  signature(result: GestureDetectionResult) {
    return result.gesture;
  },
  detect({ leftHandLandmarks, rightHandLandmarks }: GestureInput) {
    const fingersUp = detectFingersUpGesture(
      leftHandLandmarks,
      rightHandLandmarks,
    );

    return fingersUp.detected ? [fingersUp] : [];
  },
};
