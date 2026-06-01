import {
  areFingertipsClose,
  distance,
  getHorizontalDirection,
  isFingerExtended,
  isThumbUp,
  segmentsIntersect
} from "./gestureCalculator.js";

function buildGestureMessage(handLabel, gestureLabel, direction) {
  return `${handLabel}: ${gestureLabel} (${direction})`;
}

function classifyPistolGesture(landmarks) {
  const thumbExtended = isThumbUp(landmarks);
  const indexExtended = isFingerExtended(landmarks, 8, 6);
  const middleExtended = isFingerExtended(landmarks, 12, 10);
  const ringExtended = isFingerExtended(landmarks, 16, 14);
  const pinkyExtended = isFingerExtended(landmarks, 20, 18);
  const fingertipsClose = areFingertipsClose(landmarks);

  if (
    thumbExtended &&
    indexExtended &&
    middleExtended &&
    fingertipsClose &&
    !ringExtended &&
    !pinkyExtended
  ) {
    return "Pistol";
  }

  return null;
}

function describeDirection(landmarks) {
  return getHorizontalDirection(landmarks);
}

export function detectPistolGesture(landmarks, handLabel) {
  const gesture = classifyPistolGesture(landmarks);

  if (!gesture) {
    return [];
  }

  const direction = describeDirection(landmarks);

  if (!direction) {
    return [];
  }

  return [buildGestureMessage(handLabel, gesture, direction)];
}

function classifyThumbsUpGesture(landmarks) {
  const thumbUp = isThumbUp(landmarks);
  const indexClosed = !isFingerExtended(landmarks, 8, 6);
  const middleClosed = !isFingerExtended(landmarks, 12, 10);
  const ringClosed = !isFingerExtended(landmarks, 16, 14);
  const pinkyClosed = !isFingerExtended(landmarks, 20, 18);
  const thumbTip = landmarks[4];
  const thumbMcp = landmarks[2];
  const thumbClearlyExtended = thumbTip.y < thumbMcp.y - 0.03;

  if (thumbUp && thumbClearlyExtended && indexClosed && middleClosed && ringClosed && pinkyClosed) {
    return "Start";
  }

  return null;
}

function createTimedGestureState() {
  return {
    active: false,
    frames: 0,
    since: 0,
    logged: false
  };
}

function resetTimedGestureState(state) {
  state.active = false;
  state.frames = 0;
  state.since = 0;
  state.logged = false;
}

function updateTimedGestureState(state, isActive, now, minFrames, minDurationMs, message, emitLog) {
  if (isActive) {
    if (!state.active) {
      state.active = true;
      state.frames = 1;
      state.since = now;
      state.logged = false;
      return;
    }

    state.frames += 1;

    if (!state.logged && state.frames >= minFrames && now - state.since >= minDurationMs) {
      emitLog(message);
      state.logged = true;
    }

    return;
  }

  resetTimedGestureState(state);
}

function classifyIndexFingerCrossedGesture(leftLandmarks, rightLandmarks) {
  if (!leftLandmarks || !rightLandmarks) {
    return null;
  }

  const leftIndexMcp = leftLandmarks[5];
  const leftIndexTip = leftLandmarks[8];
  const rightIndexMcp = rightLandmarks[5];
  const rightIndexTip = rightLandmarks[8];

  if (!leftIndexMcp || !leftIndexTip || !rightIndexMcp || !rightIndexTip) {
    return null;
  }

  const leftIndexExtended = isFingerExtended(leftLandmarks, 8, 6);
  const rightIndexExtended = isFingerExtended(rightLandmarks, 8, 6);
  const otherLeftClosed =
    !isFingerExtended(leftLandmarks, 12, 10) &&
    !isFingerExtended(leftLandmarks, 16, 14) &&
    !isFingerExtended(leftLandmarks, 20, 18);
  const otherRightClosed =
    !isFingerExtended(rightLandmarks, 12, 10) &&
    !isFingerExtended(rightLandmarks, 16, 14) &&
    !isFingerExtended(rightLandmarks, 20, 18);
  const fingersCrossed = segmentsIntersect(leftIndexMcp, leftIndexTip, rightIndexMcp, rightIndexTip);
  const tipsClose = distance(leftIndexTip, rightIndexTip) <= Math.max(
    distance(leftIndexMcp, leftIndexTip),
    distance(rightIndexMcp, rightIndexTip)
  ) * 0.9;

  if (leftIndexExtended && rightIndexExtended && otherLeftClosed && otherRightClosed && fingersCrossed && tipsClose) {
    return "Stop";
  }

  return null;
}

export function createStartStopGestureController(logsController, options = {}) {
  const state = {
    start: createTimedGestureState(),
    stop: createTimedGestureState()
  };

  const gestureMinFrames = options.gestureMinFrames ?? 15;
  const gestureMinDurationMs = options.gestureMinDurationMs ?? 1000;
  const onLog = options.onLog;

  function emitLog(message) {
    logsController.appendLog(message);

    if (typeof onLog === "function") {
      onLog(message);
    }
  }

  function updateStartStopGestures(_poseLandmarks, leftHandLandmarks, rightHandLandmarks, now) {
    const hasBothHands = !!leftHandLandmarks && !!rightHandLandmarks;
    const startGesture = hasBothHands
      ? classifyThumbsUpGesture(leftHandLandmarks) && classifyThumbsUpGesture(rightHandLandmarks)
      : null;
    const stopGesture = hasBothHands ? classifyIndexFingerCrossedGesture(leftHandLandmarks, rightHandLandmarks) : null;

    updateTimedGestureState(state.start, !!startGesture, now, gestureMinFrames, gestureMinDurationMs, "Start", emitLog);

    if (startGesture) {
      resetTimedGestureState(state.stop);
      return;
    }

    updateTimedGestureState(state.stop, !!stopGesture, now, gestureMinFrames, gestureMinDurationMs, "Stop", emitLog);
  }

  return {
    updateStartStopGestures
  };
}