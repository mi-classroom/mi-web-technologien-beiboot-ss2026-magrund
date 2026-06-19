export type HandednessLabel = "Left" | "Right";

export type HorizontalDirection = "Forward" | "Back";

export type GestureAction =
  | "forward"
  | "backward"
  | "start"
  | "stop"
  | "up"
  | "down";

export interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export type LandmarkList = ReadonlyArray<Landmark>;

export interface HandednessCategory {
  categoryName?: string;
}

export type Handedness = ReadonlyArray<ReadonlyArray<HandednessCategory>>;

export interface GestureInput {
  leftHandLandmarks: LandmarkList | null;
  rightHandLandmarks: LandmarkList | null;
}

export interface GestureDetectionResult<TData extends object = object> {
  detected: boolean;
  gesture: string;
  data: TData;
}

export interface GestureDefinition<TData extends object = object> {
  name: string;
  action?: (result: GestureDetectionResult<TData>) => GestureAction;
  label?: (result: GestureDetectionResult<TData>) => string;
  signature?: (result: GestureDetectionResult<TData>) => string;
  detect: (input: GestureInput) => Array<GestureDetectionResult<TData>>;
}

export interface GestureRegistry {
  registerGestureDefinition: <TData extends object>(
    definition: GestureDefinition<TData>,
  ) => GestureDefinition<TData>;
  getGestureDefinition: (gestureName: string) => GestureDefinition | null;
  getGestureDefinitions: () => GestureDefinition[];
}

export interface GestureTrackerOptions {
  minDurationMs?: number;
  registry?: GestureRegistry;
}

export interface GestureCounterElements {
  forwardCountElement?: HTMLElement | null;
  backwardCountElement?: HTMLElement | null;
  startCountElement?: HTMLElement | null;
  stopCountElement?: HTMLElement | null;
  upCountElement?: HTMLElement | null;
  downCountElement?: HTMLElement | null;
}

export interface GestureCounterController {
  countGesture: (result: GestureDetectionResult) => void;
}

export interface GestureLogsOptions {
  registry?: GestureRegistry;
}
