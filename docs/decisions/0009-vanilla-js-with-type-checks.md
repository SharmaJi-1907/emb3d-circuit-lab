# 0009 — Stay on vanilla JS, add type checks with JSDoc

- **Status:** Accepted (2026-09-19)
- **Date:** 2026-09-19

## Context

CircuitLab is plain JavaScript with ES modules ([ADR 0003](0003-es-modules.md)), built by Vite, with no framework. The roadmap ([ROADMAP.md](../planning/ROADMAP.md), decision 4) adds bigger pieces: a circuit format with a validator, a simulator engine and a backend. Mistakes in data shapes (a missing field, a wrong type) are easy to make in plain JavaScript and only show up when the page runs.

## Options considered

1. **Rewrite in TypeScript.** Strong types, but every file changes at once, the fix-plan tests would have to catch a big rewrite, and the owner's students read the code as plain JS.
2. **Move to a framework (React, Svelte…).** Not needed: the screens work, and a rewrite adds risk with no user-facing gain.
3. **Stay on vanilla JS and add JSDoc types checked by the TypeScript compiler (`checkJs`).** ✅ Chosen.

## Decision

- The code stays plain JavaScript. No framework, and no rewrite.
- Types are written as JSDoc comments and checked with `tsc --noEmit` and `checkJs`, starting with `src/data/` and `src/services/`, then growing file by file.
- The type check runs in CI next to lint, the build and the smoke tests (row R0d in [PROGRESS.md](../tracking/PROGRESS.md)).

## Consequences

- No build change: the browser still runs the same files, and TypeScript is only a dev tool.
- Data-shape mistakes are caught before a PR is merged, in the files that are checked.
- Files not yet checked get no help, so the checked list must keep growing.
- Moving to real TypeScript later stays possible, because the JSDoc types carry over.
