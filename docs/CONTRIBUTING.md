# Contributing

## Workflow

1. Make **one** focused change.
2. Run `npm test` (lint and smoke tests). It must pass.
3. Run the app (`npm run dev`) and open the browser console (F12). There must be **no red errors** on the screens you touched.
4. Before merging a branch that touches tests, run `npx playwright test tests/smoke --repeat-each=4` and expect 0 unexpected. Don't pull, switch branches or edit files while it runs: the dev server reloads the page and the run fails for no real reason.

Tip: install the **ESLint** extension in VS Code to see lint problems as you type.

## Version control

One branch per issue (or a small group of related issues), created from `main` and merged through a Pull Request. Branch names, commit format and the full cycle are in [GIT_WORKFLOW.md](GIT_WORKFLOW.md).

## Code style

- 2-space indent, UTF-8, LF line endings (enforced by `.editorconfig`).
- File names: `kebab-case.js`. Screen files end in `.view.js` and call `registerScreen()` from `app/router.js`.
- Share code with `import` / `export`. Only `CircuitApp`, `CircuitLabData`, `ThreeViewer` and `CircuitSimulator` live on `window` ([ADR 0003](decisions/0003-es-modules.md)).
- Colours come from the design tokens in `src/styles/base/tokens.css`, never hard-coded, in CSS or in HTML the code generates.
- Lint must stay at 0 warnings (`npm run lint`).
- Look up elements by the IDs that exist in `index.html`. If you rename an ID, rename it in both places in the same change.
- Wire each button **once**, on first visit to a screen, never on every visit.
- Escape any user-typed text before putting it into `innerHTML`.
- Never put API keys or secrets in browser code or in version control.

## Docs

- Update [ARCHITECTURE.md](ARCHITECTURE.md) when you add a folder or change the load order.
- Add a line to [CHANGELOG.md](../CHANGELOG.md) under **Unreleased** for anything a user would notice.
- For a big decision, add a new record in [decisions/](decisions/).
