# 0001 — Folder structure

- **Status:** Accepted
- **Date:** 2026-09-12

## Context

The project had code in `js/` and `css/` with no clear split. `app.js` (1,787 lines), `data.js` (1,057 lines) and `styles.css` (2,212 lines) held everything. Old and new versions of the app were mixed in the same folder. Docs sat in the root, and there was no git.

## Decision

- Use a `src/` layout grouped by responsibility: `app/`, `views/`, `engines/`, `ui/`, `data/`, `services/`, `utils/`, `styles/`, `assets/`.
- Put all documentation in `docs/`, and record big decisions in `docs/decisions/`.
- Put static files that are copied unchanged in `public/` (Vite convention).
- Add `tests/smoke`, `tests/unit` and `scripts/`.
- Do the restructure in two levels:
  1. **Move only** — move files as they are, no logic changes, and check the app behaves exactly the same. _(Done.)_
  2. **Split** — break up `app.js`, `data.js` and `main.css` into the empty folders **during** the bug fixes, since that code is being rewritten anyway.
- Park unused old code in `legacy/` until its useful parts are reviewed, then delete it.

## Consequences

- Each screen and engine gets one obvious home, so bugs are easier to find.
- The empty folders show the target shape before they're filled.
- The line numbers in [FIX_PLAN.md](../FIX_PLAN.md) still match, because the moved files weren't edited.
