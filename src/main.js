import {
  PoseLandmarker,
  HandLandmarker,
  FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";
import { createPoseRenderer } from "./renderer/poseRenderer.js";
import { createHandRenderer } from "./renderer/handRenderer.js";
import { formatBodyData, formatHandData } from "./utils/formatters.js";
import { createGestureTracker } from "./gesture/gestureTracker.js";
import { detectGestures } from "./gesture/gestureDetector.js";
import { createLogsController } from "./utils/logs.js";
import { createGestureCounterController } from "./gesture/gestureCounter.js";

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const poseData = document.getElementById("poseData");
const leftHandData = document.getElementById("leftHandData");
const rightHandData = document.getElementById("rightHandData");

const logsElement = document.getElementById("logs");
const fpsElement = document.getElementById("fps");
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
  stopCountElement,
});

const gestureTracker = createGestureTracker({ minDurationMs: 1000 });

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 1280, height: 720 },
  });

  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function initModels() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
  );

  const [poseLandmarker, handLandmarker] = await Promise.all([
    PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numPoses: 1,
    }),

    HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: 2,
    }),
  ]);

  return { poseLandmarker, handLandmarker };
}

await setupCamera();

const { poseLandmarker, handLandmarker } = await initModels();

canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

const poseRenderer = createPoseRenderer(ctx, canvas);
const handRenderer = createHandRenderer(ctx, canvas);

function renderFPS() {
  const now = performance.now();
  const fps = 1000 / (now - lastTime);

  lastTime = now;
  fpsElement.textContent = fps.toFixed(1);
}

async function predict() {
  const startTimeMs = performance.now();
  const results = poseLandmarker.detectForVideo(video, startTimeMs);
  const handResult = handLandmarker.detectForVideo(video, startTimeMs);

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
      poseRenderer.draw(landmarks);
      poseData.textContent = formatBodyData(landmarks);
    }
  }

  if (handResult.landmarks) {
    handRenderer.draw(handResult.landmarks, handResult.handedness);

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

  const gestures = detectGestures(
    firstLeftHandLandmarks,
    firstRightHandLandmarks,
  );
  const stableGestures = gestureTracker.update(gestures, startTimeMs);

  for (const gesture of stableGestures) {
    logs.appendLog(gesture);
    gestureCounter.countGesture(gesture);
  }

  renderFPS();
  requestAnimationFrame(predict);
}

predict();
