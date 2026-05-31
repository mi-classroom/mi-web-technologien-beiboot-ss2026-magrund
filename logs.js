export function createLogsController(logsElement) {
  const logs = [];

  function renderLogs() {
    logsElement.textContent = logs.join("\n");
  }

  function appendLog(message) {
    const timeStamp = new Date().toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    logs.unshift(`[${timeStamp}] ${message}`);
    renderLogs();
  }

  function clearLogs() {
    logs.length = 0;
    renderLogs();
  }

  return {
    appendLog,
    clearLogs
  };
}