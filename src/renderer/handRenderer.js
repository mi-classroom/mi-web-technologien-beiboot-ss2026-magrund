import { HandLandmarker } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";

const HAND_COLORS = {
  Left: "#ff0000",
  Right: "#ffea00",
};

export function createHandRenderer(ctx, canvas) {
  const px = (lm) => lm.x * canvas.width;
  const py = (lm) => lm.y * canvas.height;

  function draw(allLandmarks, handedness) {
    ctx.shadowColor = "#000000";
    ctx.shadowBlur = 8;
    ctx.font = "bold 16px Arial";

    for (let hi = 0; hi < allLandmarks.length; hi += 1) {
      const landmarks = allLandmarks[hi];

      const label = handedness[hi]?.[0]?.categoryName ?? "Left";

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
