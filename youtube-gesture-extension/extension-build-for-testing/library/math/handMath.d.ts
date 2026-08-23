import type { Landmark, LandmarkList } from "../types.js";
export type HorizontalDirection = "Forward" | "Back";
export declare function distance(a: Landmark, b: Landmark): number;
export declare function isFingerExtended(landmarks: LandmarkList, tipIndex: number, pipIndex: number): boolean;
export declare function isThumbUp(landmarks: LandmarkList): boolean;
export declare function isThumbExtended(landmarks: LandmarkList): boolean;
export declare function getHorizontalDirection(landmarks: LandmarkList): HorizontalDirection | "";
export declare function areFingertipsClose(landmarks: LandmarkList): boolean;
export declare function isFingerPointingUp(landmarks: LandmarkList, tipIndex: number, pipIndex: number): boolean;
export declare function isFingerPointingDown(landmarks: LandmarkList, tipIndex: number, pipIndex: number): boolean;
export interface Point2D {
    x: number;
    y: number;
}
export declare function segmentsIntersect(a1: Point2D, a2: Point2D, b1: Point2D, b2: Point2D): boolean;
//# sourceMappingURL=handMath.d.ts.map