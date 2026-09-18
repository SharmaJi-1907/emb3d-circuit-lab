# Coding standards

The rules every change follows. [AGENTS.md](../../AGENTS.md) has the short version; this file has the details. When a rule changes, change it here and in AGENTS.md's summary.

## Style

- 2-space indent, UTF-8, LF line endings (enforced by `.editorconfig`).
- File names are `kebab-case.js`. Screen files end in `.view.js`.
- The engines (`ThreeViewer`, `CircuitSimulator`) use the IIFE module pattern. Everything else shares code with `import`/`export`.
- Section comments look like `/* ── Section ── */`. Comments say **why**, and name the issue code when there is one (for example `(D47)`).
- Match the code around you: its comment density, naming and idioms.
- Lint must stay at **0 warnings** (`npm run lint`).

## Structure

- **Page markup follows [ADR 0002](../decisions/0002-screen-markup.md), per screen:**
  - **Viewer, Database (→ Component Library) and Dashboard** use the markup that their `views/*.view.js` file and the stylesheets expect. Change `index.html` to match them.
  - **All other screens** (Simulator, Boards, Datasheet, AI, Projects, Settings, sidebar, top bar) keep `index.html`. Change the JS or CSS to match the page.
- **Modules follow [ADR 0003](../decisions/0003-es-modules.md):**
  - `CircuitApp`, `ThreeViewer`, `CircuitSimulator` and `CircuitLabData` stay on `window` as the public API (inline handlers and tests use them), each set in one place.
  - Each part's entry file is imported in [src/main.js](../../src/main.js) in dependency order.
  - `ThreeViewer` only exists once the 3D Viewer has been opened, so always check `window.ThreeViewer?.isReady()` first.
- **Import rules** are in [ARCHITECTURE.md](../planning/ARCHITECTURE.md) ("Dependency rules"). For example, a service never shows UI messages.
- **A new screen** gets `src/views/<name>.view.js`, which calls `registerScreen('<name>', onOpen)` from `app/router.js`, and is imported in `app/app.js`.
- Wire each button **once**, on the first visit to a screen, never on every visit.
- Look up elements by IDs that exist in `index.html`. If you rename an ID, rename it everywhere in the same change.

## CSS and colours

- Use the design tokens in `src/styles/base/tokens.css` (`--bg-card`, `--border`, `--pin-uart`, `--radius-lg`…), **never hard-coded colours**: not in CSS, not in generated HTML, not on a canvas (use `cssColor()` from `src/utils/css.js` there). Tests check this.
- A tint of a token is written `color-mix(in srgb, var(--cyan) 15%, transparent)`.
- Dark on purpose in both themes: the 3D viewport (`--viewport-bg`), the multimeter and scope (`--lcd-*`) and code blocks (`--bg-code`).
- Shared building blocks go in `src/styles/components/`, and one screen's styles go in `src/styles/views/<screen>.css`. Import new CSS files in `src/main.js` in cascade order (after `base/`). Keep a screen's `@media` rules right after the rules they override.
- _Known exceptions still to clean up:_ the Board Explorer, background and oscilloscope canvases, and the 3D materials, still use some hard-coded colours. See [BUGS.md](../tracking/BUGS.md).

## Safety

- Escape any user-typed text before putting it into `innerHTML` (`escapeHtml()` in `src/utils/html.js`). Messages use `textContent`.
- No secrets or API keys in browser code or in the repo. The rest is in [SECURITY_RULES.md](SECURITY_RULES.md).

## Keeping it clean

- **Nothing dead:** no CSS class without markup, no button that only says "not available", no placeholder text, no export nobody imports. A test fails on an unused CSS class.
- **Refactors change no behaviour:** take a snapshot before (data checksum, computed styles, public API, screen HTML), and prove it is identical after.
- Engine animations are **time-based**, never per frame.
- Don't edit `dist/` (generated) or `node_modules/`.
- The old `legacy/` folder was deleted in branch #6. Old data worth restoring is listed under E1 in [FIX_PLAN.md](../archive/FIX_PLAN.md), with the `git show` command to get it back.

## From the roadmap on

- Types: JSDoc + `checkJs`, starting with data and services (Phase 0).
- The simulator engine runs in a Web Worker, and the drawing code and the maths are kept apart ([ADR 0005](../decisions/0005-simulator-engine.md)).
- Never copy code from GPL projects (Falstad CircuitJS, SimulIDE, QEMU, simavr): CircuitLab is MIT.
- Inline `onclick` handlers are replaced by `addEventListener` in Phase 0, so the security headers can forbid inline scripts. Don't add new ones.
