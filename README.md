# Portfolio Site

**Live site:** [ramen-portfolio-nine.vercel.app](https://ramen-portfolio-nine.vercel.app)

A scroll-driven portfolio. An iMac G3 (a real 3D model) turns to face you as you scroll, boots to an Apple
logo and a terminal, then the camera zooms into the screen and hands off to the readable site below.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

Add `?debug=1` to the URL for a timeline slider and `window.__imacDebug` (scene, camera, state).

## Stack

- **Three.js** — the iMac scene (`public/models/imac.glb`), lit as a dark studio.
- **GSAP** (ScrollTrigger, SplitText, ScrambleText, Draggable, Inertia, Observer) + **Lenis** — one master
  scrubbed timeline for the hero, smooth scrolling, and the hover/scroll/drag effects.
- **vanilla-tilt**, **canvas-confetti**, **tsParticles** — card tilt, click bursts, cursor-reactive backdrop.
- **Vite** — dev server and build. Space Grotesk via Google Fonts.

## How it's organised

- [`src/data.js`](src/data.js) — all the content. Edit this file to change what's on the page. Text can
  contain `[label](https://url)` links.
- [`src/main.js`](src/main.js) — renders `data.js` into `#content` and starts everything.
- [`src/imac-scene.js`](src/imac-scene.js) — the 3D hero: model, lighting, the CRT screen texture, camera path.
- [`src/fx.js`](src/fx.js) — cursor, text effects, reveals, tilt, carousel dragging, click bursts, particles.
- [`src/smooth.js`](src/smooth.js) — the shared Lenis instance.
- [`src/style.css`](src/style.css) — all styling.

Each project has a `status` (`live` / `testing` / `research` / `built`) shown as a colored pill. Any
project or role can carry a `note`, and a `photos: [...]` array (files in `public/photos/`) adds a photo
strip that opens a swipeable lightbox.

`prefers-reduced-motion` is respected: no scroll hijack, a static hero, and the pointer effects are off.
