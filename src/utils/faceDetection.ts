import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

export interface FaceCenter {
  x: number; // 0-1, normalized to image width
  y: number; // 0-1, normalized to image height
}

let faceDetector: FaceDetector | null = null;
let initPromise: null | Promise<FaceDetector | null> = null;

/**
 * Detect faces in an image and return the average center position.
 * Uses MediaPipe Face Detection.
 * Returns null if detection fails or no faces are found.
 */
export async function detectFaceCenter(
  img: HTMLImageElement
): Promise<FaceCenter | null> {
  try {
    const detector = await getDetector();
    if (!detector) return null;

    const result = detector.detect(img);

    if (!result.detections || result.detections.length === 0) {
      return null;
    }

    // Average center of all detected faces
    let totalX = 0;
    let totalY = 0;

    for (const detection of result.detections) {
      const box = detection.boundingBox;
      if (box) {
        // boundingBox origin is top-left, we want center
        totalX += box.originX + box.width / 2;
        totalY += box.originY + box.height / 2;
      }
    }

    const count = result.detections.length;

    return {
      x: totalX / count / img.width,
      y: totalY / count / img.height,
    };
  } catch (error: unknown) {
    console.warn("Face detection failed:", error);
    return null;
  }
}

/**
 * Initialize the MediaPipe Face Detector (lazy, singleton)
 */
async function getDetector(): Promise<FaceDetector | null> {
  if (faceDetector) return faceDetector;

  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      faceDetector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          delegate: "GPU",
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
        },
        runningMode: "IMAGE",
      });

      return faceDetector;
    } catch (error: unknown) {
      console.warn("Failed to initialize face detector:", error);
      return null;
    }
  })();

  return initPromise;
}
