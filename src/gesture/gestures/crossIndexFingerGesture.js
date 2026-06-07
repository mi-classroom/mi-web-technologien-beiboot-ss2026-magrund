import {
  distance,
  isFingerExtended,
  segmentsIntersect
} from "../gestureCalculator.js";

export function detectCrossedIndexGesture(
  leftLandmarks,
  rightLandmarks
) {
  if (!leftLandmarks || !rightLandmarks) {
    return {
      detected: false,
      gesture: "CrossedIndex",
      data: {}
    };
  }

  const leftIndexMcp = leftLandmarks[5];
  const leftIndexTip = leftLandmarks[8];

  const rightIndexMcp = rightLandmarks[5];
  const rightIndexTip = rightLandmarks[8];

  if (
    !leftIndexMcp ||
    !leftIndexTip ||
    !rightIndexMcp ||
    !rightIndexTip
  ) {
    return {
      detected: false,
      gesture: "CrossedIndex",
      data: {}
    };
  }

  const leftIndexExtended =
    isFingerExtended(leftLandmarks, 8, 6);

  const rightIndexExtended =
    isFingerExtended(rightLandmarks, 8, 6);

  const otherLeftClosed =
    !isFingerExtended(leftLandmarks, 12, 10) &&
    !isFingerExtended(leftLandmarks, 16, 14) &&
    !isFingerExtended(leftLandmarks, 20, 18);

  const otherRightClosed =
    !isFingerExtended(rightLandmarks, 12, 10) &&
    !isFingerExtended(rightLandmarks, 16, 14) &&
    !isFingerExtended(rightLandmarks, 20, 18);

  const fingersCrossed =
    segmentsIntersect(
      leftIndexMcp,
      leftIndexTip,
      rightIndexMcp,
      rightIndexTip
    );

  const tipsClose =
    distance(leftIndexTip, rightIndexTip) <=
    Math.max(
      distance(leftIndexMcp, leftIndexTip),
      distance(rightIndexMcp, rightIndexTip)
    ) * 0.9;

  const detected =
    leftIndexExtended &&
    rightIndexExtended &&
    otherLeftClosed &&
    otherRightClosed &&
    fingersCrossed &&
    tipsClose;

  return {
    detected,
    gesture: "CrossedIndex",
    data: {}
  };
}