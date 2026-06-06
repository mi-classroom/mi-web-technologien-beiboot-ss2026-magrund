import {
  PoseLandmarker,
  HandLandmarker,
  FilesetResolver,
  DrawingUtils
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";

import {
  formatBodyData,
  formatHandData
} from "./formatters.js";
import {
  detectPistolGesture,
  createStartStopGestureController
} from "./gestures.js";
import {
  createLogsController
} from "./logs.js";
import {
  createGestureLogsController
} from "./gestureLogs.js";
import {
  createGestureCounterController
} from "./gestureCounter.js";

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const fpsElement = document.getElementById("fps");

const poseData = document.getElementById("poseData");
const leftHandData = document.getElementById("leftHandData");
const rightHandData = document.getElementById("rightHandData");
const logsElement = document.getElementById("logs");
const forwardCountElement = document.getElementById("forwardCount");
const backwardCountElement = document.getElementById("backwardCount");
const startCountElement = document.getElementById("startCount");
const stopCountElement = document.getElementById("stopCount");

let lastTime = performance.now();

const logs = createLogsController(logsElement);
const gestureCounter = createGestureCounterController({
  forwardCountElement,
  backwardCountElement,
  startCountElement,
  stopCountElement
});
const gestureLogs = createGestureLogsController(detectPistolGesture, logs, {
  onStableLog: gestureCounter.countLog
});
const startStopGestures = createStartStopGestureController(logs, {
  onLog: gestureCounter.countLog
});

async function setupCamera() {
  const stream =
    await navigator.mediaDevices.getUserMedia({
      video: {
        width: 1280,
        height: 720
      }
    });

  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function initModels() {
  const vision =
    await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

  const [poseLandmarker, handLandmarker] =
    await Promise.all([
      PoseLandmarker.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 1
        }
      ),
      HandLandmarker.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        }
      )
    ]);

  return { poseLandmarker, handLandmarker };
}

await setupCamera();

const {
  poseLandmarker,
  handLandmarker
} =
  await initModels();

canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

const drawingUtils = new DrawingUtils(ctx);

function segmentColor(index) {
  if (index <= 10) return "#4fc3f7";
  if (index <= 22) return "#00ff88";
  return "#ffb300";
}

function drawSkeleton(landmarks) {
  const w = canvas.width;
  const h = canvas.height;

  const px = (lm) => lm.x * w;
  const py = (lm) => lm.y * h;

  ctx.lineWidth = 4;
  for (const conn of PoseLandmarker.POSE_CONNECTIONS) {
    const a = landmarks[conn.start];
    const b = landmarks[conn.end];

    if (!a || !b || a.visibility < 0.5 || b.visibility < 0.5) continue;

    ctx.strokeStyle = segmentColor(conn.start);
    ctx.beginPath();
    ctx.moveTo(px(a), py(a));
    ctx.lineTo(px(b), py(b));
    ctx.stroke();
  }

  ctx.font = "bold 16px Arial";

  for (let i = 0; i < landmarks.length; i += 1) {
    const lm = landmarks[i];

    if (lm.visibility < 0.5) continue;

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

const HAND_COLORS = {
  Left: "#ff0000",
  Right: "#ffea00"
};

function drawHands(allLandmarks, handedness) {
  const w = canvas.width;
  const h = canvas.height;

  const px = (lm) => lm.x * w;
  const py = (lm) => lm.y * h;

  ctx.shadowColor = '#000000';
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

function renderFPS() {
  const now = performance.now();
  const fps = 1000 / (now - lastTime);

  lastTime = now;
  fpsElement.textContent = fps.toFixed(1);
}

// Main loop
async function predict() {
  const startTimeMs = performance.now();
  const results =
    poseLandmarker.detectForVideo(
      video,
      startTimeMs
    );
  const handResult =
    handLandmarker.detectForVideo(
      video,
      startTimeMs
    );

  const firstPoseLandmarks = results.landmarks?.[0];

  let firstLeftHandLandmarks = null;
  let firstRightHandLandmarks = null;

  for (let i = 0; i < handResult.handedness.length; i += 1) {
    const label = handResult.handedness[i]?.[0]?.categoryName;

    if (label === "Left") {
      firstLeftHandLandmarks = handResult.landmarks[i];
    }

    if (label === "Right") {
      firstRightHandLandmarks = handResult.landmarks[i];
    }
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (results.landmarks) {
    for (const landmarks of results.landmarks) {
      drawSkeleton(landmarks);
      poseData.textContent = formatBodyData(landmarks);
    }
  }

  if (handResult.landmarks) {
    drawHands(handResult.landmarks, handResult.handedness);

    for (let i = 0; i < handResult.landmarks.length; i += 1) {
      const landmarks = handResult.landmarks[i];
      const label = handResult.handedness[i]?.[0]?.categoryName;

      if (label === "Left") {
        leftHandData.textContent = formatHandData(landmarks);
      }

      if (label === "Right") {
        rightHandData.textContent = formatHandData(landmarks);
      }
    }
  }

  gestureLogs.updateGestureLogs(
    firstLeftHandLandmarks,
    firstRightHandLandmarks,
    startTimeMs
  );
  startStopGestures.updateStartStopGestures(
    firstPoseLandmarks,
    firstLeftHandLandmarks,
    firstRightHandLandmarks,
    startTimeMs
  );

  renderFPS();

  requestAnimationFrame(predict);
}

predict();