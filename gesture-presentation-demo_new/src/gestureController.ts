import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult,
} from "@mediapipe/tasks-vision";

import {
  createGestureTracker,
  Gestures,
} from "mi-web-technologien-beiboot-ss2026-magrund";

interface GestureControllerOptions {
  videoElement: HTMLVideoElement;
  onPistolLeft: () => void;
  onPistolRight: () => void;
  onStatus: (message: string) => void;
  onStream?: (stream: MediaStream) => void;
  onFrame?: (frame: GestureFrame) => void;
}

export interface GestureFrame {
  leftHandLandmarks: HandLandmarkerResult["landmarks"][number] | null;
  rightHandLandmarks: HandLandmarkerResult["landmarks"][number] | null;
}

export interface GestureController {
  start: () => Promise<void>;
  stop: () => void;
}

export function createGestureController(
  options: GestureControllerOptions,
): GestureController {
  const {
    videoElement,
    onPistolLeft,
    onPistolRight,
    onStatus,
  } = options;

  const tracker = createGestureTracker();

  let running = false;
  let animationFrameId: number | null = null;
  let stream: MediaStream | null = null;

  async function start(): Promise<void> {
    if (running) {
      return;
    }

    running = true;
    onStatus("Kamera wird angefragt");

    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: 1280,
        height: 720,
      },
    });

    videoElement.srcObject = stream;
    options.onStream?.(stream);

    await new Promise<void>((resolve) => {
      videoElement.onloadedmetadata = () => resolve();
    });

    if (!running) {
      stop();
      return;
    }

    onStatus("Modell wird geladen");

    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
    );

    if (!running) {
      stop();
      return;
    }

    const handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: 2,
    });

    if (!running) {
      stop();
      return;
    }

    onStatus("Gestensteuerung aktiv");

    function loop(): void {
      if (!running) {
        return;
      }

      const result = handLandmarker.detectForVideo(
        videoElement,
        performance.now(),
      );

      const { leftHand, rightHand } = splitHands(result);

      options.onFrame?.({
        leftHandLandmarks: leftHand,
        rightHandLandmarks: rightHand,
      });

      const gesture = tracker.detect({
        leftHandLandmarks: leftHand,
        rightHandLandmarks: rightHand,
      });

      switch (gesture?.type) {
        case Gestures.pistolForward:
          onPistolRight();
          onStatus("Pistol Forward detected");
          break;

        case Gestures.pistolBackward:
          onPistolLeft();
          onStatus("Pistol Back detected");
          break;
      }

      animationFrameId = requestAnimationFrame(loop);
    }

    loop();
  }

  function stop(): void {
    running = false;

    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    if (stream) {
      for (const track of stream.getTracks()) {
        track.stop();
      }

      stream = null;
    }

    videoElement.onloadedmetadata = null;
    videoElement.srcObject = null;
  }

  return {
    start,
    stop,
  };
}

function splitHands(result: HandLandmarkerResult): {
  leftHand: HandLandmarkerResult["landmarks"][number] | null;
  rightHand: HandLandmarkerResult["landmarks"][number] | null;
} {
  let leftHand: HandLandmarkerResult["landmarks"][number] | null = null;
  let rightHand: HandLandmarkerResult["landmarks"][number] | null = null;

  for (let index = 0; index < result.handedness.length; index += 1) {
    const label = result.handedness[index]?.[0]?.categoryName;

    if (label === "Left") {
      leftHand = result.landmarks[index] ?? null;
    } else if (label === "Right") {
      rightHand = result.landmarks[index] ?? null;
    }
  }

  return {
    leftHand,
    rightHand,
  };
}