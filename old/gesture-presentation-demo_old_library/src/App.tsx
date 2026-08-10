import { useEffect, useRef, useState } from "react";
import {
  createGestureController,
  type GestureController,
} from "./gestureController";
import { createPresentation, loadSlides, type PresentationState } from "./presentation";

const INITIAL_STATUS = "Starte Präsentation ...";

export default function App() {
  const [slideState, setSlideState] = useState<PresentationState | null>(null);
  const [status, setStatus] = useState(INITIAL_STATUS);
  const presentationRef = useRef<ReturnType<typeof createPresentation> | null>(null);
  const gestureControllerRef = useRef<GestureController | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap(): Promise<void> {
      try {
        setStatus("Lade Slides ...");
        const slides = await loadSlides();

        if (cancelled) {
          return;
        }

        presentationRef.current = createPresentation(slides, (nextState) => {
          setSlideState(nextState);
        });

        const videoElement = videoRef.current;

        if (!videoElement) {
          return;
        }

        gestureControllerRef.current = createGestureController({
          videoElement,
          onPistolLeft: () => {
            presentationRef.current?.previous();
          },
          onPistolRight: () => {
            presentationRef.current?.next();
          },
          onStatus: (message) => {
            setStatus(message);
          },
        });

        await gestureControllerRef.current.start();
      } catch (error) {
        console.error("[presentation-demo] startup failed", error);
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
      gestureControllerRef.current?.stop();
      gestureControllerRef.current = null;
      presentationRef.current = null;
    };
  }, []);

  const currentSlideIndex = slideState ? slideState.currentIndex + 1 : 0;
  const totalSlides = slideState?.totalSlides ?? 0;

  return (
    <main className="presentation-shell">
      <header className="hero">
        <div>
          <h1>Präsentation mit Gestensteuerung</h1>
        </div>

        <div className="status-card" aria-live="polite">
          <span className="status-label">Status</span>
          <strong>{status}</strong>
        </div>
      </header>

      <section className="slide-frame" aria-label="Aktuelle Folie">
        {slideState ? (
          <img
            src={slideState.currentSlideSrc}
            alt={`Folie ${currentSlideIndex} von ${totalSlides}`}
          />
        ) : (
          <div className="slide-placeholder">Präsentation wird geladen</div>
        )}
      </section>

      <section className="controls" aria-label="Foliensteuerung">
        <div className="slide-counter">
          {slideState ? `${currentSlideIndex} / ${totalSlides}` : "0 / 0"}
        </div>

        <div className="button-row">
          <button
            type="button"
            onClick={() => presentationRef.current?.previous()}
            disabled={!slideState}
          >
            Previous
          </button>
          <button
            className="primary"
            type="button"
            onClick={() => presentationRef.current?.next()}
            disabled={!slideState}
          >
            Next
          </button>
        </div>
      </section>

      <video ref={videoRef} className="video" autoPlay muted playsInline />
    </main>
  );
}