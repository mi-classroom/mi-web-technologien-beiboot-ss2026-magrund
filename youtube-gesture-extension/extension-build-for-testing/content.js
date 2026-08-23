(() => {
  if (window.top !== window) return;
  if (document.getElementById("yt-gesture-frame-host")) return;

  const host = document.createElement("div");
  host.id = "yt-gesture-frame-host";

  let expanded = true;

  host.style.cssText = [
    "position:fixed",
    "left:8px",
    "bottom:64px",
    "width:250px",
    "height:330px",
    "z-index:2147483647",
    "border:0",
    "background:transparent",
    "pointer-events:auto",
    "overflow:hidden",
    "transition:width 0.25s ease,height 0.25s ease"
  ].join(";");

  const shadow = host.attachShadow({ mode: "closed" });

  const container = document.createElement("div");

  container.style.cssText = [
    "position:relative",
    "width:100%",
    "height:100%",
    "overflow:hidden",
    "border-radius:12px"
  ].join(";");

  const frame = document.createElement("iframe");

  frame.src = chrome.runtime.getURL("control.html");
  frame.allow = "camera";

  frame.style.cssText = [
    "position:absolute",
    "inset:0",
    "width:100%",
    "height:100%",
    "border:0",
    "margin:0",
    "padding:0",
    "display:block",
    "background:transparent",
    "border-radius:12px",
    "pointer-events:auto"
  ].join(";");

  const toggleButton = document.createElement("button");

  toggleButton.textContent = "−";
  toggleButton.title = "Gestensteuerung einklappen";
  toggleButton.setAttribute(
    "aria-label",
    "Gestensteuerung einklappen"
  );

  toggleButton.style.cssText = [
    "position:absolute",
    "top:8px",
    "right:8px",
    "width:28px",
    "height:28px",
    "margin:0",
    "padding:0",
    "border:0",
    "border-radius:50%",
    "background:rgba(0,0,0,0.7)",
    "color:white",
    "font-size:18px",
    "line-height:28px",
    "cursor:pointer",
    "z-index:10",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "pointer-events:auto"
  ].join(";");

  toggleButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    expanded = !expanded;

    if (expanded) {
      host.style.width = "250px";
      host.style.height = "330px";

      frame.style.display = "block";
      frame.style.pointerEvents = "auto";

      frame.contentWindow?.postMessage(
        {
          source: "yt-gesture-host",
          type: "ui",
          visible: true
        },
        "*"
      );

      toggleButton.textContent = "−";
      toggleButton.title = "Gestensteuerung einklappen";
      toggleButton.setAttribute(
        "aria-label",
        "Gestensteuerung einklappen"
      );
    } else {
      host.style.width = "48px";
      host.style.height = "48px";

      frame.style.display = "block";
      frame.style.pointerEvents = "none";

      frame.contentWindow?.postMessage(
        {
          source: "yt-gesture-host",
          type: "ui",
          visible: false
        },
        "*"
      );

      toggleButton.textContent = "+";
      toggleButton.title = "Gestensteuerung ausklappen";
      toggleButton.setAttribute(
        "aria-label",
        "Gestensteuerung ausklappen"
      );
    }
  });

  container.appendChild(frame);
  container.appendChild(toggleButton);

  shadow.appendChild(container);
  document.documentElement.appendChild(host);

  function getVideo() {
    return (
      document.querySelector("video.html5-main-video") ||
      document.querySelector("video")
    );
  }

  let seekCount = 0;

  function getSeekTime(duration) {
    seekCount++;

    if (seekCount <= 3) {
      return 10;
    }

    if (duration < 5 * 60) {
      return 10;
    } else if (duration < 15 * 60) {
      return 20;
    } else if (duration < 30 * 60) {
      return 30;
    } else if (duration < 60 * 60) {
      return 60;
    } else {
      return 90;
    }
  }

  function handleCommand(command) {
    const video = getVideo();

    if (!video) return;

    switch (command) {

      case "SEEK_FORWARD": {
        const seekTime = getSeekTime(video.duration);

        video.currentTime = Math.min(
          video.duration || Infinity,
          video.currentTime + seekTime
        );

        break;
      }

      case "SEEK_BACKWARD": {
        const seekTime = getSeekTime(video.duration);

        video.currentTime = Math.max(
          0,
          video.currentTime - seekTime
        );

        break;
      }

      case "PLAY_PAUSE":
        if (video.paused) {
          video.play().catch(() => { });
        } else {
          video.pause();
        }
        break;

      case "VOLUME_UP":
        video.muted = false;
        video.volume = Math.min(
          1,
          video.volume + 0.1
        );
        break;

      case "VOLUME_DOWN":
        video.muted = false;
        video.volume = Math.max(
          0,
          video.volume - 0.1
        );
        break;
    }
  }

  window.addEventListener("message", (event) => {
    if (event.source !== frame.contentWindow) return;

    const data = event.data;

    if (
      !data ||
      data.source !== "yt-gesture" ||
      data.type !== "command"
    ) {
      return;
    }

    handleCommand(data.command);
  });
})();