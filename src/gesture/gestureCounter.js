function getGestureAction(result) {
  if (result.gesture === "Pistol") {
    return result.data.direction === "Forward"
      ? "forward"
      : "backward";
  }

  if (result.gesture === "ThumbsUp") {
    return "start";
  }

  if (result.gesture === "CrossedIndex") {
    return "stop";
  }

  return null;
}

export function createGestureCounterController(elements) {
  const state = {
    counts: {
      forward: 0,
      backward: 0,
      start: 0,
      stop: 0
    }
  };

  function renderCounts() {
    if (elements.forwardCountElement) {
      elements.forwardCountElement.textContent =
        String(state.counts.forward);
    }

    if (elements.backwardCountElement) {
      elements.backwardCountElement.textContent =
        String(state.counts.backward);
    }

    if (elements.startCountElement) {
      elements.startCountElement.textContent =
        String(state.counts.start);
    }

    if (elements.stopCountElement) {
      elements.stopCountElement.textContent =
        String(state.counts.stop);
    }
  }

  function countGesture(result) {
    const action =
      getGestureAction(result);

    if (!action) {
      return;
    }

    state.counts[action] += 1;

    renderCounts();
  }

  renderCounts();

  return {
    countGesture
  };
}