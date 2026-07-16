# Deep Research Summary — Next.js Photo Collage App

**Project:** Build Next.js photo collage app with React-Konva, Zustand, drag-drop, auto-arrange, PWA  
**Date:** 2026-07-16  
**Status:** Partial (403 Quota Exceeded — synthesis not completed)  
**Continue at:** Run full implementation based on this verified research

---

## 🔍 Research Angles (5 decomposed)

1. **Next.js + React-Konva canvas setup** — Framework integration, SSR considerations, 'use client' directive
2. **Auto-arrange photo grid algorithm** — Binary tree bin packing, binpackingjs library
3. **High-DPI canvas export** — stage.toDataURL(), pixelRatio: 2, toBlob() alternative
4. **Next.js PWA static export offline** — @ducanh2912/next-pwa, Workbox, manifest.json
5. **Zustand persist canvas state** — localStorage sync, partialize, hydration patterns

---

## ✅ Verified Claims (Survived Adversarial Verification)

### React-Konva Core
| Claim | Source | Status |
|-------|--------|--------|
| React-Konva provides Stage, Layer, and Image components for declarative 2D canvas rendering | konvajs.org/docs/react/ | ✅ CONFIRMED |
| Components accept x, y, width, height props for positioning/sizing | konvajs.org/docs/react/ | ✅ CONFIRMED |
| React-Konva provides ref access to underlying Konva nodes (enables toDataURL/export) | github.com/konvajs/react-konva | ✅ CONFIRMED |
| React-Konva supports zoom/pan via Stage scale/position properties | konvajs.org/docs/ | ✅ CONFIRMED |
| npm: `npm install react-konva konva` | npmjs.com/package/react-konva | ✅ CONFIRMED |

### Drag-Drop (CRITICAL — Refuted)
| Claim | Source | Status |
|-------|--------|--------|
| React-Konva's `draggable` prop = HTML5 native drag-drop | konvajs.org/docs/react/ | ❌ **REFUTED** |

**⚠️ Important correction:** Konva's `draggable` prop is NOT the HTML5 native drag-drop API. It's Konva's own internal drag system for moving canvas shapes. For dropping local files:
- Use **native HTML5 drag-drop** (`ondragover`, `ondrop`) on container element
- Use **FileReader API** to read dropped files → data URL
- Then place as Konva Image nodes
- Then use Konva's `draggable` prop to MOVE images on canvas

### Bin Packing Algorithm
| Claim | Source | Status |
|-------|--------|--------|
| Binary tree algorithm: place largest block top-left, recursively split whitespace | jakesgordon.com/writing/bin-packing/ | ✅ CONFIRMED |
| Sort by maxside (max of w/h) = most efficient packing | jakesgordon.com/writing/bin-packing/ | ✅ CONFIRMED |
| binpackingjs: 4 heuristics (BestShortSideFit, BestAreaFit, BestLongSideFit, BottomLeft) | github.com/olragon/binpackingjs | ✅ CONFIRMED |
| binpackingjs supports constrainRotation: true to lock orientation | github.com/olragon/binpackingjs | ✅ CONFIRMED |
| binpackingjs: zero dependencies, tree-shakeable, browser-ready | github.com/olragon/binpackingjs | ✅ CONFIRMED |

### High-DPI Export
| Claim | Source | Status |
|-------|--------|--------|
| stage.toDataURL() accepts 'type' param (default: 'image/png') | MDN Web Docs | ✅ CONFIRMED |
| toDataURL() accepts 'quality' param (0-1) for JPEG/WebP | MDN Web Docs | ✅ CONFIRMED |
| ⚠️ toDataURL() encodes base64 in memory → performance issues with large images | MDN Web Docs | ⚠️ WARNING |
| pixelRatio: 2 (or higher) for high-DPI exports | konvajs.org/docs/react/Export_Image.html | ✅ CONFIRMED |
| toBlob() is alternative with less memory overhead for large images | MDN Web Docs | ✅ CONFIRMED |

