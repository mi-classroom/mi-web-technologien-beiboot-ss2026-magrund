import type { LandmarkList } from "../types.js";

function visibilityIcon(visibility?: number): string {
  if ((visibility ?? 0) > 0.8) return "🟢";

  if ((visibility ?? 0) > 0.4) return "🟠";

  return "🔴";
}

function formatLandmark(
  name: string,
  landmark: LandmarkList[number] | undefined,
): string {
  const x = landmark?.x.toFixed(2) ?? "n/a";
  const y = landmark?.y.toFixed(2) ?? "n/a";
  const visibility = landmark?.visibility?.toFixed(2) ?? "n/a";

  return `${visibilityIcon(landmark?.visibility)} ${name}\nx:${x}\ny:${y}\nv:${visibility}`;
}

function formatAlignedPair(leftText: string, rightText: string): string {
  const leftLines = leftText.split("\n");
  const rightLines = rightText.split("\n");

  return leftLines
    .map((line, index) => {
      return line.padEnd(28) + (rightLines[index] ?? "");
    })
    .join("\n");
}

export function formatBodyData(landmarks: LandmarkList): string {
  return `${formatLandmark("Nose", landmarks[0])}
${formatAlignedPair(formatLandmark("L Shoulder", landmarks[11]), formatLandmark("R Shoulder", landmarks[12]))}

${formatAlignedPair(formatLandmark("L Elbow", landmarks[13]), formatLandmark("R Elbow", landmarks[14]))}

${formatAlignedPair(formatLandmark("L Hand", landmarks[15]), formatLandmark("R Hand", landmarks[16]))}

${formatAlignedPair(formatLandmark("L Hip", landmarks[23]), formatLandmark("R Hip", landmarks[24]))}

${formatAlignedPair(formatLandmark("L Knee", landmarks[25]), formatLandmark("R Knee", landmarks[26]))}

${formatAlignedPair(formatLandmark("L Foot", landmarks[27]), formatLandmark("R Foot", landmarks[28]))}
`;
}

export function formatHandData(landmarks: LandmarkList): string {
  const labels = ["Wrist", "Thumb", "Index", "Middle", "Ring", "Pinky"];

  return landmarks
    .slice(0, 6)
    .map((landmark, index) => {
      return `${labels[index]}\nx:${landmark?.x.toFixed(2) ?? "n/a"}\ny:${landmark?.y.toFixed(2) ?? "n/a"}\nz:${landmark?.z?.toFixed(2) ?? "n/a"}`;
    })
    .join("\n\n");
}
