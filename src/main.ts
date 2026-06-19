import { FilesetResolver, HandLandmarker, PoseLandmarker } from "@mediapipe/tasks-vision";
import {
  createGestureCounterController,
  createGestureTracker,
  detectGestures,
} from "./gesture/index.js";
import { createPoseRenderer } from "./renderer/poseRenderer.js";
import { createHandRenderer } from "./renderer/handRenderer.js";
import { formatBodyData, formatHandData } from "./utils/formatters.js";
import { createLogsController } from "./utils/logs.js";

function assertElement<T extends HTMLElement>(element: T | null, selector: string): T {
  if (!element) {
    throw new Error(`Missing required DOM element: ${selector}`);
  }

  return element;
}

const video = assertElement(document.getElementById("video") as HTMLVideoElement | null, "#video");
const canvas = assertElement(document.getElementById("canvas") as HTMLCanvasElement | null, "#canvas");
const rawContext = canvas.getContext("2d");

if (!rawContext) {
  throw new Error("Canvas 2D context is not available.");
}

const ctx = rawContext;

const poseData = document.getElementById("poseData");
const leftHandData = document.getElementById("leftHandData");
const rightHandData = document.getElementById("rightHandData");

const logsElement = document.getElementById("logs");
const fpsElement = assertElement(document.getElementById("fps") as HTMLElement | null, "#fps");
const forwardCountElement = document.getElementById("forwardCount");
const backwardCountElement = document.getElementById("backwardCount");
const startCountElement = document.getElementById("startCount");
const stopCountElement = document.getElementById("stopCount");
const upCountElement = document.getElementById("upCount");
const downCountElement = document.getElementById("downCount");

let lastTime = performance.now();

const logs = createLogsController(logsElement);

const gestureCounter = createGestureCounterController({
  forwardCountElement,
  backwardCountElement,
  startCountElement,
  stopCountElement,
  upCountElement,
  downCountElement,
});

const gestureTracker = createGestureTracker({ minDurationMs: 1000 });

async function setupCamera(): Promise<void> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 1280, height: 720 },
  });

  video.srcObject = stream;

  await new Promise<void>((resolve) => {
    video.onloadedmetadata = () => {
      resolve();
    };
  });
}

async function initModels() {
  const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");

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

function renderFPS(): void {
  const now = performance.now();
  const fps = 1000 / (now - lastTime);

  lastTime = now;
  fpsElement.textContent = fps.toFixed(1);
}

async function startDemo(): Promise<void> {
  await setupCamera();

  const { poseLandmarker, handLandmarker } = await initModels();

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const poseRenderer = createPoseRenderer(ctx, canvas);
  const handRenderer = createHandRenderer(ctx, canvas);

  async function predict(): Promise<void> {
    const startTimeMs = performance.now();
    const results = poseLandmarker.detectForVideo(video, startTimeMs);
    const handResult = handLandmarker.detectForVideo(video, startTimeMs);

    let firstLeftHandLandmarks = null;
    let firstRightHandLandmarks = null;

    for (let i = 0; i < handResult.handedness.length; i += 1) {
      const label = handResult.handedness[i]?.[0]?.categoryName;

      if (label === "Left") {
        firstLeftHandLandmarks = handResult.landmarks[i] ?? null;
      }

      if (label === "Right") {
        firstRightHandLandmarks = handResult.landmarks[i] ?? null;
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.landmarks) {
      for (const landmarks of results.landmarks) {
        poseRenderer.draw(landmarks);

        if (poseData) {
          poseData.textContent = formatBodyData(landmarks);
        }
      }
    }

    if (handResult.landmarks) {
      handRenderer.draw(handResult.landmarks, handResult.handedness);

      for (let i = 0; i < handResult.landmarks.length; i += 1) {
        const landmarks = handResult.landmarks[i];
        const label = handResult.handedness[i]?.[0]?.categoryName;

        if (!landmarks) {
          continue;
        }

        if (label === "Left" && leftHandData) {
          leftHandData.textContent = formatHandData(landmarks);
        }

        if (label === "Right" && rightHandData) {
          rightHandData.textContent = formatHandData(landmarks);
        }
      }
    }

    const gestures = detectGestures(firstLeftHandLandmarks, firstRightHandLandmarks);
    const stableGestures = gestureTracker.update(gestures, startTimeMs);

    for (const gesture of stableGestures) {
      logs.appendLog(gesture);
      gestureCounter.countGesture(gesture);
    }

    renderFPS();
    requestAnimationFrame(() => {
      void predict();
    });
  }

  void predict();
}

void startDemo();
