import type { GestureAction, GestureDetectionResult, LandmarkList } from "../../types.js";
import type { GestureInput } from "../../types.js";
import { isFingerExtended } from "../gestureCalculator.js";

function isFingerPointingDown(landmarks: LandmarkList, tipIndex: number, pipIndex: number): boolean {
  const tip = landmarks[tipIndex];
  const pip = landmarks[pipIndex];

  if (!tip || !pip) {
    return false;
  }

  return tip.y > pip.y;
}

function detectSingleFingersDownGesture(landmarks: LandmarkList): GestureDetectionResult {
  const indexExtended = isFingerExtended(landmarks, 8, 6);
  const middleExtended = isFingerExtended(landmarks, 12, 10);

  const ringExtended = isFingerExtended(landmarks, 16, 14);
  const pinkyExtended = isFingerExtended(landmarks, 20, 18);

  const indexDown = isFingerPointingDown(landmarks, 8, 6);
  const middleDown = isFingerPointingDown(landmarks, 12, 10);

  const detected = indexExtended && middleExtended && indexDown && middleDown && !ringExtended && !pinkyExtended;

  return {
    detected,
    gesture: "FingersDown",
    data: {},
  };
}

export function detectFingersDownGesture(leftLandmarks?: LandmarkList | null, rightLandmarks?: LandmarkList | null): GestureDetectionResult {
  if (!leftLandmarks || !rightLandmarks) {
    return {
      detected: false,
      gesture: "FingersDown",
      data: {},
    };
  }

  const leftFingersDown = detectSingleFingersDownGesture(leftLandmarks);
  const rightFingersDown = detectSingleFingersDownGesture(rightLandmarks);

  return {
    detected: leftFingersDown.detected && rightFingersDown.detected,
    gesture: "FingersDown",
    data: {},
  };
}

export const fingersDownGestureDefinition = {
  name: "FingersDown",
  action(): GestureAction {
    return "down";
  },
  label() {
    return "Down";
  },
  signature(result: GestureDetectionResult) {
    return result.gesture;
  },
  detect({ leftHandLandmarks, rightHandLandmarks }: GestureInput) {
    const fingersDown = detectFingersDownGesture(leftHandLandmarks, rightHandLandmarks);

    return fingersDown.detected ? [fingersDown] : [];
  },
};
