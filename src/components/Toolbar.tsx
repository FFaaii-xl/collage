"use client";

import { useCallback, useRef } from "react";
import { useCollageStore } from "@/store/useCollageStore";
import { readFileAsDataURL, isImageFile } from "@/utils/fileReader";
import { autoArrangeImages } from "@/utils/autoArrange";
import { exportCanvasAsImage } from "@/utils/exportCanvas";
import type Konva from "konva";
import type { CanvasSettings } from "@/store/types";

interface ToolbarProps {
  stageRef: React.RefObject<Konva.Stage | null>;
}

const ASPECT_RATIOS: { label: string; value: CanvasSettings["aspectRatio"] }[] = [
  { label: "1:1", value: "1:1" },
  { label: "4:3", value: "4:3" },
  { label: "16:9", value: "16:9" },
  { label: "3:4", value: "3:4" },
  { label: "9:16", value: "9:16" },
];

const BACKGROUND_COLORS = [
  "#1a1a1a",
  "#ffffff",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export default function Toolbar({ stageRef }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    images,
    settings,
    mode,
    lockAspectRatio,
    addImage,
    clearImages,
    setSettings,
    setMode,
    setLockAspectRatio,
  } = useCollageStore();

  // Handle file selection
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      for (const file of Array.from(files)) {
        if (isImageFile(file)) {
          try {
            const dataURL = await readFileAsDataURL(file);

            // Get image dimensions
            const img = new Image();
            img.src = dataURL;
            await new Promise((resolve) => (img.onload = resolve));

            // Calculate display size (max 300px)
            const maxSize = 300;
            let width = img.naturalWidth;
            let height = img.naturalHeight;

            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }

            // Add image at center of canvas
            const x = (settings.width - width) / 2;
            const y = (settings.height - height) / 2;

            addImage({
              src: dataURL,
              x,
              y,
              width,
              height,
              rotation: 0,
            });
          } catch (err) {
            console.error("Error loading image:", err);
          }
        }
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [addImage, settings.width, settings.height]
  );

  // Handle drop
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer.files;

      for (const file of Array.from(files)) {
        if (isImageFile(file)) {
          try {
            const dataURL = await readFileAsDataURL(file);

            const img = new Image();
            img.src = dataURL;
            await new Promise((resolve) => (img.onload = resolve));

            const maxSize = 300;
            let width = img.naturalWidth;
            let height = img.naturalHeight;

            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }

            const x = (settings.width - width) / 2;
            const y = (settings.height - height) / 2;

            addImage({
              src: dataURL,
              x,
              y,
              width,
              height,
              rotation: 0,
            });
          } catch (err) {
            console.error("Error loading image:", err);
          }
        }
      }
    },
    [addImage, settings.width, settings.height]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Auto-arrange images
  const handleAutoArrange = useCallback(() => {
    const arranged = autoArrangeImages(
      images,
      settings.width,
      settings.height,
      settings.gap
    );

    // Update all images
    images.forEach((img, index) => {
      const arrangedImg = arranged[index];
      useCollageStore.getState().updateImage(img.id, {
        x: arrangedImg.x,
        y: arrangedImg.y,
        width: arrangedImg.width,
        height: arrangedImg.height,
        rotation: arrangedImg.rotation,
      });
    });
  }, [images, settings]);

  // Export as image
  const handleExport = useCallback(async () => {
    if (!stageRef.current) return;
    await exportCanvasAsImage(stageRef.current, {
      pixelRatio: 2,
      mimeType: "image/png",
      filename: "collage",
    });
  }, [stageRef]);

  return (
    <div
      className="w-72 bg-neutral-900 border-r border-neutral-800 flex flex-col h-full overflow-y-auto"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Header */}
      <div className="p-4 border-b border-neutral-800">
        <h1 className="text-lg font-semibold text-white">Collage Maker</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Drag & drop images or click to add
        </p>
      </div>

      {/* Image Upload */}
      <div className="p-4 border-b border-neutral-800">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-input"
        />
        <label
          htmlFor="file-input"
          className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center font-medium rounded-lg cursor-pointer transition-colors"
        >
          Add Images
        </label>
        {images.length > 0 && (
          <p className="text-xs text-neutral-400 mt-2 text-center">
            {images.length} image{images.length > 1 ? "s" : ""} added
          </p>
        )}
      </div>

      {/* Layout Mode */}
      <div className="p-4 border-b border-neutral-800">
        <h2 className="text-sm font-medium text-white mb-3">Layout Mode</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setMode("grid")}
            className={`flex-1 py-2 px-3 text-sm rounded-lg transition-colors ${
              mode === "grid"
                ? "bg-blue-600 text-white"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setMode("free")}
            className={`flex-1 py-2 px-3 text-sm rounded-lg transition-colors ${
              mode === "free"
                ? "bg-blue-600 text-white"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            Free
          </button>
        </div>
      </div>

      {/* Canvas Settings */}
      <div className="p-4 border-b border-neutral-800">
        <h2 className="text-sm font-medium text-white mb-3">
          Canvas Settings
        </h2>

        {/* Aspect Ratio */}
        <div className="mb-4">
          <label className="text-xs text-neutral-400 mb-2 block">
            Aspect Ratio
          </label>
          <select
            value={settings.aspectRatio}
            onChange={(e) =>
              setSettings({ aspectRatio: e.target.value as CanvasSettings["aspectRatio"] })
            }
            className="w-full bg-neutral-800 text-white text-sm rounded-lg px-3 py-2 border border-neutral-700 focus:outline-none focus:border-blue-500"
          >
            {ASPECT_RATIOS.map((ratio) => (
              <option key={ratio.value} value={ratio.value}>
                {ratio.label}
              </option>
            ))}
          </select>
        </div>

        {/* Background Color */}
        <div className="mb-4">
          <label className="text-xs text-neutral-400 mb-2 block">
            Background Color
          </label>
          <div className="flex flex-wrap gap-2">
            {BACKGROUND_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setSettings({ backgroundColor: color })}
                className={`w-8 h-8 rounded-lg border-2 transition-all ${
                  settings.backgroundColor === color
                    ? "border-blue-500 scale-110"
                    : "border-neutral-700 hover:border-neutral-500"
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Gap */}
        <div className="mb-4">
          <label className="text-xs text-neutral-400 mb-2 block">
            Gap: {settings.gap}px
          </label>
          <input
            type="range"
            min="0"
            max="50"
            value={settings.gap}
            onChange={(e) => setSettings({ gap: Number(e.target.value) })}
            className="w-full accent-blue-500"
          />
        </div>

        {/* Lock Aspect Ratio */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="lock-aspect"
            checked={lockAspectRatio}
            onChange={(e) => setLockAspectRatio(e.target.checked)}
            className="w-4 h-4 accent-blue-500"
          />
          <label htmlFor="lock-aspect" className="text-sm text-neutral-300">
            Lock aspect ratio on resize
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-b border-neutral-800">
        <h2 className="text-sm font-medium text-white mb-3">Actions</h2>
        <div className="space-y-2">
          <button
            onClick={handleAutoArrange}
            disabled={images.length === 0}
            className="w-full py-2 px-4 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            Auto-Arrange
          </button>
          <button
            onClick={handleExport}
            disabled={images.length === 0}
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            Export (High DPI)
          </button>
          <button
            onClick={clearImages}
            disabled={images.length === 0}
            className="w-full py-2 px-4 bg-red-600/20 hover:bg-red-600/30 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-red-400 text-sm font-medium rounded-lg transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="p-4">
        <h2 className="text-sm font-medium text-white mb-3">Info</h2>
        <div className="text-xs text-neutral-400 space-y-1">
          <p>Canvas: {settings.width} × {settings.height}</p>
          <p>Images: {images.length}</p>
          <p>Mode: {mode === "grid" ? "Grid Auto-Arrange" : "Free Move"}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto p-4 border-t border-neutral-800">
        <p className="text-xs text-neutral-500 text-center">
          100% Local Processing
        </p>
        <p className="text-xs text-neutral-600 text-center mt-1">
          Images never leave your browser
        </p>
      </div>
    </div>
  );
}
