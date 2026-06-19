import { HandLandmarker } from "@mediapipe/tasks-vision";
import type { Handedness, HandednessLabel, LandmarkList } from "../types.js";

const HAND_COLORS: Record<HandednessLabel, string> = {
  Left: "#ff0000",
  Right: "#ffea00",
};

function getHandLabel(value: Handedness[number] | undefined): HandednessLabel {
  return value?.[0]?.categoryName === "Right" ? "Right" : "Left";
}

export function createHandRenderer(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const px = (lm: LandmarkList[number]) => lm.x * canvas.width;
  const py = (lm: LandmarkList[number]) => lm.y * canvas.height;

  function draw(allLandmarks: ReadonlyArray<LandmarkList>, handedness: Handedness): void {
    ctx.shadowColor = "#000000";
    ctx.shadowBlur = 8;
    ctx.font = "bold 16px Arial";

    for (let hi = 0; hi < allLandmarks.length; hi += 1) {
      const landmarks = allLandmarks[hi];

      if (!landmarks) {
        continue;
      }

      const label = getHandLabel(handedness[hi]);
      const color = HAND_COLORS[label] ?? "#ff0000";

      ctx.strokeStyle = color;
      ctx.lineWidth = 4;

      for (const conn of HandLandmarker.HAND_CONNECTIONS) {
        const a = landmarks[conn.start];
        const b = landmarks[conn.end];

        if (!a || !b) continue;

        ctx.beginPath();
        ctx.moveTo(px(a), py(a));
        ctx.lineTo(px(b), py(b));
        ctx.stroke();
      }

      for (let i = 0; i < landmarks.length; i += 1) {
        const lm = landmarks[i];

        if (!lm) continue;

        const x = px(lm);
        const y = py(lm);

        ctx.fillStyle = color;

        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();

        ctx.translate(x, y);
        ctx.scale(-1, 1);

        ctx.fillStyle = "#ffffff";
        ctx.fillText(String(i), -5, 4);

        ctx.restore();
      }
    }
  }

  return {
    draw,
  };
}
