function formatGestureLog(result) {
  switch (result.gesture) {
    case "Pistol":
      return `${result.data.hand}: Pistol (${result.data.direction})`;

    case "ThumbsUp":
      return "Start";

    case "CrossedIndex":
      return "Stop";

    default:
      return result.gesture;
  }
}

export function createLogsController(logsElement) {
  const logs = [];

  function renderLogs() {
    logsElement.textContent =
      logs.join("\n");
  }

  function appendLog(result) {
    const timestamp =
      new Date().toLocaleTimeString(
        "de-DE",
        {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        }
      );

    logs.unshift(
      `[${timestamp}] ${formatGestureLog(result)}`
    );

    renderLogs();
  }

  return {
    appendLog
  };
}