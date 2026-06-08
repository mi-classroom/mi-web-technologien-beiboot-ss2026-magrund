import { getGestureDefinition } from "../gesture/index.js";

function formatGestureLog(result) {
  const definition = getGestureDefinition(result.gesture);

  if (!definition || !definition.label) {
    return result.gesture;
  }

  return definition.label(result);
}

export function createLogsController(logsElement) {
  const logs = [];

  function renderLogs() {
    logsElement.textContent = logs.join("\n");
  }

  function appendLog(result) {
    const timestamp = new Date().toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    logs.unshift(`[${timestamp}] ${formatGestureLog(result)}`);

    renderLogs();
  }

  return {
    appendLog,
  };
}
