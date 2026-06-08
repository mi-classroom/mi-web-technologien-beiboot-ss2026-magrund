import {
  areFingertipsClose,
  getHorizontalDirection,
  isFingerExtended,
  isThumbUp,
} from "../gestureCalculator.js";

export function detectPistolGesture(landmarks, hand) {
  const thumbExtended = isThumbUp(landmarks);

  const indexExtended = isFingerExtended(landmarks, 8, 6);

  const middleExtended = isFingerExtended(landmarks, 12, 10);

  const ringExtended = isFingerExtended(landmarks, 16, 14);

  const pinkyExtended = isFingerExtended(landmarks, 20, 18);

  const fingertipsClose = areFingertipsClose(landmarks);

  const isPistol =
    thumbExtended &&
    indexExtended &&
    middleExtended &&
    fingertipsClose &&
    !ringExtended &&
    !pinkyExtended;

  const direction = isPistol ? getHorizontalDirection(landmarks) : null;

  if (!isPistol || !direction) {
    return {
      detected: false,
      gesture: "Pistol",
      data: {},
    };
  }

  return {
    detected: true,
    gesture: "Pistol",
    data: {
      hand,
      direction,
    },
  };
}

export const pistolGestureDefinition = {
  name: "Pistol",
  action(result) {
    return result.data.direction === "Forward" ? "forward" : "backward";
  },
  label(result) {
    return `${result.data.hand}: Pistol (${result.data.direction})`;
  },
  signature(result) {
    return [result.gesture, result.data.hand, result.data.direction].join(":");
  },
  detect({ leftHandLandmarks, rightHandLandmarks }) {
    const gestures = [];

    if (leftHandLandmarks) {
      const leftPistol = detectPistolGesture(leftHandLandmarks, "Left");

      if (leftPistol.detected) {
        gestures.push(leftPistol);
      }
    }

    if (rightHandLandmarks) {
      const rightPistol = detectPistolGesture(rightHandLandmarks, "Right");

      if (rightPistol.detected) {
        gestures.push(rightPistol);
      }
    }

    return gestures;
  },
};
