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
 * Images will fill the entire canvas with no empty space
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

  // Determine optimal columns and rows to fill canvas
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
 * Auto-arrange images to FILL the entire canvas (no empty space)
 * Uses "cover" style - images stretch to completely fill each cell
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

  const arrangedImages: CollageImage[] = images.map((img, index) => {
    const col = index % grid.columns;
    const row = Math.floor(index / grid.columns);

    // Calculate position with gap
    const x = gap + col * (grid.cellWidth + gap);
    const y = gap + row * (grid.cellHeight + gap);

    // FILL the cell completely - no gaps, no empty space
    // Images stretch to exactly fill the cell
    return {
      ...img,
      x: x,
      y: y,
      width: grid.cellWidth,
      height: grid.cellHeight,
      rotation: 0,
    };
  });

  return arrangedImages;
};

/**
 * Auto-arrange images in a masonry-style layout
 * Maintains aspect ratio but fills width, variable height
 */
export const autoArrangeMasonry = (
  images: CollageImage[],
  canvasWidth: number,
  canvasHeight: number,
  gap: number,
  columns: number = 3
): CollageImage[] => {
  if (images.length === 0) return [];

  // Calculate column width
  const totalGapWidth = gap * (columns + 1);
  const columnWidth = Math.floor((canvasWidth - totalGapWidth) / columns);

  // Calculate initial row height based on average aspect ratio
  let totalAspectRatio = 0;
  images.forEach((img) => {
    totalAspectRatio += img.width / img.height;
  });
  const avgAspectRatio = totalAspectRatio / images.length;
  const initialRowHeight = Math.floor(columnWidth / avgAspectRatio);

  // Distribute images into rows
  const rows: { images: CollageImage[]; height: number }[] = [];
  let currentRowImages: CollageImage[] = [];
  let currentRowHeight = 0;

  images.forEach((img, index) => {
    // Calculate image height in this column
    const imgHeight = Math.floor(columnWidth / (img.width / img.height));

    // If adding this image would exceed canvas height, start new row
    if (currentRowHeight + imgHeight > canvasHeight && currentRowImages.length > 0) {
      rows.push({ images: [...currentRowImages], height: currentRowHeight });
      currentRowImages = [];
      currentRowHeight = 0;
    }

    currentRowImages.push(img);
    currentRowHeight = Math.max(currentRowHeight, imgHeight);
  });

  // Add last row
  if (currentRowImages.length > 0) {
    rows.push({ images: [...currentRowImages], height: currentRowHeight });
  }

  // Position images
  const arrangedImages: CollageImage[] = [];
  let yOffset = gap;

  rows.forEach((row) => {
    const scaleFactor = Math.min(
      (canvasHeight - gap * (rows.length + 1)) / (yOffset + row.height > canvasHeight - gap ? row.height : canvasHeight - gap - yOffset - gap * (rows.length - 1)),
      1
    );

    let xOffset = gap;
    row.images.forEach((img) => {
      const imgHeight = Math.floor((canvasWidth - gap * (row.images.length + 1)) / row.images.length / (img.width / img.height));

      arrangedImages.push({
        ...img,
        x: xOffset,
        y: yOffset,
        width: Math.floor(columnWidth),
        height: imgHeight,
        rotation: 0,
      });

      xOffset += columnWidth + gap;
    });

    yOffset += Math.min(row.height, Math.floor((canvasHeight - gap * (rows.length + 1)) / rows.length)) + gap;
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
