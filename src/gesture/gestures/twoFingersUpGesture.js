import { isFingerExtended } from "../gestureCalculator.js";

function isFingerPointingUp(landmarks, tipIndex, pipIndex) {
  const tip = landmarks[tipIndex];
  const pip = landmarks[pipIndex];

  return tip.y < pip.y;
}

export function detectFingersUpGesture(landmarks) {
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
