import { isFingerExtended } from "../gestureCalculator.js";

function isFingerPointingDown(landmarks, tipIndex, pipIndex) {
  const tip = landmarks[tipIndex];
  const pip = landmarks[pipIndex];

  return tip.y > pip.y;
}

export function detectFingersDownGesture(landmarks) {
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
