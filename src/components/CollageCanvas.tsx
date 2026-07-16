"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Transformer, Rect } from "react-konva";
import Konva from "konva";
import { useCollageStore } from "@/store/useCollageStore";
import { getImageDimensions, scaleImageToFit } from "@/utils/fileReader";

interface CollageCanvasProps {
  stageRef: React.RefObject<Konva.Stage | null>;
}

export default function CollageCanvas({ stageRef }: CollageCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [images, setImages] = useState<{
    [key: string]: HTMLImageElement;
  }>({});

  const {
    images: collageImages,
    settings,
    selectedImageId,
    lockAspectRatio,
    setSelectedImageId,
    updateImage,
  } = useCollageStore();

  // Handle container resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Load images when collageImages changes
  useEffect(() => {
    const loadImages = async () => {
      const newImages: { [key: string]: HTMLImageElement } = {};

      for (const img of collageImages) {
        if (!images[img.id]) {
          const htmlImg = new window.Image();
          htmlImg.src = img.src;
          await new Promise((resolve) => {
            htmlImg.onload = resolve;
          });
          newImages[img.id] = htmlImg;
        } else {
          newImages[img.id] = images[img.id];
        }
      }

      setImages((prev) => ({ ...prev, ...newImages }));
    };

    loadImages();
  }, [collageImages]);

  // Update transformer when selection changes
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;

    const stage = stageRef.current;
    const selectedNode = stage.findOne(`#${selectedImageId}`);

    if (selectedNode) {
      transformerRef.current.nodes([selectedNode]);
      transformerRef.current.getLayer()?.batchDraw();
    } else {
      transformerRef.current.nodes([]);
    }
  }, [selectedImageId, stageRef]);

  // Handle stage click for deselection
  const handleStageMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        setSelectedImageId(null);
      }
    },
    [setSelectedImageId]
  );

  // Handle image click for selection
  const handleImageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>, imageId: string) => {
      e.cancelBubble = true;
      setSelectedImageId(imageId);
    },
    [setSelectedImageId]
  );

  // Handle image drag end
  const handleImageDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>, imageId: string) => {
      const node = e.target;
      updateImage(imageId, {
        x: node.x(),
        y: node.y(),
      });
    },
    [updateImage]
  );

  // Handle image transform end (resize/rotate)
  const handleTransformEnd = useCallback(
    (e: Konva.KonvaEventObject<Event>, imageId: string) => {
      const node = e.target;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      // Reset scale to 1 and adjust width/height instead
      node.scaleX(1);
      node.scaleY(1);

      updateImage(imageId, {
        x: node.x(),
        y: node.y(),
        width: Math.max(20, node.width() * scaleX),
        height: Math.max(20, node.height() * scaleY),
        rotation: node.rotation(),
      });
    },
    [updateImage]
  );

  // Calculate scale to fit canvas in container
  const scale = Math.min(
    containerSize.width / settings.width,
    containerSize.height / settings.height,
    1
  );

  // Calculate canvas position to center it
  const canvasOffsetX = (containerSize.width - settings.width * scale) / 2;
  const canvasOffsetY = (containerSize.height - settings.height * scale) / 2;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden bg-neutral-900 relative"
    >
      <Stage
        ref={stageRef}
        width={containerSize.width}
        height={containerSize.height}
        onMouseDown={handleStageMouseDown}
        scaleX={scale}
        scaleY={scale}
        x={canvasOffsetX}
        y={canvasOffsetY}
        draggable={false}
        style={{
          cursor: "default",
        }}
      >
        <Layer>
          {/* Canvas background */}
          <Rect
            x={0}
            y={0}
            width={settings.width}
            height={settings.height}
            fill={settings.backgroundColor}
            listening={false}
          />

          {/* Images */}
          {collageImages.map((img) => {
            const htmlImg = images[img.id];
            if (!htmlImg) return null;

            return (
              <KonvaImage
                key={img.id}
                id={img.id}
                image={htmlImg}
                x={img.x}
                y={img.y}
                width={img.width}
                height={img.height}
                rotation={img.rotation}
                draggable
                onClick={(e) => handleImageClick(e, img.id)}
                onTap={() => setSelectedImageId(img.id)}
                onDragEnd={(e) => handleImageDragEnd(e, img.id)}
                onTransformEnd={(e) => handleTransformEnd(e, img.id)}
                perfectDrawEnabled={false}
                shadowColor="black"
                shadowBlur={selectedImageId === img.id ? 10 : 0}
                shadowOpacity={0.3}
                shadowEnabled={selectedImageId === img.id}
              />
            );
          })}

          {/* Transformer for selected image */}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              // Limit minimum size
              if (newBox.width < 20 || newBox.height < 20) {
                return oldBox;
              }
              return newBox;
            }}
            enabledAnchors={
              lockAspectRatio
                ? [
                    "top-left",
                    "top-right",
                    "bottom-left",
                    "bottom-right",
                    "middle-left",
                    "middle-right",
                    "top-center",
                    "bottom-center",
                  ]
                : undefined
            }
            rotateEnabled={true}
            rotationSnaps={[0, 90, 180, 270]}
            rotationSnapTolerance={5}
            borderStroke="#3b82f6"
            borderStrokeWidth={2}
            anchorFill="#3b82f6"
            anchorStroke="#60a5fa"
            anchorSize={10}
            anchorCornerRadius={2}
            keepRatio={lockAspectRatio}
          />
        </Layer>
      </Stage>
    </div>
  );
}
