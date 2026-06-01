export function createGestureLogsController(detectPistolGesture, logsController, options = {}) {
  const state = {
    signature: "",
    since: 0,
    frames: 0,
    logged: false
  };

  const gestureMinFrames = options.gestureMinFrames ?? 8;
  const gestureMinDurationMs = options.gestureMinDurationMs ?? 500;
  const onStableLog = options.onStableLog;

  function resetStableGestureState() {
    state.signature = "";
    state.since = 0;
    state.frames = 0;
    state.logged = false;
  }

  function updateStableGestureState(signature, now, message) {
    if (!signature) {
      resetStableGestureState();
      return;
    }

    if (signature !== state.signature) {
      state.signature = signature;
      state.since = now;
      state.frames = 1;
      state.logged = false;
      return;
    }

    state.frames += 1;

    if (!state.logged && state.frames >= gestureMinFrames && now - state.since >= gestureMinDurationMs) {
      state.logged = true;
      logsController.appendLog(message);

      if (typeof onStableLog === "function") {
        onStableLog(message);
      }
    }
  }

  function updateGestureLogs(leftHandLandmarks, rightHandLandmarks, now) {
    const gestureMessages = [];

    if (leftHandLandmarks) {
      gestureMessages.push(...detectPistolGesture(leftHandLandmarks, "Left"));
    }

    if (rightHandLandmarks) {
      gestureMessages.push(...detectPistolGesture(rightHandLandmarks, "Right"));
    }

    const gestureSignature = gestureMessages.join(" | ");

    updateStableGestureState(gestureSignature, now, gestureMessages.join("; "));
  }

  return {
    updateGestureLogs
  };
}