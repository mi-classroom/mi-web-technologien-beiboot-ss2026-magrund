import { PoseLandmarker } from "@mediapipe/tasks-vision";
import type { LandmarkList } from "../types.js";

function segmentColor(index: number): string {
  if (index <= 10) return "#4fc3f7";
  if (index <= 22) return "#00ff88";
  return "#ffb300";
}

export function createPoseRenderer(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const px = (lm: LandmarkList[number]) => lm.x * canvas.width;
  const py = (lm: LandmarkList[number]) => lm.y * canvas.height;

  function draw(landmarks: LandmarkList): void {
    ctx.lineWidth = 4;

    for (const conn of PoseLandmarker.POSE_CONNECTIONS) {
      const a = landmarks[conn.start];
      const b = landmarks[conn.end];

      if (!a || !b) continue;
      if ((a.visibility ?? 0) < 0.5 || (b.visibility ?? 0) < 0.5) continue;

      ctx.strokeStyle = segmentColor(conn.start);

      ctx.beginPath();
      ctx.moveTo(px(a), py(a));
      ctx.lineTo(px(b), py(b));
      ctx.stroke();
    }

    ctx.font = "bold 16px Arial";

    for (let i = 0; i < landmarks.length; i += 1) {
      const lm = landmarks[i];

      if (!lm || (lm.visibility ?? 0) < 0.5) continue;

      const x = px(lm);
      const y = py(lm);

      ctx.fillStyle = segmentColor(i);

      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();

      ctx.translate(x, y);
      ctx.scale(-1, 1);

      ctx.fillStyle = "#ffffff";
      ctx.fillText(String(i), -7, 4);

      ctx.restore();
    }
  }

  return {
    draw,
  };
}