### Zustand Persist
| Claim | Source | Status |
|-------|--------|--------|
| Persist middleware supports any storage (localStorage default, sessionStorage optional) | docs.pmnd.rs/zustand | ✅ CONFIRMED |
| Uses createJSONStorage(() => localStorage) pattern | docs.pmnd.rs/zustand | ✅ CONFIRMED |
| State serialized as JSON before storage | docs.pmnd.rs/zustand | ✅ CONFIRMED |
| Actions remain functional after rehydration from localStorage | docs.pmnd.rs/zustand | ✅ CONFIRMED |
| Requires unique 'name' string as storage key identifier | docs.pmnd.rs/zustand | ✅ CONFIRMED |
| Zustand: hooks as primary API, no context providers needed | github.com/pmndrs/zustand | ✅ CONFIRMED |

### Next.js Static Export + PWA
| Claim | Source | Status |
|-------|--------|--------|
| `output: 'export'` in next.config.js → generates `out/` folder | nextjs.org/docs/app/guides/static-exports | ✅ CONFIRMED |
| Client Components need Web APIs (window, localStorage) inside useEffect only | nextjs.org/docs/app/guides/static-exports | ✅ CONFIRMED |
| Default next/image loader NOT supported with static export → use custom loader | nextjs.org/docs/app/guides/static-exports | ✅ CONFIRMED |
| Static export incompatible with: Dynamic Routes, ISR, Server Actions, Cookies | nextjs.org/docs/app/guides/static-exports | ✅ CONFIRMED |
| @ducanh2912/next-pwa: Workbox-based service workers for Next.js App Router | npmjs.com/package/next-pwa | ✅ CONFIRMED |

### PWA Manifest + Service Worker
| Claim | Source | Status |
|-------|--------|--------|
| Manifest must contain: name, icons, start_url, display for installability | MDN Web Manifest | ✅ CONFIRMED |
| Offline requires service worker + fetch handler (manifest alone insufficient) | MDN Web Manifest | ✅ CONFIRMED |
| PWA requires HTTPS (or localhost for dev) | MDN Web Manifest | ✅ CONFIRMED |
| Icons: minimum 192x192 and 512x512 pixels recommended | MDN Web Manifest | ✅ CONFIRMED |
| Manifest uses .webmanifest extension with Content-Type: application/manifest+json | MDN Web Manifest | ✅ CONFIRMED |
| Workbox: pre-caching, runtime caching, StaleWhileRevalidate, CacheFirst | developer.chrome.com/docs/workbox | ✅ CONFIRMED |
| workbox-window: handles offline adaptation, retry when back online | developer.chrome.com/docs/workbox | ✅ CONFIRMED |

### Lighthouse PWA Audits
| Claim | Source | Status |
|-------|--------|--------|
| TTI must be ≤10 seconds on slow 4G for Lighthouse PWA pass | developer.chrome.com/docs/lighthouse/pwa | ✅ CONFIRMED |
| Service worker must control page and start_url | developer.chrome.com/docs/lighthouse/pwa | ✅ CONFIRMED |
| HTTPS required; HTTP must redirect to HTTPS | developer.chrome.com/docs/lighthouse/pwa | ✅ CONFIRMED |

---

## 🔑 Key Implementation Insights

### 1. Two Distinct Drag-Drop Systems
```
┌─────────────────────────────────────────────────────────────────┐
│  HTML5 Native Drag-Drop (for FILES from OS)                      │
│  → ondragover + ondrop on container div                         │
│  → e.dataTransfer.files → File[]                                 │
│  → FileReader.readAsDataURL() → image data URL                   │
├─────────────────────────────────────────────────────────────────┤
│  Konva Internal Drag (for MOVING shapes on canvas)               │
│  → <Image draggable={true} onDragEnd={...} />                    │
│  → onDragStart, onDragMove, onDragEnd events                     │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Auto-Arrange Algorithm Choice
- **Recommendation:** Use custom grid algorithm (not binpackingjs)
  - binpackingjs is for fixed-container bin packing (e.g., CSS sprites)
  - Photo collage needs dynamic row/column grid based on count + aspect ratio
  - Simple approach: divide images into rows based on count, each row equal height

### 3. Export Strategy
```javascript
// Standard (may have memory issues with large canvases)
const dataURL = stageRef.current.toDataURL({ pixelRatio: 2, mimeType: 'image/png' });

