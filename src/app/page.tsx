"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useCallback } from "react";
import Konva from "konva";
import Toolbar from "@/components/Toolbar";

// Dynamic import for Konva (SSR incompatible)
const CollageCanvas = dynamic(() => import("@/components/CollageCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-neutral-900">
      <div className="text-neutral-400">Loading canvas...</div>
    </div>
  ),
});

export default function HomePage() {
  const stageRef = useRef<Konva.Stage | null>(null);
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPointerPosition, setLastPointerPosition] = useState({ x: 0, y: 0 });

  // Handle zoom with wheel
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = e.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * 1.1 : oldScale / 1.1;

    // Limit scale range
    const clampedScale = Math.max(0.1, Math.min(5, newScale));

    setScale(clampedScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    stage.position(newPos);
    stage.batchDraw();
  }, [scale]);

  // Handle panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Middle mouse button or Ctrl+Click to pan
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      setIsPanning(true);
      setLastPointerPosition({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning || !stageRef.current) return;

    const dx = e.clientX - lastPointerPosition.x;
    const dy = e.clientY - lastPointerPosition.y;

    stageRef.current.position({
      x: stageRef.current.x() + dx,
      y: stageRef.current.y() + dy,
    });
    stageRef.current.batchDraw();

    setLastPointerPosition({ x: e.clientX, y: e.clientY });
  }, [isPanning, lastPointerPosition]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Reset zoom
  const handleResetZoom = useCallback(() => {
    if (!stageRef.current) return;
    stageRef.current.position({ x: 0, y: 0 });
    setScale(1);
    stageRef.current.batchDraw();
  }, []);

  // Fit to screen
  const handleFitToScreen = useCallback(() => {
    handleResetZoom();
  }, [handleResetZoom]);

  return (
    <div className="h-screen flex bg-neutral-950">
      {/* Toolbar */}
      <Toolbar stageRef={stageRef} />

      {/* Main Canvas Area */}
      <div
        className="flex-1 flex flex-col relative"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: isPanning ? "grabbing" : "default",
          userSelect: "none",
        }}
      >
        {/* Collage Canvas */}
        <div className="flex-1 overflow-hidden">
          <CollageCanvas stageRef={stageRef} />
        </div>

        {/* Zoom Controls Bar */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-neutral-800/90 backdrop-blur-sm rounded-lg p-2 border border-neutral-700">
          <button
            onClick={() => setScale((s) => Math.max(0.1, s / 1.2))}
            className="w-8 h-8 flex items-center justify-center bg-neutral-700 hover:bg-neutral-600 text-white rounded transition-colors"
            title="Zoom Out"
          >
            −
          </button>
          <span className="text-sm text-white w-16 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(5, s * 1.2))}
            className="w-8 h-8 flex items-center justify-center bg-neutral-700 hover:bg-neutral-600 text-white rounded transition-colors"
            title="Zoom In"
          >
            +
          </button>
          <div className="w-px h-6 bg-neutral-600 mx-1" />
          <button
            onClick={handleFitToScreen}
            className="px-2 py-1 text-xs bg-neutral-700 hover:bg-neutral-600 text-white rounded transition-colors"
            title="Fit to Screen"
          >
            Fit
          </button>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 text-xs text-neutral-500 bg-neutral-900/80 backdrop-blur-sm px-3 py-2 rounded-lg">
          <p>Scroll to zoom • Ctrl+Click to pan • Click image to select</p>
        </div>
      </div>
    </div>
  );
}
