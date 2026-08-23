# Gesture-Controlled YouTube Application

- Status: accepted
- Workload: 12h
- Decider: [Marcel Grund](https://github.com/MaGrund)
- Issue: [5](https://github.com/mi-classroom/mi-web-technologien-beiboot-ss2026-magrund/issues/5)
- Date: 2026-08-23

## Context and Problem Statement

After extracting the gesture recognition into a reusable library and testing its API in Issue [#4](https://github.com/mi-classroom/mi-web-technologien-beiboot-ss2026-magrund/issues/4), the findings from this test led to a redesign of the public API. The API was simplified and reorganized: [ADR 0005: API Redesign](0005-API-Redesign.md)

After completing the API redesign, I started working on the main task for this issue. I decided to build a gesture-controlled YouTube application. The application combines video playback with hand gestures and allows users to control a video without relying exclusively on traditional mouse and keyboard input. The main use case for this application is based on a simple everyday problem. I, as well as many other people I know, often watch YouTube videos while eating. When eating food such as sandwiches, chips, or other oily food, it can be inconvenient to touch a keyboard, mouse, or trackpad.

## Decision: Weg A – Vision-Anwendung

I chose **Weg A: Die Vision-Anwendung**.

The alternative would have been Weg B, which would have focused on a specific technical weakness of the existing library, such as performance, robustness, latency, accuracy or gesture recognition under difficult conditions.

In practice, part of the work initially moved in the direction of Weg B. The API test in Issue #4 revealed a significant weakness in the existing library. I therefore decided to redesign the public API before starting the actual vision application. This was not intended as a complete Weg B investigation with measurements of performance, latency or recognition accuracy, but rather as a smaller piece of the kind of improvement described by Weg B.

After redesigning the API, I moved on to Weg A, the YouTube controller with gestures. I liked this scenario because it's a real problem for me and I didn't want to create the next presentation application. Although the video controller isn't extremely difficult, I knew that I had already spent a lot of time on the redesign and found the integration with YouTube interesting. 

## Application Concept

The goal of the application is to control YouTube videos using hand gestures instead of relying exclusively on a mouse or keyboard.
A camera is used to capture the user's hands, while MediaPipe provides the hand landmarks required for gesture recognition. The gesture library then recognizes these landmarks as gestures and provides the corresponding gesture events to the application.
The application uses these gesture events to control common video actions such as playing, pausing, skipping, and adjusting the volume. How the gesture-controlled interface is integrated with YouTube is described in the following section.

## Browser Extension vs. simple iFrame integration

One of the most interesting parts of the application was the integration with YouTube. After researching possible approaches, I identified two main options:

1. A standalone application using the YouTube iFrame Player API.
2. A Chrome extension that works directly on the official YouTube website.

My first goal was to build a quick prototype application in order to test the gestures and evaluate the user experience while controlling a video. For this prototype, I reused parts of my previous presentation demo, implemented the redesigned API, and integrated a YouTube player using an iFrame. This approach worked relatively quickly and allowed me to test the gesture interaction. After several successful tests, I decided to continue with the Chrome extension. This was my preferred approach because I felt that a separate application would negatively affect the user experience. A standalone application would require users to copy video links or interact with a separate interface. By integrating the functionality directly into YouTube, users can remain on the original website, stay logged in, use their recommended feed, and interact with YouTube as usual. The gesture controller therefore acts as an additional interaction method instead of replacing the existing YouTube experience. Since I had not previously developed a Chrome extension, I initially focused on creating a simple working interface. After the basic functionality was working, I improved the interface and overall user experience.

## Interaction Concept

The complete interaction concept is documented in [Chrome YouTube Extension](Chrome_YouTube_Extension.md).

The required gestures were already implemented in the gesture library. I did not need to make major changes to the existing gesture set. The gestures had already been deliberately designed to reduce false detections. Some gestures are intentionally distinctive or require both hands, making them less likely to occur accidentally during normal interaction. For example, the pistol gesture is deliberately somewhat unnatural, while other gestures require both hands to be visible.

At the same time, the gestures have a clear visual connection to the actions they represent. This makes them relatively easy to remember and understand. Because the existing gestures already provided a good balance between recognizability and reliable detection, only minor adjustments were necessary for the YouTube application.

The application currently uses the following gestures:

- **Double thumbs up:** Play or pause the video.
- **Pistol gesture pointing left or right:** Skip backward or forward.
- **Index and middle fingers pointing up or down:** Increase or decrease the volume.

During the development process, I adjusted some of the basic `minDuration` values so that gestures could be detected more quickly.
Reducing the minimum duration increases responsiveness but also increases the risk of accidental detections. However, based on my testing, I found that this trade-off works reasonably well for the intended use case. When users are eating, their hands are often outside the camera's visible area, which reduces the probability of accidental gesture recognition.

During the design process, I also identified the need for continuous gesture interaction. Actions such as skipping through a video or adjusting the volume should feel smooth and should not require the user to repeatedly perform the same gesture. For this reason, I extended the API so that a gesture can remain active and trigger repeated events while it is being held. This makes it possible to continuously skip through a video or adjust the volume without repeatedly recalling the gesture manually.

The scaling behaviour differs depending on the interaction:

- Volume changes use a linear scale.
- Video skipping starts with smaller increments.
  - The first three repeated gesture events skip approximately 10 seconds at a time.
  - After three repetitions, the number of skipped seconds increases depending on the length of the video.
       - < 5 min: 10 seconds
       - 5–< 15 min: 20 seconds
       - 15–< 30 min: 30 seconds
       - 30–< 60 min: 60 seconds
       - ≥ 60 min: 90 seconds


## Application Architecture

The application is structured so that the different responsibilities remain separated.

```text
┌──────────────────────┐
│        Camera        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│      MediaPipe       │
│  Hand Landmark Model │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Gesture Tracker    │
│    Library Public    │
│         API          │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Semantic Gesture   │
│       Event          │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   YouTube Player     │
│  Application Logic   │
└──────────────────────┘
```

The gesture library therefore acts as an input layer rather than as part of the video-player logic.

## Interface

The interface was designed to integrate with YouTube without significantly changing the existing user experience.

Because the application is implemented as a Chrome extension, the interface acts as an additional layer on top of the existing YouTube controls. The goal was to make the gesture controls visible and accessible without permanently occupying a large part of the screen. When collapsed, the extension is represented only by a “+” button. The gesture recognition system continues to run in the background, while the interface itself remains visually unobtrusive. When expanded, the interface provides access to the camera preview, application status, controls, and a short overview of the available gestures.

The main part of the expanded interface is a camera preview canvas. When no camera image is available, the canvas instead displays a short message prompting the user to start the application. This makes the current state of the camera immediately visible. Below the camera preview, a status message provides feedback about the current state of the application. It can indicate whether the system is ready, active, stopped, or which gesture was most recently recognized. This feedback was included to give the user a better sense of what the application is currently doing and to make the interaction feel more transparent. A start/stop button allows the user to explicitly activate or deactivate the camera and gesture recognition. This was an important design decision because automatically activating the camera or gesture recognition could be unexpected or distracting. At the bottom of the interface, a short visual overview of the available gestures and controls is provided using emojis and simple labels. Rather than serving as a detailed explanation, this section is intended as a quick reminder that users can refer to while using the extension.

I also considered visualizing the detected hand landmarks in the camera preview. This could help users understand how their hands should be positioned and framed for the gesture recognition to work reliably. However, I decided against displaying them by default because I did not want to overload the interface with additional visual information. The visualization could still be useful as an optional feature, particularly during the initial setup or when users have difficulty getting their gestures recognized.

## Fixes and Adjustments

During testing, I reduced the minimum gesture duration to make the video controls feel more responsive. After testing different values, the selected configuration provided a reasonable balance between responsiveness and reliable detection.

I also simplified the gesture set to avoid conflicts between similar gestures. The pistol gesture was changed so that only the index finger is required for recognition. This resolved conflicts with the double-finger gestures used for volume control.

In addition, I removed the double-cross gesture. In the original gesture plan, it was intended as an alternative way to control play/pause, alongside the double-thumb gesture. Since both gestures triggered the same control, the double-cross gesture was not necessary. It was also the least reliable gesture and became more prone to conflicts after changing the pistol gesture. Rather than introducing additional complexity to resolve these conflicts, I decided to disable the gesture.

## Technical Challenges

One of the main interface challenges was finding an appropriate position for the extension controls. The interface needed to be accessible without interfering with YouTube's existing controls. In fullscreen mode, the control button is positioned above the existing play button. Other positions were considered, especially on the right side of the screen. However, these areas can interfere with existing YouTube controls, the channel interface, or would require the button to be positioned too far away from the main player controls.

Gesture recognition is based on camera input and is therefore not perfectly stable. Small changes in hand position, lighting, or visibility can affect recognition. If the minimum duration is too short, accidental gestures can trigger player actions. If it is too long, the interface feels slow and unresponsive.

Sometimes there were misdetections caused by unlucky hand positions that happened to detect a defined gesture. Some fine-tuning is still necessary, especially with the new use case, as the gestures are now used in a different context and under different conditions.

I was not able to access YouTube's volume controls directly. Instead, the volume gestures control the HTML5 video element itself.
This means that the gesture-based volume control still works correctly, but it does not interact with YouTube's volume control interface directly. I was not able to find a suitable way to access the YouTube controls themselves within the available time.

## Deployment

The project is implemented as a Chrome extension and therefore does not have a traditional deployed website.
Instead, the extension can be built locally and loaded into Chrome through the extension management page.

For easier testing, I committed a test-ready build that only needs to be loaded into Chrome:

```text
youtube-gesture-extension/
└── extension-build-for-testing/
```

- [Load local Chrome extension](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world?hl=de#load-unpacked)

## Future Ideas

The original idea for the project was to control more than just video playback.

One possible extension would be to control YouTube navigation more broadly. For example, voice recognition could be used to search for videos, while different hand gestures could be used to navigate and select search results. This could turn the extension into a more complete hands-free YouTube interaction system. However, these ideas were outside the available timebox for this project.

## Reflection

Overall, I am very happy with the result.

The Chrome extension works and successfully demonstrates the intended interaction concept. During development, some errors were displayed in the Chrome Extension Developer Tab. I was not able to fully identify their cause, but they did not appear to affect the functionality of the application. Therefore, I decided not to spend a significant amount of the remaining time investigating them.

One of the main lessons from the project was that I spent more time than expected redesigning the API. The redesign was still valuable because it made the API easier to use and made it easier to implement new features such as continuous gestures. However, it also reduced the amount of time available for the vision application itself. I also used AI assistance during the development of the Chrome extension. Since some of the technologies were new to me, parts of the development process involved a lot of trial and error, using AI to help me find working solutions and understand unfamiliar parts of the implementation. As a result, I do not yet fully understand every detail of the extension. Before the presentation, I want to take some more time to go through the implementation and understand the parts I worked on in more depth. With more time, I would also refactor some parts of the extension and investigate the remaining errors in more detail.

I believe one of the biggest strengths of the project is that it addresses a realistic use case. The interaction is not only a technical demonstration but can solve an actual everyday problem. The application works and provides an alternative way to control video playback. Another interesting aspect of the project is the decision to implement the application as a Chrome extension instead of creating a separate demonstration application. This allowed the gesture controls to be integrated directly into the existing YouTube experience.