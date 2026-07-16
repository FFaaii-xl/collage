export interface CollageImage {
  id: string;
  src: string; // data URL
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface CanvasSettings {
  width: number;
  height: number;
  backgroundColor: string;
  gap: number;
  aspectRatio: "1:1" | "4:3" | "16:9" | "3:4" | "9:16";
}

export type LayoutMode = "grid" | "free";

export interface CollageState {
  images: CollageImage[];
  settings: CanvasSettings;
  mode: LayoutMode;
  lockAspectRatio: boolean;
  selectedImageId: string | null;

  // Actions
  addImage: (image: Omit<CollageImage, "id">) => void;
  removeImage: (id: string) => void;
  updateImage: (id: string, updates: Partial<CollageImage>) => void;
  clearImages: () => void;
  setImages: (images: CollageImage[]) => void;
  setSettings: (settings: Partial<CanvasSettings>) => void;
  setMode: (mode: LayoutMode) => void;
  setLockAspectRatio: (lock: boolean) => void;
  setSelectedImageId: (id: string | null) => void;
}
