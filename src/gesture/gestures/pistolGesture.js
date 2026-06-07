import {
  areFingertipsClose,
  getHorizontalDirection,
  isFingerExtended,
  isThumbUp
} from "../gestureCalculator.js";

export function detectPistolGesture(
  landmarks,
  hand
) {
  const thumbExtended =
    isThumbUp(landmarks);

  const indexExtended =
    isFingerExtended(landmarks, 8, 6);

  const middleExtended =
    isFingerExtended(landmarks, 12, 10);

  const ringExtended =
    isFingerExtended(landmarks, 16, 14);

  const pinkyExtended =
    isFingerExtended(landmarks, 20, 18);

  const fingertipsClose =
    areFingertipsClose(landmarks);

  const isPistol =
    thumbExtended &&
    indexExtended &&
    middleExtended &&
    fingertipsClose &&
    !ringExtended &&
    !pinkyExtended;

  const direction =
    isPistol
      ? getHorizontalDirection(landmarks)
      : null;

  if (!isPistol || !direction) {
    return {
      detected: false,
      gesture: "Pistol",
      data: {}
    };
  }

  return {
    detected: true,
    gesture: "Pistol",
    data: {
      hand,
      direction
    }
  };
}