import { detectPistolGesture }
  from "./gestures/pistolGesture.js";

import { detectThumbsUpGesture }
  from "./gestures/thumbsUpGesture.js";

import { detectCrossedIndexGesture }
  from "./gestures/crossIndexFingerGesture.js";

export function detectGestures(
  leftHandLandmarks,
  rightHandLandmarks
) {
  const gestures = [];

  if (leftHandLandmarks) {
    const result =
      detectPistolGesture(
        leftHandLandmarks,
        "Left"
      );

    if (result.detected) {
      gestures.push(result);
    }
  }

  if (rightHandLandmarks) {
    const result =
      detectPistolGesture(
        rightHandLandmarks,
        "Right"
      );

    if (result.detected) {
      gestures.push(result);
    }
  }

  if (
    leftHandLandmarks &&
    rightHandLandmarks
  ) {
    const leftThumbsUp =
      detectThumbsUpGesture(
        leftHandLandmarks
      );

    const rightThumbsUp =
      detectThumbsUpGesture(
        rightHandLandmarks
      );

    if (
      leftThumbsUp.detected &&
      rightThumbsUp.detected
    ) {
      gestures.push({
        detected: true,
        gesture: "ThumbsUp",
        data: {}
      });
    }

    const crossedIndex =
      detectCrossedIndexGesture(
        leftHandLandmarks,
        rightHandLandmarks
      );

    if (crossedIndex.detected) {
      gestures.push(crossedIndex);
    }
  }

  return gestures;
}