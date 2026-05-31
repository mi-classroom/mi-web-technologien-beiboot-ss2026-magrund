function getGestureAction(gestureMessage) {
  if (gestureMessage.includes("Pistole (links)")) {
    return "vor";
  }

  if (gestureMessage.includes("Pistole (rechts)")) {
    return "zurueck";
  }

  return "";
}

export function createGestureCounterController(elements) {
  const state = {
    counts: {
      vor: 0,
      zurueck: 0
    }
  };

  function renderCounts() {
    if (elements.forwardCountElement) {
      elements.forwardCountElement.textContent = String(state.counts.vor);
    }

    if (elements.backwardCountElement) {
      elements.backwardCountElement.textContent = String(state.counts.zurueck);
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