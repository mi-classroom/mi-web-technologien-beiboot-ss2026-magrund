import type { GestureDetectionResult, GestureLogsOptions } from "../types.js";
import { defaultGestureRegistry } from "../gesture/gestureRegistry.js";

function formatGestureLog(
  result: GestureDetectionResult,
  registry = defaultGestureRegistry,
): string {
  const definition = registry.getGestureDefinition(result.gesture);

  if (!definition || !definition.label) {
    return result.gesture;
  }

  return definition.label(result);
}

export function createLogsController(
  logsElement: HTMLElement | null,
  options: GestureLogsOptions = {},
) {
  const registry = options.registry ?? defaultGestureRegistry;
  const logs: string[] = [];

  function renderLogs(): void {
    if (!logsElement) {
      return;
    }

    logsElement.textContent = logs.join("\n");
  }

  function appendLog(result: GestureDetectionResult): void {
    const timestamp = new Date().toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    logs.unshift(`[${timestamp}] ${formatGestureLog(result, registry)}`);

    renderLogs();
  }

  return {
    appendLog,
  };
}
