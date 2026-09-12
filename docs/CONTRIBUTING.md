# Contributing

## Workflow

1. Make **one** focused change.
2. Run the app (`npm run dev`) and open the browser console (F12). There must be **no red errors** on the screens you touched.

## Version control

_To be defined by the project owner (branching, commit message format, when to commit)._

## Code style

- 2-space indent, UTF-8, LF line endings (enforced by `.editorconfig`).
- File names: `kebab-case.js`. Screen files end in `.view.js`.
- Look up elements by the IDs that exist in `index.html`. If you rename an ID, rename it in both places in the same change.
- Wire each button **once**, on first visit to a screen, never on every visit.
- Escape any user-typed text before putting it into `innerHTML`.
- Never put API keys or secrets in browser code or in version control.

## Docs

- Update [ARCHITECTURE.md](ARCHITECTURE.md) when you add a folder or change the load order.
- Add a line to [CHANGELOG.md](../CHANGELOG.md) under **Unreleased** for anything a user would notice.
- For a big decision, add a new record in [decisions/](decisions/).
