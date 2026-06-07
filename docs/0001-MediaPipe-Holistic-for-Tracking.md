# MediaPipe Holistic for Tracking

- Status: accepted
- Workload: 6h
- Decider: [Marcel Grund](https://github.com/MaGrund)
- Issue: [1](https://github.com/mi-classroom/mi-web-technologien-beiboot-ss2026-magrund/issues/1)
- Date: 2026-05-18

## Context and Problem Statement

The task is to select a machine learning library and use it to display live body tracking data directly in the browser. The detected body data should be shown as raw output on the screen without additional abstraction or custom libraries.

## Considered Options

- MediaPipe
- YOLO
- MoveNet (TensorFlow.js)

## Decision Outcome

### Chosen Option: MediaPipe Holistic

MediaPipe Holistic was chosen because it provides the largest number of landmarks, especially for hands tracking (with 3D coordinates), while being directly usable in the browser. It combines pose, hand, and face tracking in a single solution and includes built-in tracking functionality, which improves motion stability between frames. The landmark structure and dataset also differ from many common pose estimation models that are mainly based on COCO datasets.

YOLO was also considered because of its flexibility and the large number of available models (e.g. hand detection). The Ultralytics framework is easy to use and models can be fine-tuned efficiently. However, YOLO is mainly Python-based and therefore not directly suitable for browser-only usage without additional infrastructure.

MoveNet provides multiple model variants and performs well for general pose estimation. However, it focuses mainly on body keypoints and does not include detailed hand tracking, which is an important requirement for this project. In addition, although MoveNet was trained on COCO and Google’s Active dataset for sports and motion-related poses, MediaPipe provided more stable motion tracking during testing.

## Data Quality and Performance

Performance on an M1 Max MacBook Pro was around 14–20 FPS, which is sufficient for the required real-time tracking use case.

The detected data quality is generally good. Hand and finger tracking is very accurate, although slightly slower because of the high number of landmarks. Face landmarks are somewhat less precise, but still accurate enough for the intended use case. Body keypoints perform well when the full body is visible. Accuracy decreases when body parts are truncated, such as in a webcam setup, but the results remain usable. Occlusion can still cause tracking issues in some situations, although overall robustness is acceptable. Lighting conditions have a significant impact on detection quality. Hand tracking shows relatively little jitter, while body and face landmarks are slightly less stable, but still within an acceptable range for the project.

## Additional Notes

The rest of the project was intentionally kept very simple using plain HTML, CSS, and JavaScript, following the recommendation to keep the project architecture as minimal as possible in the beginning.
In the browser interface, the left side displays the live camera feed with the estimated landmarks drawn on top of the image. The right side shows the raw tracking data in a lightly processed format, including which landmarks are currently detected and their coordinates.

## Links

- https://github.com/google-ai-edge/mediapipe/blob/master/docs/solutions/holistic.md
- https://docs.ultralytics.com/models
- https://blog.tensorflow.org/2021/05/next-generation-pose-detection-with-movenet-and-tensorflowjs.html
