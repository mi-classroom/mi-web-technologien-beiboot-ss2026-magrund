import { Gestures } from "./gesture/GestureType.js";

export interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export type LandmarkList = Landmark[];

export interface GestureInput {
  leftHandLandmarks?: LandmarkList | null;
  rightHandLandmarks?: LandmarkList | null;
}

export interface GestureRepeatConfiguration {
  enabled: boolean;
  intervalMs: number;
}

export interface GestureConfiguration {
  enabled: boolean;
  minDurationMs: number;

  repeat?: GestureRepeatConfiguration;
}

export type GestureType =
  (typeof Gestures)[keyof typeof Gestures];

export interface GestureDetectionResult {
  type: GestureType;
}

export type GesturePhase =
  | "start"
  | "hold";

export interface GestureEvent {
  type: GestureType;
  phase: GesturePhase;
  durationMs: number;
}
