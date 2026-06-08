import { isFingerExtended } from "../gestureCalculator.js";

function isFingerPointingDown(landmarks, tipIndex, pipIndex) {
  const tip = landmarks[tipIndex];
  const pip = landmarks[pipIndex];

  return tip.y > pip.y;
}

function detectSingleFingersDownGesture(landmarks) {
  const indexExtended = isFingerExtended(landmarks, 8, 6);
  const middleExtended = isFingerExtended(landmarks, 12, 10);

  const ringExtended = isFingerExtended(landmarks, 16, 14);
  const pinkyExtended = isFingerExtended(landmarks, 20, 18);

  const indexDown = isFingerPointingDown(landmarks, 8, 6);
  const middleDown = isFingerPointingDown(landmarks, 12, 10);

  const detected =
    indexExtended &&
    middleExtended &&
    indexDown &&
    middleDown &&
    !ringExtended &&
    !pinkyExtended;

  return {
    detected,
    gesture: "FingersDown",
    data: {},
  };
}

export function detectFingersDownGesture(leftLandmarks, rightLandmarks) {
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
  action() {
    return "down";
  },
  label() {
    return "Down";
  },
  signature(result) {
    return result.gesture;
  },
  detect({ leftHandLandmarks, rightHandLandmarks }) {
    const fingersDown = detectFingersDownGesture(
      leftHandLandmarks,
      rightHandLandmarks,
    );

    return fingersDown.detected ? [fingersDown] : [];
  },
};
