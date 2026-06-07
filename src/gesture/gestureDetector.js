import { detectPistolGesture } from "./gestures/pistolGesture.js";

import { detectThumbsUpGesture } from "./gestures/thumbsUpGesture.js";

import { detectCrossedIndexGesture } from "./gestures/crossIndexFingerGesture.js";

import { detectFingersUpGesture } from "./gestures/twoFingersUpGesture.js";

import { detectFingersDownGesture } from "./gestures/twoFingersDownGesture.js";

export function detectGestures(leftHandLandmarks, rightHandLandmarks) {
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

  if (leftHandLandmarks && rightHandLandmarks) {
    const leftThumbsUp = detectThumbsUpGesture(leftHandLandmarks);

    const rightThumbsUp = detectThumbsUpGesture(rightHandLandmarks);

    if (leftThumbsUp.detected && rightThumbsUp.detected) {
      gestures.push({
        detected: true,
        gesture: "ThumbsUp",
        data: {},
      });
    }

    const crossedIndex = detectCrossedIndexGesture(
      leftHandLandmarks,
      rightHandLandmarks,
    );

    if (crossedIndex.detected) {
      gestures.push(crossedIndex);
    }

    const leftFingersDown = detectFingersDownGesture(leftHandLandmarks);

    const rightFingerDown = detectFingersDownGesture(rightHandLandmarks);

    if (leftFingersDown.detected && rightFingerDown.detected) {
      gestures.push({
        detected: true,
        gesture: "FingersDown",
        data: {},
      });
    }

    const leftFingersUp = detectFingersUpGesture(leftHandLandmarks);

    const rightFingersUp = detectFingersUpGesture(rightHandLandmarks);

    if (leftFingersUp.detected && rightFingersUp.detected) {
      gestures.push({
        detected: true,
        gesture: "FingersUp",
        data: {},
      });
    }
  }

  return gestures;
}
