function getGestureAction(gestureMessage) {
  if (gestureMessage.includes("Pistole (links)")) {
    return "vor";
  }

  if (gestureMessage.includes("Pistole (rechts)")) {
    return "zurueck";
  }

  if (gestureMessage.startsWith("Start")) {
    return "start";
  }

  if (gestureMessage.startsWith("Stop")) {
    return "stop";
  }

  return "";
}

export function createGestureCounterController(elements) {
  const state = {
    counts: {
      vor: 0,
      zurueck: 0,
      start: 0,
      stop: 0
    }
  };

  function renderCounts() {
    if (elements.forwardCountElement) {
      elements.forwardCountElement.textContent = String(state.counts.vor);
    }

    if (elements.backwardCountElement) {
      elements.backwardCountElement.textContent = String(state.counts.zurueck);
    }

    if (elements.startCountElement) {
      elements.startCountElement.textContent = String(state.counts.start);
    }

    if (elements.stopCountElement) {
      elements.stopCountElement.textContent = String(state.counts.stop);
    }
  }

  function countLog(message) {
    const action = getGestureAction(message);

    if (!action) {
      return;
    }

    state.counts[action] += 1;
    renderCounts();
  }

  renderCounts();

  return {
    countLog
  };
}