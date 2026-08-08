import { useEffect, useRef } from "react";
import type { GestureFrame } from "./gestureController";

interface MiniCameraProps {
  stream: MediaStream | null;
  frame: GestureFrame | null;
}

const HAND_CONNECTIONS: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [0, 17],
];

export function MiniCamera({ stream, frame }: MiniCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    if (!stream) {
      videoElement.pause();
      videoElement.srcObject = null;
      return;
    }

    videoElement.srcObject = stream;
    void videoElement.play().catch(() => undefined);

    return () => {
      videoElement.pause();
      videoElement.srcObject = null;
    };
  }, [stream]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const width = Math.max(canvas.clientWidth, 1);
    const height = Math.max(canvas.clientHeight, 1);
    const devicePixelRatio = window.devicePixelRatio || 1;

    canvas.width = Math.round(width * devicePixelRatio);
    canvas.height = Math.round(height * devicePixelRatio);

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);

    drawHand(context, frame?.leftHandLandmarks ?? null, width, height, "#60a5fa");
    drawHand(context, frame?.rightHandLandmarks ?? null, width, height, "#f59e0b");
  }, [frame]);

  return (
    <figure className="mini-camera">
      <video ref={videoRef} className="mini-camera__video" autoPlay muted playsInline />
      <canvas ref={canvasRef} className="mini-camera__overlay" />
      <figcaption className="mini-camera__caption">Vorschau mit Landmarken</figcaption>
    </figure>
  );
}

function drawHand(
  context: CanvasRenderingContext2D,
  landmarks: GestureFrame["leftHandLandmarks"],
  width: number,
  height: number,
  color: string,
): void {
  if (!landmarks) {
    return;
  }

  context.lineWidth = 2;
  context.strokeStyle = color;
  context.fillStyle = color;

  for (const [startIndex, endIndex] of HAND_CONNECTIONS) {
    const startPoint = landmarks[startIndex];
    const endPoint = landmarks[endIndex];

    if (!startPoint || !endPoint) {
      continue;
    }

    context.beginPath();
    context.moveTo(startPoint.x * width, startPoint.y * height);
    context.lineTo(endPoint.x * width, endPoint.y * height);
    context.stroke();
  }

  for (const point of landmarks) {
    context.beginPath();
    context.arc(point.x * width, point.y * height, 3, 0, Math.PI * 2);
    context.fill();
  }
}