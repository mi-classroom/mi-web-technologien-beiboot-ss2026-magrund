import { Gestures } from "../GestureType.js";
import { distance, isFingerExtended, isThumbUp, } from "../../math/handMath.js";
function isHandShowingThumbsUp(landmarks) {
    const thumbTip = landmarks[4];
    const thumbMcp = landmarks[2];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    const wrist = landmarks[0];
    if (!thumbTip ||
        !thumbMcp ||
        !indexTip ||
        !middleTip ||
        !ringTip ||
        !pinkyTip ||
        !wrist) {
        return false;
    }
    const thumbClearlyExtended = thumbTip.y < thumbMcp.y - 0.03;
    const handScale = distance(wrist, thumbMcp);
    const thumbAwayFromOtherFingers = thumbTip.y <
        Math.min(indexTip.y, middleTip.y, ringTip.y, pinkyTip.y) - 0.1 &&
        distance(thumbTip, indexTip) > handScale * 0.35 &&
        distance(thumbTip, middleTip) > handScale * 0.35;
    const fingersClosed = !isFingerExtended(landmarks, 8, 6) &&
        !isFingerExtended(landmarks, 12, 10) &&
        !isFingerExtended(landmarks, 16, 14) &&
        !isFingerExtended(landmarks, 20, 18);
    return (isThumbUp(landmarks) &&
        thumbClearlyExtended &&
        thumbAwayFromOtherFingers &&
        fingersClosed);
}
function detect(input) {
    const { leftHandLandmarks, rightHandLandmarks, } = input;
    if (!leftHandLandmarks || !rightHandLandmarks) {
        return null;
    }
    const leftDetected = isHandShowingThumbsUp(leftHandLandmarks);
    const rightDetected = isHandShowingThumbsUp(rightHandLandmarks);
    if (!leftDetected || !rightDetected) {
        return null;
    }
    return {
        type: Gestures.bothThumbsUp,
    };
}
export const bothThumbsUpGesture = {
    type: Gestures.bothThumbsUp,
    defaultConfiguration: {
        enabled: true,
        minDurationMs: 300,
        repeat: {
            enabled: false,
            intervalMs: 0,
        },
    },
    detect,
};
//# sourceMappingURL=bothThumbsUpGesture.js.map