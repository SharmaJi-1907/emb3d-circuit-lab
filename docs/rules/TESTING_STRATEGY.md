# Testing strategy

How CircuitLab is tested: what exists today, and what each roadmap phase adds.

## The rule for every change

- `npm test` (lint + smoke tests) and `npm run build` pass.
- A fix or feature adds or extends a test that **fails before the change and passes after it**, and the PR shows both results.
- A refactor proves that nothing changed, with a before/after snapshot (data checksum, computed styles, public API, screen HTML).
- Before merging anything that touches tests, run `npx playwright test tests/smoke --repeat-each=4` and expect **0 unexpected**. Don't pull, switch branches or edit files while it runs: Vite reloads the page, and tests fail with "Execution context was destroyed".
- Results are reported honestly, failures included.

## Today

```bash
npm test              # lint, then smoke tests
npm run lint          # ESLint 10 (eslint.config.js)
npm run test:smoke    # Playwright smoke tests (tests/smoke/)
npm run test:report   # open the HTML report
```

### Lint
- New mistakes (undefined names, duplicate keys, unreachable code…) are **errors**.
- The `--max-warnings` cap in `package.json` is **0**. Never raise it.
- The cross-file `window` globals are declared in [eslint.config.js](../../eslint.config.js).

### Smoke tests (Playwright, 220 tests in 16 files)
- They use the locally installed Google Chrome (`channel: 'chrome'` in [playwright.config.js](../../playwright.config.js)). The dev server on port 3000 is started, or reused if one is already running.
- A test fails on any uncaught exception or `console.error`. Known noise goes in `IGNORED_CONSOLE_ERRORS` in [tests/smoke/helpers.js](../../tests/smoke/helpers.js), tagged with its issue code. Only one is left: the Google Fonts CDN (E14).
- `knownBug('<code>')` marks a test that is **expected to fail** until its bug is fixed. None are left. When a fix makes one pass, remove the marker in the same branch. Never add one to hide a new failure.
- The files:

| File | Covers |
|---|---|
| `app.spec.js` | Screens, data, 3D first load, search, AI, Dashboard stats |
| `keyboard.spec.js` | Shortcuts, explode, view mode buttons |
| `styles.spec.js` | Computed styles of shared building blocks |
| `viewer.spec.js` | 3D Viewer layout, sizing, controls, pin details and highlight, turn speed |
| `database.spec.js` | Component Library, categories |
| `ai.spec.js` | AI chat: sending, layout, message styles, which answer is picked, reply order, safe text, code blocks |
| `simulator.spec.js` | Simulator layout, controls, multimeter, circuit logic, oscilloscope, drawing loop, drag, high-DPI, palette parts |
| `projects.spec.js` | Projects grid, new-project form, saved circuits, safe names, sample projects |
| `theme.spec.js` | Light/dark theme: both toggles, persistence, readability, no hard-coded colours in generated HTML |
| `topbar.spec.js` | Notifications drawer; search arrow keys, boards and datasheets; styling |
| `assets.spec.js` | What the page loads (manifest, favicon, no unused CDNs), no dead CSS, Three.js only for the Viewer, no leftovers, doc links |
| `viewer-models.spec.js` | 3D model pin counts, chip labels, freeing old models, passive parts, ESP32 headers |
| `background.spec.js` | Page background: one animation, theme colours, dots after a resize |
| `routing.spec.js` | Hash routing: address, links, refresh, Back/Forward |
| `boards.spec.js` | Board Explorer layout, styles, behaviour, board data, high-DPI |
| `datasheet.spec.js` | Datasheet styles, list clicks, layout fit, sections, the PDF link |

### How to write a smoke test
- **3D tests are slow:** headless Chrome draws 3D on the CPU (about 15 fps with 1 browser, about 5 with 4). The full suite takes about 5 minutes, and `--repeat-each=4` about 20.
  - Use `openViewer()` from `helpers.js`. `openApp()` does **not** wait for the 3D engine, and the engine is only downloaded once the Viewer has been opened, so **open the Viewer before calling `waitForViewer()`**.
- **Style checks use computed styles, not screenshots.** Use `styleOf()` from `helpers.js`, and check first that no inline style overrides that property.
- **Wait for conditions, not fixed times.** Use `expect.poll` or `expect(locator)` waits. Use `settle()` only to let pending timers fire.
- **3D checks use model data, not pixels.** Use `modelSize()` and `waitForStableModel()` (built on `ThreeViewer.getModelBounds()`).

## What each phase adds

| Phase | New tests |
|---|---|
| 0 Foundations | **CI** runs lint, type check, build and the smoke tests on every PR (bundled Chromium, since CI has no Chrome). A test for the circuit format validator |
| 1 Simulator v2 | **Unit tests** for the engine (Node test runner): each part model, RC charging, a diode, a 555, compared with hand calculations and **ngspice** (`eecircuit-engine`), with the tolerance written down. The results go in [EXPERIMENTS.md](../tracking/EXPERIMENTS.md) |
| 2 Boards and 3D | Every board's pin count and positions match its skill spec; model size budget (under 1 MB) |
| 3 Accounts | **Security tests** for Row Level Security: user A can't read, change or delete user B's private project (as a guest, as user B, as a normal user on admin data). Login and logout flows. `/admin` gives nothing to a non-admin |
| 4 AI | Access check: not approved = refused, over the limit = refused, AI switched off = refused. Grounded answers cite a part |
| 5 Microcontrollers | Blink on the simulated Uno toggles the pin at the right rate; the build service rejects oversized or bad code |
| 6 Classrooms | Students can't see other classes; a join code only works for its class |
| 8 Own AI model | An evaluation set with a score; a new model is only deployed if it scores higher ([EXPERIMENTS.md](../tracking/EXPERIMENTS.md)) |

## Before a phase merges into `main`

Full `npm test`, `npm run build`, the `--repeat-each=4` run with 0 unexpected, and the owner's own check on the preview link. The whole list is in [REVIEW_CHECKLIST.md](REVIEW_CHECKLIST.md).
