# 0003 — ES modules inside, window globals as the public API

- **Status:** Accepted
- **Date:** 2026-09-17

## Context

Every file assigns one object to `window` (`CircuitApp`, `CircuitLabData`, `ThreeViewer`, `CircuitSimulator`) and the others use it by name. That is how bug A1 happened: `data.js` was never loaded, and nothing noticed until the page crashed, because a forgotten `window` global is not a build error.

The big files (`app.js`, `data.js`, `main.css`) are being split into the folders from [ADR 0001](0001-folder-structure.md) (branch plan #27). Two things still need the `window` names:

- **24 inline handlers** in the HTML that `app.js` generates, such as `onclick="CircuitApp.selectComponent('…')"` and `onclick="ThreeViewer.zoomIn()"`.
- **The smoke tests**, which call `window.CircuitApp.getState()`, `window.ThreeViewer.getModelInfo()` and so on.

## Options considered

1. **Cut the files into smaller IIFE files that share `window` globals.** Least work, but a forgotten file is still only a runtime crash.
2. **ES modules inside, the 4 `window` names kept as the public API.** ✅ Chosen.
3. **ES modules everywhere, no `window` names.** Needs every inline handler replaced with `addEventListener` and every test rewritten, in the same branches as the split.

## Decision

- New files use `import` / `export`. A file that needs another imports it, so a missing file or a misspelled export fails the build instead of the page.
- `window.CircuitApp`, `window.CircuitLabData`, `window.ThreeViewer` and `window.CircuitSimulator` stay. Each is set in exactly one place, from the modules, and is the entry point for inline handlers and tests.
- The split changes no behaviour. Each branch proves it with a snapshot taken before and compared after (data checksum, computed styles, public API and screen HTML), plus the full smoke-test suite.

## Consequences

- `src/main.js` imports each part's entry file (`data/index.js`, …) in dependency order, as before.
- Removing a `window` name later (for example once the inline handlers are gone) is a separate, small change and needs its own decision.
- First applied in #27a: `data.js` became `src/data/components.js`, `boards.js`, `datasheets.js`, `projects.js`, `ai-responses.js` and `data/index.js`, with a byte-identical `CircuitLabData` (same SHA-256).
