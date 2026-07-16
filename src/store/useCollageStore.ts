"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CollageState, CollageImage, CanvasSettings } from "./types";

const ASPECT_RATIOS: Record<CanvasSettings["aspectRatio"], number> = {
  "1:1": 1,
  "4:3": 4 / 3,
  "16:9": 16 / 9,
  "3:4": 3 / 4,
  "9:16": 9 / 16,
};

const CANVAS_BASE_WIDTH = 1200;

const getCanvasDimensions = (
  aspectRatio: CanvasSettings["aspectRatio"]
): { width: number; height: number } => {
  const ratio = ASPECT_RATIOS[aspectRatio];
  return {
    width: CANVAS_BASE_WIDTH,
    height: Math.round(CANVAS_BASE_WIDTH / ratio),
  };
};

const initialSettings: CanvasSettings = {
  ...getCanvasDimensions("4:3"),
  backgroundColor: "#1a1a1a",
  gap: 10,
  aspectRatio: "4:3",
};

export const useCollageStore = create<CollageState>()(
  persist(
    (set) => ({
      images: [],
      settings: initialSettings,
      mode: "grid",
      lockAspectRatio: true,
      selectedImageId: null,

      addImage: (image) =>
        set((state) => ({
          images: [
            ...state.images,
            { ...image, id: crypto.randomUUID() },
          ],
        })),

      removeImage: (id) =>
        set((state) => ({
          images: state.images.filter((img) => img.id !== id),
          selectedImageId:
            state.selectedImageId === id ? null : state.selectedImageId,
        })),

      updateImage: (id, updates) =>
        set((state) => ({
          images: state.images.map((img) =>
            img.id === id ? { ...img, ...updates } : img
          ),
        })),

      clearImages: () =>
        set({
          images: [],
          selectedImageId: null,
        }),

      setImages: (images) =>
        set({
          images,
          selectedImageId: null,
        }),

      setSettings: (newSettings) =>
        set((state) => {
          const updated = { ...state.settings, ...newSettings };

          // Recalculate dimensions if aspect ratio changes
          if (newSettings.aspectRatio) {
            const dims = getCanvasDimensions(newSettings.aspectRatio);
            updated.width = dims.width;
            updated.height = dims.height;
          }

          return { settings: updated };
        }),

      setMode: (mode) => set({ mode }),

      setLockAspectRatio: (lock) => set({ lockAspectRatio: lock }),

      setSelectedImageId: (id) => set({ selectedImageId: id }),
    }),
    {
      name: "collage-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist settings, NOT images (images are too large for localStorage ~5MB limit)
      partialize: (state) => ({
        settings: state.settings,
        mode: state.mode,
        lockAspectRatio: state.lockAspectRatio,
      }),
    }
  )
);

// Helper to get image aspect ratio
export const getImageAspectRatio = (
  img: HTMLImageElement
): { width: number; height: number } => {
  const maxWidth = 300;
  const maxHeight = 300;
  let width = img.naturalWidth;
  let height = img.naturalHeight;

  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }
  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }

  return { width, height };
};
