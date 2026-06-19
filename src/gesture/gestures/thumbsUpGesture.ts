import type { GestureAction, GestureDetectionResult, LandmarkList } from "../../types.js";
import type { GestureInput } from "../../types.js";
import { distance } from "../gestureCalculator.js";
import { isFingerExtended, isThumbUp } from "../gestureCalculator.js";

function detectSingleThumbsUpGesture(landmarks: LandmarkList): GestureDetectionResult {
  const thumbUp = isThumbUp(landmarks);

  const thumbTip = landmarks[4];
  const thumbMcp = landmarks[2];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  const wrist = landmarks[0];

  if (!thumbTip || !thumbMcp || !indexTip || !middleTip || !ringTip || !pinkyTip || !wrist) {
    return {
      detected: false,
      gesture: "ThumbsUp",
      data: {},
    };
  }

  const thumbClearlyExtended = thumbTip.y < thumbMcp.y - 0.03;
  const handScale = distance(wrist, thumbMcp);
  const thumbAwayFromOtherFingers =
    thumbTip.y < Math.min(indexTip.y, middleTip.y, ringTip.y, pinkyTip.y) - 0.1 &&
    distance(thumbTip, indexTip) > handScale * 0.35 &&
    distance(thumbTip, middleTip) > handScale * 0.35;

  const fingersClosed =
    !isFingerExtended(landmarks, 8, 6) &&
    !isFingerExtended(landmarks, 12, 10) &&
    !isFingerExtended(landmarks, 16, 14) &&
    !isFingerExtended(landmarks, 20, 18);

  const detected = thumbUp && thumbClearlyExtended && thumbAwayFromOtherFingers && fingersClosed;

  return {
    detected,
    gesture: "ThumbsUp",
    data: {},
  };
}

export function detectThumbsUpGesture(leftLandmarks?: LandmarkList | null, rightLandmarks?: LandmarkList | null): GestureDetectionResult {
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

export const thumbsUpGestureDefinition = {
  name: "ThumbsUp",
  action(): GestureAction {
    return "start";
  },
  label() {
    return "Start";
  },
  signature(result: GestureDetectionResult) {
    return result.gesture;
  },
  detect({ leftHandLandmarks, rightHandLandmarks }: GestureInput) {
    const thumbsUp = detectThumbsUpGesture(leftHandLandmarks, rightHandLandmarks);

    return thumbsUp.detected ? [thumbsUp] : [];
  },
};
