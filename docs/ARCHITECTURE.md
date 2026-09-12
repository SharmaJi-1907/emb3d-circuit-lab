# Architecture

## Folder map

```
emmb3d/
├── index.html                 Page markup — all 8 screens. Vite entry, stays at root.
├── public/                    Copied to dist/ unchanged, served from "/"
│   └── icons/
├── src/
│   ├── main.js                Entry point: imports styles, engines, then the app
│   ├── app/                   App shell
│   │   └── app.js             Startup, screen switching, search, shortcuts, all screen logic (to be split)
│   ├── views/                 One file per screen            (empty — filled while fixing)
│   ├── engines/
│   │   ├── three-viewer/
│   │   │   ├── index.js       3D scene, camera, orbit, pin picking, procedural models
│   │   │   └── models/        One file per 3D model builder   (empty — filled while fixing)
│   │   ├── simulator/
│   │   │   └── index.js       Breadboard canvas, parts, wires, voltage solver, oscilloscope
│   │   └── background/
│   │       └── circuit-bg.js  Animated circuit background
│   ├── ui/                    Reusable UI: toast, modal, search  (empty)
│   ├── data/
│   │   └── data.js            Components, boards, datasheets, projects, AI answers (to be split)
│   ├── services/              AI answers, localStorage          (empty)
│   ├── utils/                 DOM / HTML / formatting helpers  (empty)
│   ├── styles/
│   │   ├── main.css           All styles (to be split into the folders below)
│   │   ├── base/              variables, reset, typography
│   │   ├── layout/            sidebar, topbar
│   │   ├── components/        buttons, panels, modals, toasts
│   │   └── views/             per-screen styles
│   └── assets/                fonts, models, images imported by code
├── playwright.config.js       Test runner config (local Chrome, starts the dev server)
├── tests/
│   ├── smoke/                 Playwright browser tests
│   │   ├── app.spec.js        Every screen, search, AI chat, shortcuts. Known bugs marked knownBug()
│   │   └── helpers.js         Error collector, known-noise list, navigation helpers
│   └── unit/                  Small function tests            (empty)
├── scripts/                   Developer helper scripts
├── docs/                      Documentation
└── legacy/                    Old unused code — to be removed
```

Folders marked _(empty)_ are part of the target layout. They get filled while the big files (`app.js`, `data.js`, `main.css`) are split during the fixes.

## Load order

`index.html` → `src/main.js` imports, in order:

1. `styles/main.css`
2. `engines/background/circuit-bg.js`
3. `engines/three-viewer/index.js` → `window.ThreeViewer`
4. `engines/simulator/index.js` → `window.CircuitSimulator`
5. `app/app.js` → `window.CircuitApp`, starts on `DOMContentLoaded`

> ⚠️ `data/data.js` (`window.CircuitLabData`) is **not imported yet**. This is bug A1 in [FIX_PLAN.md](FIX_PLAN.md).

Three.js and GSAP are currently loaded from a CDN in `index.html` as globals (`window.THREE`, `window.gsap`).

## Dependency rules (target)

Arrows mean "may import from". Nothing may import upward.

```
main.js
  └─▶ app/
        └─▶ views/
              ├─▶ engines/   ─▶ utils/
              ├─▶ ui/        ─▶ utils/
              ├─▶ services/  ─▶ data/, utils/
              └─▶ data/
```

- **engines/** know nothing about screens or the DOM outside the canvas they're given.
- **views/** own one `<section class="view">` each and wire its buttons.
- **data/** is plain data only — no DOM, no side effects.
- **utils/** import nothing from the project.

## Where does new code go?

| You're adding… | Put it in |
|---|---|
| A new screen | `src/views/<name>.view.js` + `src/styles/views/<name>.css` |
| A new 3D part model | `src/engines/three-viewer/models/` |
| A new simulator part | `src/engines/simulator/` |
| A popup, toast or other reusable widget | `src/ui/` |
| New components, boards or datasheets | `src/data/` |
| Something that talks to storage or an API | `src/services/` |
| A small pure helper function | `src/utils/` |
| A favicon, manifest or robots.txt | `public/` |
| An image or font used by CSS/JS | `src/assets/` |
