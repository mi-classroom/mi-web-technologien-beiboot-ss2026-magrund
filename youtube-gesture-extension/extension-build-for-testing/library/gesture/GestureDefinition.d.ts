import type { GestureConfiguration, GestureDetectionResult, GestureInput } from "../types.js";
import type { GestureType } from "./GestureType.js";
export interface GestureDefinition {
    readonly type: GestureType;
    readonly defaultConfiguration: GestureConfiguration;
    detect(input: GestureInput): GestureDetectionResult | null;
}
//# sourceMappingURL=GestureDefinition.d.ts.map