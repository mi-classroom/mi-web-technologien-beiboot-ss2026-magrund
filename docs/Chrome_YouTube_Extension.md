# YouTube Gesture Control Extension

This project is a Chrome Extension that allows YouTube videos to be controlled using hand gestures.

The extension uses the gesture recognition library developed as part of this project. The library is copied into the extension project and used through its public API.

## Architecture

The extension consists of two main parts:

```text
Camera
   ↓
MediaPipe
   ↓
Hand Landmarks
   ↓
Gesture Library
   ↓
Gesture Event
   ↓
Chrome Extension
   ↓
YouTube Player
```

The gesture library is responsible for recognizing gestures. The Chrome Extension is responsible for connecting those gestures to YouTube actions.

## Requirements

- Google Chrome
- Node.js
- npm
- The gesture library repository
- A webcam
- YouTube

The extension uses the Chrome Extension Manifest V3 format.

## 1. Build the Gesture Library

Before building the extension, the gesture library has to be built.

Navigate to the library project:

```bash
cd library_new
```

Install the dependencies:

```bash
npm install
```

Build the library:

```bash
npm run build
```

This creates the compiled library in the `dist/` directory.

The extension uses the compiled version of the library rather than the TypeScript source files.

## 2. Copy the Library into the Extension

After building the library, copy the generated library into the extension project. The extension contains a local copy of the compiled library so that it can be loaded directly by the Chrome Extension.

For example:

```text
youtube-gesture-extension/
├── src/
├── library/         Note: Library folder may needs to be created
│   └── Copy here 
├── public/
├── manifest.json
├── package.json
└── ...
```

Copy the contents of the library's `dist/` directory into the corresponding library directory of the extension. The extension should therefore contain the compiled library before it is built.

## 3. Build the Chrome Extension

Navigate to the extension project:

```bash
cd youtube-gesture-extension
```

Install the dependencies:

```bash
npm install
```

Build the extension:

```bash
npm run build
```

The build creates the final extension files in the `dist/` directory.

The `dist/` directory is the directory that will be loaded into Chrome.

After building, the structure should look approximately like:

```text
youtube-gesture-extension/
└── dist/
    ├── manifest.json
    ├── ...
    └── ...
```

## 4. Enable Chrome Developer Mode

Open Google Chrome and navigate to:

```text
chrome://extensions/
```

Enable **Developer mode** in the top-right corner.

This allows locally built extensions to be loaded without publishing them to the Chrome Web Store.

## 5. Load the Extension

Click:

**Load unpacked**

Chrome will ask you to select a directory.

Select the `dist/` directory created by the extension build:

```text
youtube-gesture-extension/
└── dist/   ← select this folder
```

Do not select the project root. The selected directory must contain the extension's `manifest.json`.
After loading the extension, it should appear in the list of installed extensions.

## 6. Open YouTube

Open:

```text
https://www.youtube.com/
```

Select a video.

The extension should now initialize on the YouTube page.

Chrome will ask for permission to use the camera.

Allow camera access so that hand landmarks can be detected.

Reloading the YouTube page may help.

## Gesture Controls

The extension supports the following gestures:

| Gesture | Event | Action |
|---|---|---|
| Both Thumbs Up | `PLAY_PAUSE` | Play or pause the video |
| Pistol Forward | `SEEK_FORWARD` | Seek forward |
| Pistol Backward | `SEEK_BACKWARD` | Seek backward |
| Two Fingers Up | `VOLUME_UP` | Increase volume |
| Two Fingers Down | `VOLUME_DOWN` | Decrease volume |

### Play / Pause

**Both Thumbs Up** trigger the `PLAY_PAUSE` event.

If the video is currently playing, it is paused. If it is paused, playback resumes.

### Seek Forward / Backward

**Pistol Forward** triggers `SEEK_FORWARD`, while **Pistol Backward** triggers `SEEK_BACKWARD`.

The first three consecutive seek events always move the video by **10 seconds**.

After that, the seek distance increases depending on the total length of the current video:

| Video Length | Seek Distance |
|---|---|
| First 3 seek events | 10 seconds |
| Less than 5 minutes | 10 seconds |
| Less than 15 minutes | 20 seconds |
| Less than 30 minutes | 30 seconds |
| Less than 60 minutes | 60 seconds |
| 60 minutes or longer | 90 seconds |

This makes short interactions predictable while allowing longer videos to be navigated more quickly when the gesture is repeated.

### Volume Control

**Two Fingers Up** triggers `VOLUME_UP` and increases the volume by **10%**.

**Two Fingers Down** triggers `VOLUME_DOWN` and decreases the volume by **10%**.

The volume is limited to a range between **0% and 100%**.