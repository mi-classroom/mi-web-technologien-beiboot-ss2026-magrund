import { isFingerExtended, isThumbUp } from "../gestureCalculator.js";

function detectSingleThumbsUpGesture(landmarks) {
  const thumbUp = isThumbUp(landmarks);

  const thumbTip = landmarks[4];
  const thumbMcp = landmarks[2];

  const thumbClearlyExtended = thumbTip.y < thumbMcp.y - 0.03;

  const fingersClosed =
    !isFingerExtended(landmarks, 8, 6) &&
    !isFingerExtended(landmarks, 12, 10) &&
    !isFingerExtended(landmarks, 16, 14) &&
    !isFingerExtended(landmarks, 20, 18);

  const detected = thumbUp && thumbClearlyExtended && fingersClosed;

  return {
    detected,
    gesture: "ThumbsUp",
    data: {},
  };
}

export function detectThumbsUpGesture(leftLandmarks, rightLandmarks) {
  if (!leftLandmarks || !rightLandmarks) {
    return {
      detected: false,
      gesture: "ThumbsUp",
      data: {},
    };
  }

  const leftThumbsUp = detectSingleThumbsUpGesture(leftLandmarks);
  const rightThumbsUp = detectSingleThumbsUpGesture(rightLandmarks);

  return {
    detected: leftThumbsUp.detected && rightThumbsUp.detected,
    gesture: "ThumbsUp",
    data: {},
  };
}
