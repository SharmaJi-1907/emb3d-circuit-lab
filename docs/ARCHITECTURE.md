# Architecture

## Folder map

```
emmb3d/
├── index.html                 Page markup — all 9 screens. Vite entry, stays at root.
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
│   │   │   └── index.js       Breadboard canvas, parts, wires, DC solver (nodal analysis), oscilloscope
│   │   └── background/
│   │       └── circuit-bg.js  Animated circuit background
│   ├── ui/                    Reusable UI: toast, modal, search  (empty)
│   ├── data/
│   │   ├── index.js           Joins the parts below into window.CircuitLabData (ADR 0003)
│   │   ├── components.js      Parts: specs and pinouts
│   │   ├── boards.js          Development boards: pin positions
│   │   ├── datasheets.js      Datasheet sections
│   │   ├── projects.js        Sample projects
│   │   └── ai-responses.js    Stored AI answers
│   ├── services/              AI answers, localStorage          (empty)
│   ├── utils/                 DOM / HTML / formatting helpers  (empty)
│   ├── styles/
│   │   ├── main.css           All styles (to be split into the folders below)
│   │   ├── base/              variables, reset, typography
│   │   ├── layout/            sidebar, topbar
│   │   ├── components/
│   │   │   ├── panels.css     Shared cards, panels, titles, keyboard keys, sidebar/top-bar buttons (F2, C5)
│   │   │   └── notifications.css  Notifications drawer, unread dot, selected search result (C6, D14)
│   │   └── views/             per-screen styles
│   │       ├── simulator.css  Circuit Simulator layout, toolbar, palette, board, instruments (F3)
│   │       ├── boards.css     Board Explorer layout, tabs, filters, specs, pin list (F4)
│   │       ├── datasheet.css  Datasheet sidebar, search box, list, section bar, layout fit (F5)
│   │       ├── ai.css         AI screen layout, chat box, chips row, input row (F8)
│   │       └── projects.css   Projects screen: the new-project form and your own cards (C4)
│   └── assets/                fonts, models, images imported by code
├── eslint.config.js           Lint rules, allowed globals, ignored folders
├── playwright.config.js       Test runner config (local Chrome, starts the dev server)
├── tests/
│   ├── smoke/                 Playwright browser tests
│   │   ├── app.spec.js        Every screen, data, 3D first load, search, AI chat
│   │   ├── keyboard.spec.js   Every keyboard shortcut, plus the 3D explode fix (D13)
│   │   ├── styles.spec.js     Computed styles of the shared building blocks (F2)
│   │   ├── viewer.spec.js     3D Viewer layout: canvas sizing, sidebar, pin table/detail, tooltip, controls
│   │   ├── database.spec.js   Database screen (Component Library): cards, filter, sort, compare, View 3D
│   │   ├── boards.spec.js     Board Explorer layout, board size, styles, behaviour and board data
│   │   ├── datasheet.spec.js  Datasheet sidebar and section-bar styles, list clicks, layout fit (F5)
│   │   ├── projects.spec.js   Projects screen: grid, the new-project form, saving and deleting (C4)
│   │   ├── theme.spec.js      Light/dark theme: both toggles, persistence, readability (C5)
│   │   ├── topbar.spec.js     Notifications drawer, the search pop-up's arrow keys, New Project and Share (C6, D14, C9)
│   │   ├── routing.spec.js    Hash routing: address, links, refresh, Back/Forward (D9)
│   │   ├── background.spec.js  Animated background: one animation, theme colours, dots after a resize (D4, D28, D29)
│   │   ├── assets.spec.js     What the page loads: manifest, favicon, no GSAP/FontAwesome, dead CSS, Three.js offline (E2–E14, E7)
│   │   ├── viewer-models.spec.js  3D models: pin counts per part, chip labels, freeing old models, passive parts (D8, D11, D16, #23b)
│   │   ├── simulator.spec.js  Simulator: layout and board size, palette, toolbar, status bar, multimeter, circuit logic, oscilloscope, drawing loop
│   │   ├── ai.spec.js         AI chat: Send/Enter/chips, welcome message, chat scrolling, message styles, answer matching, safe text, code blocks
│   │   └── helpers.js         Error collector, known-noise list, knownBug(), styleOf(), navigation and 3D-model helpers
│   └── unit/                  Small function tests            (empty)
├── scripts/                   Developer helper scripts
└── docs/                      Documentation
```

Folders marked _(empty)_ are part of the target layout. They get filled while the big files (`app.js` and `main.css`; `data.js` was split in #27a) are split during the fixes.

## Load order

`index.html` → `src/main.js` imports, in order:

1. `styles/main.css`
2. `styles/components/panels.css` and `styles/components/notifications.css`: shared page styles. Must come after `main.css` so they can build on its design tokens.
3. `styles/views/simulator.css`, `styles/views/boards.css`, `styles/views/datasheet.css`, `styles/views/ai.css` and `styles/views/projects.css`: per-screen styles. After the shared styles, so they can build on them.
4. `engines/background/circuit-bg.js`
5. `data/index.js` → `window.CircuitLabData`. It imports the five data modules itself, and must come before the files that read the global (the 3D viewer and the app).
6. `engines/three-viewer/index.js` → `window.ThreeViewer`
7. `engines/simulator/index.js` → `window.CircuitSimulator`
8. `app/app.js` → `window.CircuitApp`, starts on `DOMContentLoaded`

The smoke test "component data is loaded" fails if `data/index.js` is ever dropped from this list again (bug A1, fixed in branch #3).

Three.js comes from npm (`three`, pinned) and is imported by `engines/three-viewer/index.js`, so Vite bundles it and the 3D Viewer works offline (E7, #24). Nothing reads `window.THREE` any more. GSAP and FontAwesome were removed in #25 (E10).

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
- **data/** is plain data only — no DOM, no side effects. The one exception is `data/index.js`, which sets `window.CircuitLabData` ([ADR 0003](decisions/0003-es-modules.md)).
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
