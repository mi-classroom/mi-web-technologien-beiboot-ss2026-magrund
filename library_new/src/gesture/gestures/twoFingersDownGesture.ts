import type {
    GestureDetectionResult,
    GestureInput,
} from "../../types.js";

import { Gestures } from "../GestureType.js";
import { isFingerExtended, isFingerPointingDown } from "../../math/handMath.js"
import { GestureDefinition } from "../GestureDefinition.js";

function detect(input: GestureInput): GestureDetectionResult | null {
    const { leftHandLandmarks, rightHandLandmarks } = input;

    if (!leftHandLandmarks || !rightHandLandmarks) {
        return null;
    }

    const leftDetected =
        isFingerExtended(leftHandLandmarks, 8, 6) &&
        isFingerExtended(leftHandLandmarks, 12, 10) &&
        isFingerPointingDown(leftHandLandmarks, 8, 6) &&
        isFingerPointingDown(leftHandLandmarks, 12, 10) &&
        !isFingerExtended(leftHandLandmarks, 16, 14) &&
        !isFingerExtended(leftHandLandmarks, 20, 18);

    const rightDetected =
        isFingerExtended(rightHandLandmarks, 8, 6) &&
        isFingerExtended(rightHandLandmarks, 12, 10) &&
        isFingerPointingDown(rightHandLandmarks, 8, 6) &&
        isFingerPointingDown(rightHandLandmarks, 12, 10) &&
        !isFingerExtended(rightHandLandmarks, 16, 14) &&
        !isFingerExtended(rightHandLandmarks, 20, 18);

    if (!leftDetected || !rightDetected) {
        return null;
    }

    return {
        type: Gestures.twoFingersDown,
    };
}

export const twoFingersDownGesture: GestureDefinition = {
    type: Gestures.twoFingersDown,

    defaultConfiguration: {
        enabled: true,
        minDurationMs: 500,
    },

    detect,
};