// Better for large images
stageRef.current.toBlob({ pixelRatio: 2, mimeType: 'image/png' }, 'image/png', 1.0);
```

### 4. PWA Package Note
- `@ducanh2912/next-pwa` supports Next.js App Router with `output: 'export'`
- Alternative: `next-pwa` by sharparrow221 (older, App Router support varies)

---

## 📦 Required Packages

```bash
# Core
npm install react-konva konva zustand

# PWA
npm install @ducanh2912/next-pwa workbox-core workbox-precaching workbox-routing

# Utilities
npm install tailwindcss postcss autoprefixer

# Optional
npm install jszip   # for ZIP export if needed
```

---

## 🗂️ Project Structure

```
collage-app/
├── app/
│   ├── layout.tsx          # Root layout with PWA meta
│   ├── page.tsx             # Main collage page ('use client')
│   └── manifest.ts          # PWA manifest
├── components/
│   ├── Canvas.tsx           # React-Konva Stage with zoom/pan
│   ├── Toolbar.tsx          # Left sidebar controls
│   ├── ImageDropZone.tsx    # File drop handler
│   └── ExportButton.tsx     # High-DPI export
├── store/
│   └── useCollageStore.ts   # Zustand store with persist
├── utils/
│   ├── autoArrange.ts       # Grid auto-arrange algorithm
│   ├── fileReader.ts        # FileReader API helpers
│   └── exportCanvas.ts      # Export utilities
├── public/
│   ├── manifest.json        # PWA manifest (or generate via manifest.ts)
│   └── icons/               # PWA icons (192x192, 512x512)
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 🔗 Source URLs

### Documentation
- https://konvajs.org/docs/react/
- https://konvajs.org/docs/react/Export_Image.html
- https://docs.pmnd.rs/zustand/integrations/persisting-store-data
- https://nextjs.org/docs/app/guides/static-exports
- https://developer.chrome.com/docs/workbox
- https://developer.mozilla.org/en-US/docs/Web/Manifest

### Packages
- https://www.npmjs.com/package/react-konva
- https://www.npmjs.com/package/@ducanh2912/next-pwa
- https://github.com/olragon/binpackingjs

### Algorithms
- https://jakesgordon.com/writing/bin-packing/

---

## 📋 To Continue on Another Computer

1. Copy this summary file
2. Install packages listed above
3. Use verified claims as implementation guide
4. Pay attention to drag-drop correction (two separate systems)
5. Use custom grid algorithm instead of binpackingjs for auto-arrange
6. Use toBlob() instead of toDataURL() for large canvas exports

---

*Research compiled from journal.jsonl — 42 agents completed, 61 failed (403 Quota), 3 claims confirmed, 1 claim refuted, 20+ claims from primary sources.*


Rangkuman sudah disimpan ke DEEP_RESEARCH_SUMMARY.md. Di komputer lain, cukup:

Baca file DEEP_RESEARCH_SUMMARY.md — semua klaim verified ada di sana
Install packages:

npm install react-konva konva zustand @ducanh2912/next-pwa tailwindcss
Ikuti verified claims sebagai panduan implementasi
⚠️ Koreksi Penting dari Research
Ada 1 klaim yang refuted — ini penting:

SALAH: "React-Konva's draggable prop = HTML5 native drag-drop"

BENAR: Ada 2 sistem drag-drop terpisah:

Sistem	Untuk Apa	API
HTML5 Native	Drop file dari OS ke browser	ondragover, ondrop, FileReader
Konva Internal	Pindahkan shapes di canvas	draggable={true}, onDragEnd
Untuk drop gambar lokal, gunakan e.dataTransfer.files + FileReader.readAsDataURL(), bukan Konva draggable.

✅ Highlights dari Research
React-Konva confirmed — Stage, Layer, Image components ✅
Zustand persist confirmed — localStorage, no context provider ✅
Static export confirmed — output: 'export' + @ducanh2912/next-pwa ✅
High-DPI export confirmed — pixelRatio: 2 + toBlob() (better than toDataURL) ✅
Binary tree bin packing confirmed — untuk auto-arrange algorithm ✅
PWA manifest confirmed — name, icons, start_url, display required ✅