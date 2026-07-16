import type { CollageImage } from "@/store/types";

interface GridConfig {
  columns: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
  gap: number;
  canvasWidth: number;
  canvasHeight: number;
}

/**
 * Calculate optimal grid layout based on image count and canvas dimensions
 * Uses a simple row-based approach suitable for photo collages
 */
export const calculateGridLayout = (
  imageCount: number,
  canvasWidth: number,
  canvasHeight: number,
  gap: number
): GridConfig => {
  if (imageCount === 0) {
    return {
      columns: 0,
      rows: 0,
      cellWidth: 0,
      cellHeight: 0,
      gap,
      canvasWidth,
      canvasHeight,
    };
  }

  // Determine optimal columns and rows
  let columns: number;
  let rows: number;

  if (imageCount <= 2) {
    columns = imageCount;
    rows = 1;
  } else if (imageCount <= 4) {
    columns = 2;
    rows = 2;
  } else if (imageCount <= 6) {
    columns = 3;
    rows = 2;
  } else if (imageCount <= 9) {
    columns = 3;
    rows = 3;
  } else if (imageCount <= 12) {
    columns = 4;
    rows = 3;
  } else {
    // For larger numbers, calculate based on aspect ratio
    const canvasRatio = canvasWidth / canvasHeight;
    columns = Math.min(imageCount, Math.ceil(Math.sqrt(imageCount * canvasRatio)));
    rows = Math.ceil(imageCount / columns);
  }

  // Calculate cell dimensions accounting for gaps
  const totalGapWidth = gap * (columns + 1);
  const totalGapHeight = gap * (rows + 1);
  const availableWidth = canvasWidth - totalGapWidth;
  const availableHeight = canvasHeight - totalGapHeight;

  const cellWidth = Math.floor(availableWidth / columns);
  const cellHeight = Math.floor(availableHeight / rows);

  return {
    columns,
    rows,
    cellWidth,
    cellHeight,
    gap,
    canvasWidth,
    canvasHeight,
  };
};

/**
 * Auto-arrange images into a neat grid layout
 */
export const autoArrangeImages = (
  images: CollageImage[],
  canvasWidth: number,
  canvasHeight: number,
  gap: number
): CollageImage[] => {
  if (images.length === 0) return [];

  const grid = calculateGridLayout(
    images.length,
    canvasWidth,
    canvasHeight,
    gap
  );

  // Sort images by their original index to maintain order
  const sortedImages = [...images];

  const arrangedImages: CollageImage[] = sortedImages.map((img, index) => {
    const col = index % grid.columns;
    const row = Math.floor(index / grid.columns);

    // Calculate position
    const x = gap + col * (grid.cellWidth + gap);
    const y = gap + row * (grid.cellHeight + gap);

    // Scale image to fit cell while maintaining aspect ratio
    const imgAspectRatio = img.width / img.height;
    const cellAspectRatio = grid.cellWidth / grid.cellHeight;

    let newWidth: number;
    let newHeight: number;

    if (imgAspectRatio > cellAspectRatio) {
      // Image is wider than cell - fit to width
      newWidth = grid.cellWidth;
      newHeight = Math.round(grid.cellWidth / imgAspectRatio);
    } else {
      // Image is taller than cell - fit to height
      newHeight = grid.cellHeight;
      newWidth = Math.round(grid.cellHeight * imgAspectRatio);
    }

    // Center the image in the cell
    const offsetX = Math.round((grid.cellWidth - newWidth) / 2);
    const offsetY = Math.round((grid.cellHeight - newHeight) / 2);

    return {
      ...img,
      x: x + offsetX,
      y: y + offsetY,
      width: newWidth,
      height: newHeight,
      rotation: 0,
    };
  });

  return arrangedImages;
};

/**
 * Get grid statistics for display
 */
export const getGridStats = (
  imageCount: number,
  canvasWidth: number,
  canvasHeight: number,
  gap: number
): { columns: number; rows: number; cellSize: string } => {
  const grid = calculateGridLayout(imageCount, canvasWidth, canvasHeight, gap);
  return {
    columns: grid.columns,
    rows: grid.rows,
    cellSize: `${grid.cellWidth} × ${grid.cellHeight}`,
  };
};
