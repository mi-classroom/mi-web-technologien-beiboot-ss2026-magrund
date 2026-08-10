type YouTubeState = {
  PLAYING: number;
  PAUSED: number;
};

type YouTubePlayerInstance = {
  playVideo: () => void;
  pauseVideo: () => void;
  getPlayerState: () => number;
  getCurrentTime: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  destroy: () => void;
};

type YouTubeAPI = {
  Player: new (
    elementId: string,
    options: {
      videoId: string;
      playerVars?: Record<string, number>;
      events?: {
        onReady?: () => void;
      };
    },
  ) => YouTubePlayerInstance;
  PlayerState: YouTubeState;
};

declare global {
  interface Window {
    YT?: YouTubeAPI;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YouTubeAPI> | null = null;

function loadYouTubeAPI(): Promise<YouTubeAPI> {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (apiPromise) {
    return apiPromise;
  }

  apiPromise = new Promise<YouTubeAPI>((resolve) => {
    const previousCallback = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();

      if (window.YT) {
        resolve(window.YT);
      }
    };

    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]',
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return apiPromise;
}

export interface YouTubePlayer {
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seekRelative: (seconds: number) => void;
  destroy: () => void;
}

export async function createYouTubePlayer(
  elementId: string,
  videoId: string,
): Promise<YouTubePlayer> {
  const YT = await loadYouTubeAPI();

  const player = await new Promise<YouTubePlayerInstance>((resolve) => {
    const instance = new YT.Player(elementId, {
      videoId,

      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        playsinline: 1,
      },

      events: {
        onReady: () => resolve(instance),
      },
    });
  });

  return {
    play() {
      player.playVideo();
    },

    pause() {
      player.pauseVideo();
    },

    togglePlayPause() {
      if (player.getPlayerState() === YT.PlayerState.PLAYING) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    },

    seekRelative(seconds: number) {
      const currentTime = player.getCurrentTime();

      player.seekTo(Math.max(0, currentTime + seconds), true);
    },

    destroy() {
      player.destroy();
    },
  };
}

export function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1) || null;
    }

    if (
      parsed.hostname === "youtube.com" ||
      parsed.hostname === "www.youtube.com" ||
      parsed.hostname === "m.youtube.com"
    ) {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v");
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.split("/")[2] ?? null;
      }

      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/")[2] ?? null;
      }
    }

    return null;
  } catch {
    return null;
  }
}