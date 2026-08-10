import {
  FilesetResolver,
  HandLandmarker
} from "../assets/vision_bundle.mjs";

import {
  createGestureTracker,
  Gestures
} from "../library/index.js";

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

const camera = document.getElementById("camera");
const cameraPlaceholder =
  document.getElementById("camera-placeholder");

const statusEl = document.getElementById("status");

const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");

let stream = null;
let landmarker = null;

let tracker = createGestureTracker();

let running = false;
let raf = 0;

function status(text) {
  statusEl.textContent = text;

  window.parent.postMessage(
    {
      source: "yt-gesture",
      type: "status",
      text
    },
    "*"
  );
}

function command(commandName, label) {
  window.parent.postMessage(
    {
      source: "yt-gesture",
      type: "command",
      command: commandName
    },
    "*"
  );

  status(label);
}

function splitHands(result) {
  let leftHand = null;
  let rightHand = null;

  for (let i = 0; i < result.handedness.length; i++) {
    const label =
      result.handedness[i]?.[0]?.categoryName;

    if (label === "Left") {
      leftHand = result.landmarks[i] ?? null;
    }

    if (label === "Right") {
      rightHand = result.landmarks[i] ?? null;
    }
  }

  return {
    leftHand,
    rightHand
  };
}

async function start() {
  if (running) return;

  try {
    status("Kamera wird angefragt …");

    stream =
      await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        },
        audio: false
      });

    camera.srcObject = stream;

    await camera.play();

    camera.style.display = "block";
    cameraPlaceholder.style.display = "none";

    status("MediaPipe wird geladen …");

    const vision =
      await FilesetResolver.forVisionTasks(
        chrome.runtime.getURL("assets/wasm")
      );

    landmarker =
      await HandLandmarker.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: "GPU"
          },

          runningMode: "VIDEO",
          numHands: 2
        }
      );

    tracker = createGestureTracker();

    running = true;

    startBtn.style.display = "none";
    stopBtn.style.display = "block";

    status("🟢 Gesten aktiv");

    loop();
  } catch (error) {
    console.error(
      "[YouTube Gesture]",
      error
    );

    stop(false);

    status(
      `❌ ${error?.message ?? error}`
    );
  }
}

function loop() {
  if (!running || !landmarker) {
    return;
  }

  try {
    const result =
      landmarker.detectForVideo(
        camera,
        performance.now()
      );

    const {
      leftHand,
      rightHand
    } = splitHands(result);

    const gesture =
      tracker.detect({
        leftHandLandmarks: leftHand,
        rightHandLandmarks: rightHand
      });

    if (gesture) {
      switch (gesture.type) {
        case Gestures.pistolForward:
          command(
            "SEEK_FORWARD",
            "🔫→ +10 Sekunden"
          );
          break;

        case Gestures.pistolBackward:
          command(
            "SEEK_BACKWARD",
            "🔫← -10 Sekunden"
          );
          break;

        case Gestures.bothThumbsUp:
          command(
            "PLAY_PAUSE",
            "▶/⏸ Play/Pause"
          );
          break;

        case Gestures.twoFingersUp:
          command(
            "VOLUME_UP",
            "🔊 Lauter"
          );
          break;

        case Gestures.twoFingersDown:
          command(
            "VOLUME_DOWN",
            "🔉 Leiser"
          );
          break;
      }
    }
  } catch (error) {
    console.error(
      "[YouTube Gesture] detection",
      error
    );
  }

  raf = requestAnimationFrame(loop);
}

function stop(show = true) {
  running = false;

  cancelAnimationFrame(raf);
  raf = 0;

  landmarker?.close();
  landmarker = null;

  stream?.getTracks().forEach(
    track => track.stop()
  );

  stream = null;

  camera.srcObject = null;

  camera.style.display = "none";
  cameraPlaceholder.style.display = "flex";

  startBtn.style.display = "block";
  stopBtn.style.display = "none";

  if (show) {
    status("⚪ Gesten aus");
  }
}

startBtn.addEventListener(
  "click",
  start
);

stopBtn.addEventListener(
  "click",
  () => stop(true)
);

window.addEventListener("message", (event) => {
  const data = event.data;

  if (
    !data ||
    data.source !== "yt-gesture-host" ||
    data.type !== "ui"
  ) {
    return;
  }

  const visible = data.visible;

  document.body.style.opacity =
    visible ? "1" : "0";

  document.body.style.pointerEvents =
    visible ? "auto" : "none";
});