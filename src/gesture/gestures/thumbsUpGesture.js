import { isFingerExtended, isThumbUp } from "../gestureCalculator.js";

export function detectThumbsUpGesture(landmarks) {
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
