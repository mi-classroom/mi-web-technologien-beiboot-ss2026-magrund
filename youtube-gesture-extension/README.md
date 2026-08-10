# YouTube Gesture Control

Chrome Extension prototype using the compiled `library_new` Gesture API and MediaPipe.

## How to use
1. Load the `dist` folder at `chrome://extensions` with Developer Mode enabled.
2. Open/reload YouTube.
3. Click `Gesten starten` in the floating panel.
4. Allow camera access.

Mappings:
- pistolForward -> +10 seconds
- pistolBackward -> -10 seconds
- bothThumbsUp -> Play/Pause
- twoFingersUp -> Volume +10%
- twoFingersDown -> Volume -10%

## Library workflow
The `library/` folder is the compiled output of `library_new`.
If you have the library source, build it first and copy its `dist/` contents into `library/`.
