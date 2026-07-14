import type {
  GestureDetectionResult,
  GestureInput,
  GestureRegistry,
} from "../types.js";
import { defaultGestureRegistry } from "./gestureRegistry.js";

export function detectGestures(
  leftHandLandmarks: GestureInput["leftHandLandmarks"],
  rightHandLandmarks: GestureInput["rightHandLandmarks"],
  options: { registry?: GestureRegistry } = {},
): GestureDetectionResult[] {
  const registry = options.registry ?? defaultGestureRegistry;
  const gestures: GestureDetectionResult[] = [];
  const input: GestureInput = {
    leftHandLandmarks: leftHandLandmarks ?? null,
    rightHandLandmarks: rightHandLandmarks ?? null,
  };

  for (const gestureDefinition of registry.getGestureDefinitions()) {
    const detectedGestures = gestureDefinition.detect(input);

    gestures.push(...detectedGestures);
  }

  return gestures;
}
