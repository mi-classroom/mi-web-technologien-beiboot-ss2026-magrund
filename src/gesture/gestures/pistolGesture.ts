import type {
  GestureAction,
  GestureDetectionResult,
  HandednessLabel,
  HorizontalDirection,
  LandmarkList,
} from "../../types.js";
import type { GestureInput } from "../../types.js";
import {
  areFingertipsClose,
  getHorizontalDirection,
  isFingerExtended,
  isThumbUp,
} from "../gestureCalculator.js";

interface PistolGestureData {
  hand?: HandednessLabel;
  direction?: HorizontalDirection;
}

export function detectPistolGesture(
  landmarks: LandmarkList,
  hand: HandednessLabel,
): GestureDetectionResult<PistolGestureData> {
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

  const direction = isPistol ? getHorizontalDirection(landmarks) : "";

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
  action(result: GestureDetectionResult<PistolGestureData>): GestureAction {
    return result.data.direction === "Forward" ? "forward" : "backward";
  },
  label(result: GestureDetectionResult<PistolGestureData>) {
    return `${result.data.hand ?? "Unknown"}: Pistol (${result.data.direction ?? "Unknown"})`;
  },
  signature(result: GestureDetectionResult<PistolGestureData>) {
    return [
      result.gesture,
      result.data.hand ?? "",
      result.data.direction ?? "",
    ].join(":");
  },
  detect({ leftHandLandmarks, rightHandLandmarks }: GestureInput) {
    const gestures: Array<GestureDetectionResult<PistolGestureData>> = [];

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
