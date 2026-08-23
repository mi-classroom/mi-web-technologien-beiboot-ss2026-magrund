import { Gestures } from "../GestureType.js";
import { segmentsIntersect } from "../../math/handMath.js";
function detect(input) {
    const { leftHandLandmarks, rightHandLandmarks, } = input;
    if (!leftHandLandmarks || !rightHandLandmarks) {
        return null;
    }
    const leftIndexMcp = leftHandLandmarks[5];
    const leftIndexTip = leftHandLandmarks[8];
    const rightIndexMcp = rightHandLandmarks[5];
    const rightIndexTip = rightHandLandmarks[8];
    if (!leftIndexMcp ||
        !leftIndexTip ||
        !rightIndexMcp ||
        !rightIndexTip) {
        return null;
    }
    const detected = segmentsIntersect(leftIndexMcp, leftIndexTip, rightIndexMcp, rightIndexTip);
    if (!detected) {
        return null;
    }
    return {
        type: Gestures.crossIndexFinger,
    };
}
export const crossIndexFingerGesture = {
    type: Gestures.crossIndexFinger,
    defaultConfiguration: {
        enabled: false,
        minDurationMs: 300,
        repeat: {
            enabled: false,
            intervalMs: 0,
        },
    },
    detect,
};
//# sourceMappingURL=crossIndexFingerGesture.js.map