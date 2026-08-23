import { Gestures } from "../GestureType.js";
import { isFingerExtended, isFingerPointingUp } from "../../math/handMath.js";
function detect(input) {
    const { leftHandLandmarks, rightHandLandmarks, } = input;
    if (!leftHandLandmarks || !rightHandLandmarks) {
        return null;
    }
    const leftDetected = isFingerExtended(leftHandLandmarks, 8, 6) &&
        isFingerExtended(leftHandLandmarks, 12, 10) &&
        isFingerPointingUp(leftHandLandmarks, 8, 6) &&
        isFingerPointingUp(leftHandLandmarks, 12, 10) &&
        !isFingerExtended(leftHandLandmarks, 16, 14) &&
        !isFingerExtended(leftHandLandmarks, 20, 18);
    const rightDetected = isFingerExtended(rightHandLandmarks, 8, 6) &&
        isFingerExtended(rightHandLandmarks, 12, 10) &&
        isFingerPointingUp(rightHandLandmarks, 8, 6) &&
        isFingerPointingUp(rightHandLandmarks, 12, 10) &&
        !isFingerExtended(rightHandLandmarks, 16, 14) &&
        !isFingerExtended(rightHandLandmarks, 20, 18);
    if (!leftDetected || !rightDetected) {
        return null;
    }
    return {
        type: Gestures.twoFingersUp,
    };
}
export const twoFingersUpGesture = {
    type: Gestures.twoFingersUp,
    defaultConfiguration: {
        enabled: true,
        minDurationMs: 500,
        repeat: {
            enabled: true,
            intervalMs: 250,
        },
    },
    detect,
};
//# sourceMappingURL=twoFingersUpGesture.js.map