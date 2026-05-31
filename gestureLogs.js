export function createGestureLogsController(detectHandGestures, logsController, options = {}) {
  const state = {
    stableGestureSignature: "",
    stableGestureSince: 0,
    stableGestureFrames: 0,
    stableGestureLogged: false
  };

  const gestureMinFrames = options.gestureMinFrames ?? 8;
  const gestureMinDurationMs = options.gestureMinDurationMs ?? 500;

  function updateGestureLogs(leftHandLandmarks, rightHandLandmarks, now) {
    const gestureMessages = [];

    if (leftHandLandmarks) {
      gestureMessages.push(...detectHandGestures(leftHandLandmarks, "Links"));
    }

    if (rightHandLandmarks) {
      gestureMessages.push(...detectHandGestures(rightHandLandmarks, "Rechts"));
    }

    const gestureSignature = gestureMessages.join(" | ");

    if (!gestureSignature) {
      state.stableGestureSignature = "";
      state.stableGestureSince = 0;
      state.stableGestureFrames = 0;
      state.stableGestureLogged = false;
      return;
    }

    if (gestureSignature !== state.stableGestureSignature) {
      state.stableGestureSignature = gestureSignature;
      state.stableGestureSince = now;
      state.stableGestureFrames = 1;
      state.stableGestureLogged = false;
      return;
    }

    state.stableGestureFrames += 1;

    if (
      !state.stableGestureLogged &&
      state.stableGestureFrames >= gestureMinFrames &&
      now - state.stableGestureSince >= gestureMinDurationMs
    ) {
      state.stableGestureLogged = true;
      logsController.appendLog(gestureMessages.join("; "));
    }
  }

  return {
    updateGestureLogs
  };
}