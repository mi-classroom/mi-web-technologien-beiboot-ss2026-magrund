import {
  HolisticLandmarker,
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

const vision =
  await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

const holistic =
  await HolisticLandmarker.createFromOptions(
    vision,
    {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/holistic_landmarker/holistic_landmarker/float16/latest/holistic_landmarker.task"
      },
      runningMode: "VIDEO",
      numPoses: 1
    }
  );

await setupCamera();

canvas.width = video.videoWidth;
canvas.height = video.videoHeight;

const drawingUtils = new DrawingUtils(ctx);

function renderFPS() {
  const now = performance.now();
  const fps = 1000 / (now - lastTime);

  lastTime = now;
  fpsElement.textContent = fps.toFixed(1);
}

function drawVisibilityPoint(x, y, visibility) {
  let color = "red";

  if (visibility > 0.8) {
    color = "lime";
  }
  else if (visibility > 0.4) {
    color = "orange";
  }

  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

// Main loop
async function predict() {
  const startTimeMs = performance.now();
  const results =
    holistic.detectForVideo(
      video,
      startTimeMs
    );
  const firstPoseLandmarks = results.poseLandmarks?.[0];
  const firstLeftHandLandmarks = results.leftHandLandmarks?.[0];
  const firstRightHandLandmarks = results.rightHandLandmarks?.[0];

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (results.poseLandmarks) {
    for (const landmarks of results.poseLandmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        HolisticLandmarker.POSE_CONNECTIONS,
        {
          color: "#00FF88",
          lineWidth: 3
        }
      );

      landmarks.forEach((lm) => {
        const x = lm.x * canvas.width;
        const y = lm.y * canvas.height;

        drawVisibilityPoint(
          x,
          y,
          lm.visibility
        );
      });

      poseData.textContent =
        formatBodyData(landmarks);
    }
  }

  if (results.leftHandLandmarks) {
    for (const landmarks of results.leftHandLandmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        HolisticLandmarker.HAND_CONNECTIONS,
        {
          color: "#FF5555",
          lineWidth: 2
        }
      );

      drawingUtils.drawLandmarks(
        landmarks,
        {
          radius: 4,
          color: "#FF5555"
        }
      );

      leftHandData.textContent =
        formatHandData(landmarks);
    }
  }

  if (results.rightHandLandmarks) {
    for (const landmarks of results.rightHandLandmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        HolisticLandmarker.HAND_CONNECTIONS,
        {
          color: "#00BFFF",
          lineWidth: 2
        }
      );

      drawingUtils.drawLandmarks(
        landmarks,
        {
          radius: 4,
          color: "#00BFFF"
        }
      );

      rightHandData.textContent =
        formatHandData(landmarks);
    }
  }

  gestureLogs.updateGestureLogs(firstLeftHandLandmarks, firstRightHandLandmarks, startTimeMs);
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