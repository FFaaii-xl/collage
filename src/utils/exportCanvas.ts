import type Konva from "konva";

export interface ExportOptions {
  pixelRatio?: number;
  mimeType?: "image/png" | "image/jpeg" | "image/webp";
  quality?: number; // 0-1 for JPEG/WebP
  filename?: string;
}

/**
 * Export Konva stage as high-DPI image
 * Uses toBlob for better memory efficiency with large images
 */
export const exportCanvasAsImage = async (
  stage: Konva.Stage,
  options: ExportOptions = {}
): Promise<void> => {
  const {
    pixelRatio = 2,
    mimeType = "image/png",
    quality = 1,
    filename = "collage",
  } = options;

  // Store original stage properties
  const originalScale = { x: stage.scaleX(), y: stage.scaleY() };
  const originalPosition = { x: stage.x(), y: stage.y() };

  // Reset transform for clean export
  stage.scale({ x: 1, y: 1 });
  stage.position({ x: 0, y: 0 });

  try {
    // Use toBlob for better memory efficiency
    const blob = await new Promise<Blob | null>((resolve) => {
      stage.toBlob({
        pixelRatio,
        mimeType,
        quality,
        callback: (blob) => resolve(blob),
      });
    });

    if (!blob) {
      throw new Error("Failed to create blob from canvas");
    }

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${filename}-${Date.now()}.${mimeType.split("/")[1]}`;
    link.href = url;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
  } finally {
    // Restore original transform
    stage.scale(originalScale);
    stage.position(originalPosition);
  }
};

/**
 * Alternative export using toDataURL (simpler but less memory efficient)
 */
export const exportCanvasAsDataURL = (
  stage: Konva.Stage,
  options: ExportOptions = {}
): string => {
  const { pixelRatio = 2, mimeType = "image/png", quality = 1 } = options;

  // Store original stage properties
  const originalScale = { x: stage.scaleX(), y: stage.scaleY() };
  const originalPosition = { x: stage.x(), y: stage.y() };

  // Reset transform for clean export
  stage.scale({ x: 1, y: 1 });
  stage.position({ x: 0, y: 0 });

  try {
    const dataURL = stage.toDataURL({
      pixelRatio,
      mimeType,
      quality,
    });
    return dataURL;
  } finally {
    // Restore original transform
    stage.scale(originalScale);
    stage.position(originalPosition);
  }
};

/**
 * Download image from data URL
 */
export const downloadDataURL = (
  dataURL: string,
  filename: string = "collage"
): void => {
  const link = document.createElement("a");
  link.download = `${filename}-${Date.now()}.png`;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
