import type {
  GestureAction,
  GestureDetectionResult,
  HandednessLabel,
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
}

function detectPistolGesture(
  landmarks: LandmarkList,
  hand: HandednessLabel,
  gesture: "PistolForward" | "PistolBackward",
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
      gesture,
      data: {},
    };
  }

  if (
    (gesture === "PistolForward" && direction !== "Forward") ||
    (gesture === "PistolBackward" && direction !== "Back")
  ) {
    return {
      detected: false,
      gesture,
      data: {},
    };
  }

  return {
    detected: true,
    gesture,
    data: {
      hand,
    },
  };
}

function createPistolGestureDefinition(
  name: "PistolForward" | "PistolBackward",
  action: GestureAction,
) {
  return {
    name,
    action(): GestureAction {
      return action;
    },
    label(result: GestureDetectionResult<PistolGestureData>) {
      return `${result.data.hand ?? "Unknown"}: ${name}`;
    },
    signature(result: GestureDetectionResult<PistolGestureData>) {
      return [result.gesture, result.data.hand ?? ""].join(":");
    },
    detect({ leftHandLandmarks, rightHandLandmarks }: GestureInput) {
      const gestures: Array<GestureDetectionResult<PistolGestureData>> = [];

      if (leftHandLandmarks) {
        const leftPistol = detectPistolGesture(
          leftHandLandmarks,
          "Left",
          name,
        );

        if (leftPistol.detected) {
          gestures.push(leftPistol);
        }
      }

      if (rightHandLandmarks) {
        const rightPistol = detectPistolGesture(
          rightHandLandmarks,
          "Right",
          name,
        );

        if (rightPistol.detected) {
          gestures.push(rightPistol);
        }
      }

      return gestures;
    },
  };
}

export const pistolForwardGestureDefinition = createPistolGestureDefinition(
  "PistolForward",
  "forward",
);

export const pistolBackwardGestureDefinition = createPistolGestureDefinition(
  "PistolBackward",
  "backward",
);
