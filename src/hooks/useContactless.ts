import { useEffect, useRef, useCallback, useState } from 'react';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';

type GestureCallback = (data: {
  semanticGesture: string | null;
  results: unknown;
}) => void;

type UseContactlessOptions = {
  runningMode?: 'IMAGE' | 'VIDEO';
  numHands?: number;
  swipeThreshold?: number;
};

type HistoryPoint = {
  x: number;
  time: number;
};

type TrackingState = {
  historyX: HistoryPoint[];
  swipeAccumulator: number;
  lastGestureName: string;
  lastOpenPalmTime: number;
  cooldownEnd: number;
};

export const useContactless = (
  callback?: GestureCallback,
  {
    runningMode = 'VIDEO',
    numHands = 2,
    swipeThreshold = 0.12
  }: UseContactlessOptions = {}
) => {
  const recognizerRef = useRef<GestureRecognizer | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isRunning = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const tracking = useRef<TrackingState>({
    historyX: [],
    swipeAccumulator: 0,
    lastGestureName: '',
    lastOpenPalmTime: 0,
    cooldownEnd: 0
  });

  const initHandTracking = useCallback(async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );

      const recognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
          delegate: "GPU"
        },
        runningMode,
        numHands
      });

      recognizerRef.current = recognizer;
      setIsReady(true);
    } catch (e) {
      console.error("Failed to initialize MediaPipe", e);
    }
  }, [runningMode, numHands]);

  useEffect(() => {
    initHandTracking();
    return () => stopCamera();
  }, [initHandTracking]);

  const startCamera = async (videoElement: HTMLVideoElement | null) => {
    if (!videoElement) return;

    videoRef.current = videoElement;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      videoElement.srcObject = stream;
      streamRef.current = stream;

      videoElement.onloadedmetadata = () => {
        videoElement.play();
        isRunning.current = true;
        // Delay prediction to ensure camera stream is stable and has dimensions
        setTimeout(() => {
          predictWebcam();
        }, 500);
      };
    } catch (e) {
      console.error("Error accessing camera", e);
    }
  };

  const stopCamera = () => {
    isRunning.current = false;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Minimal safe structure for MediaPipe result
  type GestureResult = {
    landmarks?: Array<Array<{ x: number; y: number }>>;
    gestures?: Array<Array<{ categoryName: string }>>;
  };

  const processComplexGestures = (results: GestureResult): string | null => {
    if (!results.landmarks || results.landmarks.length === 0) {
      tracking.current.historyX = [];
      tracking.current.swipeAccumulator = 0;
      tracking.current.lastGestureName = '';
      return null;
    }

    const now = Date.now();
    let semanticGesture: string | null = null;

    if (now > tracking.current.cooldownEnd) {
      // PRANAM
      if (results.landmarks.length === 2) {
        const hand1 = results.landmarks[0];
        const hand2 = results.landmarks[1];

        const indexDist = Math.hypot(
          hand1[8].x - hand2[8].x,
          hand1[8].y - hand2[8].y
        );

        const wristDist = Math.hypot(
          hand1[0].x - hand2[0].x,
          hand1[0].y - hand2[0].y
        );

        if (indexDist < 0.1 && wristDist < 0.15) {
          semanticGesture = 'Asalam walekum Lyaari';
          tracking.current.cooldownEnd = now + 1500;
        }
      }

      const gestureObj =
        results.gestures?.[0]?.[0] ?? null;

      const currentName = gestureObj?.categoryName ?? 'None';

      if (!semanticGesture) {
        if (currentName !== tracking.current.lastGestureName) {
          if (currentName === 'Closed_Fist') {
            semanticGesture = 'Fist';
            tracking.current.cooldownEnd = now + 400;
          } else if (currentName === 'Pointing_Up') {
            semanticGesture = 'Single Finger';
            tracking.current.cooldownEnd = now + 400;
          } else if (currentName === 'Victory') {
            semanticGesture = 'V-shape';
            tracking.current.cooldownEnd = now + 400;
          } else if (currentName === 'Open_Palm') {
            if (
              now - tracking.current.lastOpenPalmTime < 800 &&
              now - tracking.current.lastOpenPalmTime > 100
            ) {
              semanticGesture = 'Double Palm';
              tracking.current.lastOpenPalmTime = 0;
              tracking.current.cooldownEnd = now + 1000;
            } else {
              semanticGesture = 'Open Palm';
              tracking.current.lastOpenPalmTime = now;
              tracking.current.cooldownEnd = now + 400;
            }
          }
        }

        // Swipe logic (Only if palm is open)
        const wristX = results.landmarks[0][0].x;

        if (tracking.current.historyX.length > 0 && !semanticGesture) {
          const prev =
            tracking.current.historyX[
              tracking.current.historyX.length - 1
            ];

          const deltaX = wristX - prev.x;
          const deltaTime = now - prev.time;

          if (deltaTime > 0) {
            const velocity = deltaX / deltaTime;

            // Sensitivity filter
            if (Math.abs(velocity) > 0.0008) {
              tracking.current.swipeAccumulator += deltaX;
            } else {
              tracking.current.swipeAccumulator = 0;
            }

            if (
              Math.abs(tracking.current.swipeAccumulator) > swipeThreshold
            ) {
              // Ensure it's an open palm swipe as requested
              if (currentName === 'Open_Palm') {
                semanticGesture =
                  tracking.current.swipeAccumulator > 0
                    ? 'Right Swipe'
                    : 'Left Swipe';

                tracking.current.swipeAccumulator = 0;
                tracking.current.historyX = [];
                tracking.current.cooldownEnd = now + 1000;
              } else {
                // Reset accumulator if hand is not in open palm
                tracking.current.swipeAccumulator = 0;
              }
            }
          }
        }

        tracking.current.historyX.push({ x: wristX, time: now });
        if (tracking.current.historyX.length > 10) {
          tracking.current.historyX.shift();
        }
      }

      tracking.current.lastGestureName = currentName;
    }

    return semanticGesture;
  };

  const predictWebcam = () => {
    if (!recognizerRef.current || !videoRef.current) return;

    isRunning.current = true;
    let lastVideoTime = -1;

    const tick = () => {
      if (!isRunning.current || !videoRef.current || !recognizerRef.current) return;

      if (
        videoRef.current.currentTime !== lastVideoTime &&
        videoRef.current.videoWidth > 0 &&
        videoRef.current.videoHeight > 0
      ) {
        lastVideoTime = videoRef.current.currentTime;

        try {
          const results = recognizerRef.current.recognizeForVideo(
            videoRef.current,
            performance.now()
          ) as GestureResult;

          const semanticGesture = processComplexGestures(results);

          callbackRef.current?.({ results, semanticGesture });
        } catch (e) {
          console.debug("MediaPipe recognition skipped for this frame:", e);
        }
      }

      requestAnimationFrame(tick);
    };

    tick();
  };

  return { start: startCamera, stop: stopCamera, isReady };
};