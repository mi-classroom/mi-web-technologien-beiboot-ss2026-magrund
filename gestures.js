import {
  areFingertipsClose,
  distance,
  getHorizontalDirection,
  isFingerExtended,
  isThumbExtended,
  isThumbUp,
  segmentsIntersect
} from "./gestureCalculator.js";

function classifyHandGesture(landmarks) {
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
    return "Pistole";
  }

  return "";
}

function describeDirection(landmarks) {
  return getHorizontalDirection(landmarks);
}

export function detectHandGestures(landmarks, handLabel) {
  const gesture = classifyHandGesture(landmarks);

  if (!gesture) {
    return [];
  }

  const direction = describeDirection(landmarks);

  if (!direction) {
    return [];
  }

  const results = [];
  results.push(`${handLabel}: ${gesture} (${direction})`);

  return results;
}

function isThumbsUpHand(landmarks) {
  const thumbUp = isThumbUp(landmarks);
  const indexClosed = !isFingerExtended(landmarks, 8, 6);
  const middleClosed = !isFingerExtended(landmarks, 12, 10);
  const ringClosed = !isFingerExtended(landmarks, 16, 14);
  const pinkyClosed = !isFingerExtended(landmarks, 20, 18);
  const thumbTip = landmarks[4];
  const thumbMcp = landmarks[2];
  const thumbClearlyExtended = thumbTip.y < thumbMcp.y - 0.03;

  return thumbUp && thumbClearlyExtended && indexClosed && middleClosed && ringClosed && pinkyClosed;
}

function areIndexFingersCrossed(leftLandmarks, rightLandmarks) {
  if (!leftLandmarks || !rightLandmarks) {
    return false;
  }

  const leftIndexMcp = leftLandmarks[5];
  const leftIndexTip = leftLandmarks[8];
  const rightIndexMcp = rightLandmarks[5];
  const rightIndexTip = rightLandmarks[8];

  if (!leftIndexMcp || !leftIndexTip || !rightIndexMcp || !rightIndexTip) {
    return false;
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

  return leftIndexExtended && rightIndexExtended && otherLeftClosed && otherRightClosed && fingersCrossed && tipsClose;
}

export function createStartStopGestureController(logsController, options = {}) {
  const state = {
    startActive: false,
    startFrames: 0,
    startSince: 0,
    startLogged: false,
    stopActive: false,
    stopFrames: 0,
    stopSince: 0,
    stopLogged: false
  };

  const gestureMinFrames = options.gestureMinFrames ?? 8;
  const gestureMinDurationMs = options.gestureMinDurationMs ?? 500;
  const onLog = options.onLog;

  function emitLog(message) {
    logsController.appendLog(message);

    if (typeof onLog === "function") {
      onLog(message);
    }
  }

  function updateStartStopGestures(_poseLandmarks, leftHandLandmarks, rightHandLandmarks, now) {
    const startCondition = !!leftHandLandmarks && !!rightHandLandmarks && isThumbsUpHand(leftHandLandmarks) && isThumbsUpHand(rightHandLandmarks);
    const stopCondition = !!leftHandLandmarks && !!rightHandLandmarks && areIndexFingersCrossed(leftHandLandmarks, rightHandLandmarks);

    if (startCondition) {
      if (!state.startActive) {
        state.startActive = true;
        state.startFrames = 1;
        state.startSince = now;
        state.startLogged = false;
        return;
      }

      state.startFrames += 1;

      if (
        !state.startLogged &&
        state.startFrames >= gestureMinFrames &&
        now - state.startSince >= gestureMinDurationMs
      ) {
        emitLog("Start");
        state.startLogged = true;
      }

      return;
    }

    state.startActive = false;
    state.startFrames = 0;
    state.startSince = 0;
    state.startLogged = false;

    if (stopCondition) {
      if (!state.stopActive) {
        state.stopActive = true;
        state.stopFrames = 1;
        state.stopSince = now;
        state.stopLogged = false;
        return;
      }

      state.stopFrames += 1;

      if (
        !state.stopLogged &&
        state.stopFrames >= gestureMinFrames &&
        now - state.stopSince >= gestureMinDurationMs
      ) {
        emitLog("Stop");
        state.stopLogged = true;
      }

      return;
    }

    state.stopActive = false;
    state.stopFrames = 0;
    state.stopSince = 0;
    state.stopLogged = false;
  }

  return {
    updateStartStopGestures
  };
}