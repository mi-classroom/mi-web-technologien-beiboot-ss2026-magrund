export const Gestures = {
  pistolForward: "pistolForward",
  pistolBackward: "pistolBackward",

  bothThumbsUp: "bothThumbsUp",

  twoFingersUp: "twoFingersUp",
  twoFingersDown: "twoFingersDown",

  crossIndexFinger: "crossIndexFinger",
} as const;

export type GestureType = (typeof Gestures)[keyof typeof Gestures];