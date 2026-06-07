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
    const thumbsUp = detectThumbsUpGesture(leftHandLandmarks, rightHandLandmarks);

    if (thumbsUp.detected) {
      gestures.push(thumbsUp);
    }

    const crossedIndex = detectCrossedIndexGesture(
      leftHandLandmarks,
      rightHandLandmarks,
    );

    if (crossedIndex.detected) {
      gestures.push(crossedIndex);
    }

    const fingersDown = detectFingersDownGesture(
      leftHandLandmarks,
      rightHandLandmarks,
    );

    if (fingersDown.detected) {
      gestures.push(fingersDown);
    }

    const fingersUp = detectFingersUpGesture(leftHandLandmarks, rightHandLandmarks);

    if (fingersUp.detected) {
      gestures.push(fingersUp);
    }
  }

  return gestures;
}
