import { isFingerExtended } from "../gestureCalculator.js";

function isFingerPointingUp(landmarks, tipIndex, pipIndex) {
  const tip = landmarks[tipIndex];
  const pip = landmarks[pipIndex];

  return tip.y < pip.y;
}

function detectSingleFingersUpGesture(landmarks) {
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

export function detectFingersUpGesture(leftLandmarks, rightLandmarks) {
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
