import { useEffect, useRef, useState } from "react";
import {
  createGestureController,
  type GestureController,
  type GestureFrame,
} from "./gestureController";
import { MiniCamera } from "./MiniCamera";
import {
  createYouTubePlayer,
  extractYouTubeVideoId,
  type YouTubePlayer,
} from "./youtubePlayer";

const DEFAULT_VIDEO_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

export default function App() {
  const [videoUrl, setVideoUrl] = useState(DEFAULT_VIDEO_URL);
  const [status, setStatus] = useState("Starte Kamera ...");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraFrame, setCameraFrame] = useState<GestureFrame | null>(null);
  const [lastAction, setLastAction] = useState("Noch keine Geste erkannt");
  const [videoId, setVideoId] = useState(
    extractYouTubeVideoId(DEFAULT_VIDEO_URL),
  );

  const gestureControllerRef = useRef<GestureController | null>(null);
  const youtubePlayerRef = useRef<YouTubePlayer | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const player = await createYouTubePlayer("youtube-player", videoId);

        if (cancelled) {
          player.destroy();
          return;
        }

        youtubePlayerRef.current = player;

        const videoElement = videoRef.current;

        if (!videoElement) {
          return;
        }

        gestureControllerRef.current = createGestureController({
          videoElement,

          onPistolLeft: () => {
            youtubePlayerRef.current?.seekRelative(-10);
            setLastAction("← 10 Sekunden zurück");
          },

          onPistolRight: () => {
            youtubePlayerRef.current?.seekRelative(10);
            setLastAction("→ 10 Sekunden vor");
          },

          onStatus: setStatus,

          onStream: setCameraStream,

          onFrame: setCameraFrame,
        });

        await gestureControllerRef.current.start();
      } catch (error) {
        console.error("[youtube-gesture-demo] startup failed", error);
        setStatus("Fehler beim Starten");
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;

      gestureControllerRef.current?.stop();
      gestureControllerRef.current = null;

      youtubePlayerRef.current?.destroy();
      youtubePlayerRef.current = null;
    };
  }, [videoId]);

  function loadVideo() {
    const nextVideoId = extractYouTubeVideoId(videoUrl);

    if (!nextVideoId) {
      setStatus("Keine gültige YouTube-URL");
      return;
    }

    setVideoId(nextVideoId);
    setLastAction("Neues Video geladen");
  }

  function togglePlayPause() {
    youtubePlayerRef.current?.togglePlayPause();
  }

  function seek(seconds: number) {
    youtubePlayerRef.current?.seekRelative(seconds);

    setLastAction(
      seconds > 0
        ? `→ ${seconds} Sekunden vor`
        : `← ${Math.abs(seconds)} Sekunden zurück`,
    );
  }

  return (
    <main className="youtube-shell">
      <header className="hero">
        <div>
          <span className="eyebrow">Gesture Control</span>
          <h1>YouTube mit Gestensteuerung</h1>
        </div>

        <div className="status-card" aria-live="polite">
          <span className="status-label">System</span>
          <strong>{status}</strong>
        </div>
      </header>

      <section className="youtube-section">
        <div className="youtube-player-wrapper">
          <div id="youtube-player" />
        </div>
      </section>

      <section className="gesture-status">
        <span className="status-label">Letzte Aktion</span>
        <strong>{lastAction}</strong>
      </section>

      <section className="url-controls">
        <input
          type="url"
          value={videoUrl}
          onChange={(event) => setVideoUrl(event.target.value)}
          placeholder="YouTube URL"
          aria-label="YouTube URL"
        />

        <button className="primary" type="button" onClick={loadVideo}>
          Video laden
        </button>
      </section>

      <section className="controls">
        <button type="button" onClick={() => seek(-10)}>
          ← 10s
        </button>

        <button className="primary" type="button" onClick={togglePlayPause}>
          Play / Pause
        </button>

        <button type="button" onClick={() => seek(10)}>
          10s →
        </button>
      </section>

      <section className="camera-panel" aria-label="Kameravorschau">
        <div className="camera-panel__header">
          <div>
            <span className="status-label">Kamera</span>
            <strong>Gestenerkennung</strong>
          </div>
        </div>

        <MiniCamera stream={cameraStream} frame={cameraFrame} />
      </section>

      <video
        ref={videoRef}
        className="gesture-video"
        autoPlay
        muted
        playsInline
      />
    </main>
  );
}