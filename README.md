# Collage Maker

A free, offline-capable photo collage creator built with Next.js, React-Konva, and Zustand.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

## Features

- 🎨 **Drag & Drop Images** - Drop images directly from your computer
- 📐 **Auto-Arrange** - Automatically arrange images in a neat grid
- 📤 **High-DPI Export** - Export at 2x resolution for print quality
- 🔒 **100% Offline** - All processing happens locally in your browser
- 📱 **PWA Support** - Install as an app on your device
- 🌙 **Dark Mode UI** - Clean, modern dark interface
- 🔍 **Zoom & Pan** - Navigate large canvases easily
- ⛔ **Aspect Ratio Lock** - Maintain image proportions when resizing

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/FFaaii-xl/collage.git
cd collage

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run start
```

## Usage

1. **Add Images**: Click "Add Images" button or drag & drop images from your computer
2. **Arrange**: Use "Auto-Arrange" to automatically position images in a grid, or drag them manually
3. **Customize**: Change canvas aspect ratio, background color, and gap size from the sidebar
4. **Export**: Click "Export (High DPI)" to download your collage as a PNG image

### Controls

- **Scroll** - Zoom in/out
- **Ctrl + Click** - Pan the canvas
- **Click Image** - Select for editing

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Canvas**: React-Konva
- **State Management**: Zustand with persist middleware
- **Styling**: Tailwind CSS
- **PWA**: @ducanh2912/next-pwa

## Project Structure

```
src/
├── app/
│   ├── layout.tsx      # Root layout with PWA meta
│   ├── page.tsx        # Main collage page
│   └── globals.css     # Global styles
├── components/
│   ├── CollageCanvas.tsx # React-Konva canvas component
│   └── Toolbar.tsx       # Left sidebar controls
├── store/
│   ├── types.ts         # TypeScript interfaces
│   └── useCollageStore.ts # Zustand store
└── utils/
    ├── autoArrange.ts   # Grid auto-arrange algorithm
    ├── fileReader.ts    # FileReader API helpers
    └── exportCanvas.ts  # Export utilities
```

## License

MIT License - Feel free to use this project for personal or commercial purposes.
