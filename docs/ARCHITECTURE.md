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
│   │   ├── components/
│   │   │   └── panels.css     Shared cards, panels, titles, sidebar/top-bar buttons (F2)
│   │   └── views/             per-screen styles
│   └── assets/                fonts, models, images imported by code
├── eslint.config.js           Lint rules, allowed globals, ignored folders
├── playwright.config.js       Test runner config (local Chrome, starts the dev server)
├── tests/
│   ├── smoke/                 Playwright browser tests
│   │   ├── app.spec.js        Every screen, data, 3D first load, search, AI chat. Known bugs marked knownBug()
│   │   ├── keyboard.spec.js   Every keyboard shortcut, plus the 3D explode fix (D13)
│   │   ├── styles.spec.js     Computed styles of the shared building blocks (F2)
│   │   ├── viewer.spec.js     3D Viewer layout: canvas sizing, sidebar, pin table/detail, tooltip, controls
│   │   └── helpers.js         Error collector, known-noise list, navigation and 3D-model helpers
│   └── unit/                  Small function tests            (empty)
├── scripts/                   Developer helper scripts
└── docs/                      Documentation
```

Folders marked _(empty)_ are part of the target layout. They get filled while the big files (`app.js`, `data.js`, `main.css`) are split during the fixes.

## Load order

`index.html` → `src/main.js` imports, in order:

1. `styles/main.css`
2. `styles/components/panels.css`: shared page styles. Must come after `main.css` so it can build on its design tokens.
3. `engines/background/circuit-bg.js`
4. `data/data.js` → `window.CircuitLabData`. Must come before the files that read it (the 3D viewer and the app).
5. `engines/three-viewer/index.js` → `window.ThreeViewer`
6. `engines/simulator/index.js` → `window.CircuitSimulator`
7. `app/app.js` → `window.CircuitApp`, starts on `DOMContentLoaded`

The smoke test "component data is loaded" fails if `data.js` is ever dropped from this list again (bug A1, fixed in branch #3).

Three.js and GSAP are currently loaded from a CDN in `index.html` as globals (`window.THREE`, `window.gsap`). GSAP isn't used by any code (E10).

The cross-file globals are declared for ESLint in [eslint.config.js](../eslint.config.js). Only `app/app.js` reads them by bare name.

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
