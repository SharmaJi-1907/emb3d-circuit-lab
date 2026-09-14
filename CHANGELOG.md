# Changelog

All notable changes to this project are listed here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed
- Restructured the project into a professional folder layout (`src/`, `docs/`, `public/`, `tests/`, `scripts/`). Files were moved without changing their code. See [docs/decisions/0001-folder-structure.md](docs/decisions/0001-folder-structure.md).
- Moved `js/script.js` and `js/database.js` (unused old code) to `legacy/` for review.
- Lint warning cap lowered from 27 to 25.
- 3D explode and grow-in animations are time-based (~320 ms / ~200 ms), so slow frames no longer stretch them.
- The 3D canvas sizes itself from its container and is resized whenever the Viewer is shown.
- Branch plan reorganised to follow ADR 0002. The three Viewer branches merge into one, the Database branch becomes small, and the Dashboard, shared-styles and per-screen styling branches are added.

### Added
- `README.md`, `CHANGELOG.md`, `.editorconfig`, expanded `.gitignore`.
- `docs/` with an index, architecture, contributing guide and decision records.
- `docs/GIT_WORKFLOW.md`: branch-per-issue workflow, commit format and branch plan.
- `CLAUDE.md`: working rules for the AI coding assistant.
- `.github/pull_request_template.md`: PR checklist.
- Playwright smoke tests (`npm run test:smoke`): 12 tests covering app start, all 8 screens, search, AI chat and number-key shortcuts. They fail on any page error, and known bugs are tracked as expected failures.
- ESLint 10 (`npm run lint`) with the recommended rules. New mistakes are errors; the 27 known leftovers are warnings capped with `--max-warnings`. `npm test` now runs lint and smoke tests together.
- Smoke tests: "component data is loaded" and "AI answer engine replies without errors" (14 tests in total).
- `tests/smoke/keyboard.spec.js`: 9 tests covering every keyboard shortcut and the 3D explode fix (22 tests in total).
- Smoke tests: "3D viewer shows a model at first load" and "loading text is hidden once the model is shown" (24 tests in total).
- 3D viewer: read-only `isWireframe()`, `isExploded()` and `getModelBounds()`.
- [ADR 0002](docs/decisions/0002-screen-markup.md): which page markup each screen uses. Includes per-screen measurements and prototype screenshots in `docs/images/`.
- `src/styles/components/panels.css`: shared styles for cards, panels, titles and icon buttons (F2).
- `tests/smoke/styles.spec.js`: 5 computed-style tests for the shared building blocks (29 tests in total).
- `tests/smoke/viewer.spec.js`: 9 tests for the new 3D Viewer layout (38 tests in total). 3D viewer: read-only `getFrameCount()`.

### Removed
- `legacy/` (the old, never-loaded `script.js` and `database.js`) and its lint ignore rule (E1). The built app is byte-identical before and after. Old data worth reusing is listed under E1 in [docs/FIX_PLAN.md](docs/FIX_PLAN.md).

### Fixed
- 3D Viewer uses the new layout (ADR 0002). It shows the part info and specs, working controls (part switcher, Solid/Wire/Explode, auto-rotate, zoom), the full pin table, pin details with a signal view and a pin tooltip, and a canvas that fills its area (B4–B7, C1).
- The 3D scene is no longer drawn while its screen is hidden (D5, 3D part).
- Sidebar and top-bar buttons no longer show the browser's grey button background. Cards, panels, panel titles and screen titles are styled on Settings, Datasheet, Simulator, AI, Boards, Projects and the shortcuts popup (F2).
- The component data (`src/data/data.js`) is now loaded, so the 3D Viewer, Board Explorer, Datasheet Viewer, Projects, Search and the AI answer engine no longer crash (A1–A8). No screen throws an error any more.
- Keyboard shortcuts (D2):
  - `1–8` open the screens in sidebar order
  - `W` / `E` / `R` toggle wireframe, toggle explode and reset the camera in the 3D Viewer
  - `Space` runs or pauses the simulation
  - `?` shows the shortcuts list
  - Ctrl/⌘+K and `/` open search
  - shortcuts are ignored while typing, with Ctrl/⌘/Alt, and on key auto-repeat
  - both shortcut lists show every key
- Exploding the 3D model no longer makes it vanish, and quick toggling no longer makes the parts bounce (D13).
- The 3D Viewer shows the part as soon as the app opens (it used to stay empty until you reopened it), and the "Rendering 3D Model..." text now hides once the part is drawn (D15).
### Found
- New issues from linting: D8 (4 unused 3D models), D10 (sort ignores its option), D11 (chip labels never drawn), D12 (unused simulator values), E10 (GSAP loaded but unused), E11 (lint warning cap).
- F1: most of `index.html` has no matching CSS. The CSS and `app.js` were written for a different page layout. Decided in ADR 0002.
- F2–F6: per-screen styling gaps (shared panels, simulator layout, board explorer, datasheet sidebar, AI message classes).
- D14: search popup ↑↓/↵ keys do nothing. D15: the 3D Viewer is empty when the app first opens (fixed in #4b).
- D16: each visit to the 3D Viewer leaks graphics memory (old models are never freed).
