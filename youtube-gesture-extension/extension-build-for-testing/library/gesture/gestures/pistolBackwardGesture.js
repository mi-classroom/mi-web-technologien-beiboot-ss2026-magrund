import { Gestures } from "../GestureType.js";
import { areFingertipsClose, getHorizontalDirection, isFingerExtended, isThumbExtended, } from "../../math/handMath.js";
function detect(input) {
    const { leftHandLandmarks, rightHandLandmarks, } = input;
    const landmarks = leftHandLandmarks ?? rightHandLandmarks;
    if (!landmarks) {
        return null;
    }
    const detected = isFingerExtended(landmarks, 8, 6) &&
        isThumbExtended(landmarks) &&
        !isFingerExtended(landmarks, 12, 10) &&
        !isFingerExtended(landmarks, 16, 14) &&
        !isFingerExtended(landmarks, 20, 18) &&
        !areFingertipsClose(landmarks) &&
        getHorizontalDirection(landmarks) === "Back";
    if (!detected) {
        return null;
    }
    return {
        type: Gestures.pistolBackward,
    };
}
export const pistolBackwardGesture = {
    type: Gestures.pistolBackward,
    defaultConfiguration: {
        enabled: true,
        minDurationMs: 300,
        repeat: {
            enabled: true,
            intervalMs: 300,
        },
    },
    detect,
};
//# sourceMappingURL=pistolBackwardGesture.js.map