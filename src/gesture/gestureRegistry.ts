import type { GestureDefinition, GestureRegistry } from "../types.js";
import { builtinGestureDefinitions } from "./gestureDefinitions.js";

function validateGestureDefinition(definition: GestureDefinition<any>): void {
  if (!definition || typeof definition !== "object") {
    throw new TypeError("Gesture definition must be an object.");
  }

  if (typeof definition.name !== "string" || definition.name.length === 0) {
    throw new TypeError("Gesture definition must have a non-empty name.");
  }

  if (typeof definition.detect !== "function") {
    throw new TypeError(
      `Gesture definition "${definition.name}" must provide a detect function.`,
    );
  }
}

export function createGestureRegistry(
  initialDefinitions: GestureDefinition<any>[] = [],
): GestureRegistry {
  const gestureDefinitions = new Map<string, GestureDefinition<any>>();

  function registerGestureDefinition<TData extends object>(
    definition: GestureDefinition<TData>,
  ): GestureDefinition<TData> {
    validateGestureDefinition(definition);

    gestureDefinitions.set(definition.name, definition);

    return definition;
  }

  for (const definition of initialDefinitions) {
    registerGestureDefinition(definition);
  }

  return {
    registerGestureDefinition,
    getGestureDefinition(gestureName: string) {
      return gestureDefinitions.get(gestureName) ?? null;
    },
    getGestureDefinitions() {
      return Array.from(gestureDefinitions.values());
    },
  };
}

export const defaultGestureRegistry = createGestureRegistry(
  builtinGestureDefinitions,
);

export function registerGestureDefinition<TData extends object>(
  definition: GestureDefinition<TData>,
): GestureDefinition<TData> {
  return defaultGestureRegistry.registerGestureDefinition(definition);
}

export function getGestureDefinition(
  gestureName: string,
): GestureDefinition | null {
  return defaultGestureRegistry.getGestureDefinition(gestureName);
}

export function getGestureDefinitions(): GestureDefinition[] {
  return defaultGestureRegistry.getGestureDefinitions();
}
