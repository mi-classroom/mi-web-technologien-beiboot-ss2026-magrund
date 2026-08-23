# First Hand Gestures

- Status: accepted
- Workload: 10h
- Decider: [Marcel Grund](https://github.com/MaGrund)
- Issue: [2](https://github.com/mi-classroom/mi-web-technologien-beiboot-ss2026-magrund/issues/2)
- Date: 2026-06-02

## Context and Problem Statement

The task was to create and document a mapping table for at least 8 hand gestures. After that, two of those gestures had to be selected and implemented.

## Mapping table

- [Mapping Table](/old/Hand-Gestures.md)

## Chosen Gestures

The chosen gestures are mostly static gestures without movement. During testing, motion-based gestures often resulted in false positives or gestures not being detected correctly. Because of that, the goal was to use uncommon but stable gestures.

Some common gestures were modified by requiring two hands, multiple taps, or holding the gesture for a certain amount of time. This may help to reduce accidental detections.

Another goal was to make the gestures usable in both near and far camera situations.

Additionally, every finger is checked, not only the important ones. This helps prevent false positives caused by similar hand positions.

The selected gestures were:

- Next / Back
- Start / Stop

## Detection

All gestures must be held for at least 15 frames and 1000ms.

These values were chosen through testing because they reduced false positives while still feeling responsive and not too slow.

## Pistol

The “Pistol” gesture is used for the **Next/Back** action and is detected when:

- The thumb is extended upward
- The index finger is extended
- The middle finger is extended
- The ring finger and pinky are folded
- The index and middle fingertips are close together

Additionally, the thumb must pass a minimum vertical threshold:

- thumbTip.y < thumbMcp.y - 0.03

This improves robustness against small hand movements and tracking noise.

The fingertip distance is normalized relative to the hand size:

- distance(indexTip, middleTip) <= handScale \* 0.35

The hand scale is calculated using the distance between the wrist and the middle finger MCP joint. This allows the gesture to work with different hand sizes and camera distances.

The horizontal direction is detected by comparing the fingertip center with the base finger joints:

- Movements below 0.04 are ignored
- Positive movement is classified as "Back"
- Negative movement is classified as "Forward"

Both hands can be used for both sides.

## Start

The “Start” gesture requires both hands to show a thumbs-up gesture at the same time.

For each hand:

- The thumb must point upward
- The thumb must be clearly extended
- All other fingers must be folded

Using both hands makes accidental triggering much less likely.

## Stop

The “Stop” gesture is detected when:

- Both index fingers are extended
- All other fingers are folded
- The two index fingers intersect
- The fingertips are spatially close together

The following threshold is used:

- distance(leftIndexTip, rightIndexTip) <= maxFingerLength \* 0.9

This prevents false detections when fingers only visually overlap without intentionally crossing.

## Logging

For testing and debugging, internal gesture states are tracked:

- Whether the gesture is currently active
- Number of consecutive frames
- Activation timestamp
- Whether the gesture was already logged

This helped analyze unstable detections and improve gesture reliability.

## False-Positive and Stabilisation

Gesture stabilisation is done by checking the gesture for 15 frames and 1000 ms.

One issue appears with the pistol gesture when only one hand is visible. In some cases, the MediaPipe model incorrectly detects two hands on the same visible hand, which can lead to wrong or duplicate detections. However, this is usually not a major problem because the triggered action is still mostly correct.

Another small issue appears with the Stop gesture. The index finger positioned behind the other index finger is sometimes tracked less accurately because of partial occlusion. This can slightly delay the gesture detection in some situations. However, overall the Stop gesture is still detected reliably in most normal use cases.

There is also a general limitation when body parts are only partially visible, especially hands.

Additionally, it was noticed that the frame numbers dropped from around 15–20 frames to about 7 frames when the browser developer tools were opened.

Despite these limitations, the gesture recognition works reliably in most normal presentation situations.

## Links

No links
