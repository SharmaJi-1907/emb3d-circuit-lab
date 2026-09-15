# Git Workflow

How changes get from an idea to `main`.

## Rules

1. **`main` is protected.** Never commit to it directly. It should always run.
2. **One branch per issue**, always created from the latest `main`.
3. **Fix → test → merge → next.** A branch is merged only after its tests pass.
4. **Merge through a Pull Request** on GitHub, never by pushing to `main`.
5. **Small commits** with short, clear messages.

## Branch names

Format: `type/short-description` (lowercase, words joined with `-`).

| Type | Use for | Example |
|---|---|---|
| `fix/` | Bug fix | `fix/load-component-data` |
| `feat/` | New feature | `feat/hash-routing` |
| `test/` | Adding or changing tests | `test/smoke-tests` |
| `refactor/` | Code change with no behaviour change | `refactor/split-app-js` |
| `docs/` | Documentation only | `docs/git-workflow` |
| `chore/` | Tooling, config, dependencies, cleanup | `chore/eslint-setup` |
| `style/` | Visual styling only (CSS), no behaviour change | `style/shared-panels` |

## Commit messages

Format: `type: short description`

- lowercase, no full stop at the end, under 72 characters
- say **what** changed, e.g. `fix: load data.js before app.js`
- one logical change per commit
- no `!` in messages (zsh treats it as a special character inside double quotes)
- no AI or tool attribution lines

Types are the same as for branches: `fix`, `feat`, `test`, `refactor`, `docs`, `chore`, plus `style` (formatting only) and `build` (build config).

```
fix: guard viewer when no component is selected
test: add smoke test for all views
docs: add git workflow guide
```

## The cycle for every issue

### 1. Start from an up-to-date `main`
```bash
git switch main
git pull
git switch -c fix/short-description
```

### 2. Make the fix and test it
```bash
npm run dev          # check it in the browser, with the console (F12) open
npm test             # lint + smoke tests; must finish with no errors
npm run test:report  # optional: open the visual test report
```

### 3. Commit
```bash
git status                     # see what changed
git add path/to/file1 path/to/file2
git commit -m "fix: short description"
```
Add files by name rather than with `git add .`, so nothing unexpected gets in.

### 4. Push and open a Pull Request
```bash
git push -u origin fix/short-description
```
On GitHub: **Compare & pull request** → fill in the template → **Create pull request**.

### 5. Merge
Check the PR against the checklist, then use **Merge pull request** → **Create a merge commit**. This keeps every commit from the branch in the history. Then click **Delete branch**.

### 6. Sync and clean up
```bash
git switch main
git pull
git branch -d fix/short-description
```
Then start the next issue at step 1.

## Pull Request checklist

- [ ] Branch fixes **one** issue (reference its code, e.g. `A1`, from [FIX_PLAN.md](FIX_PLAN.md))
- [ ] App runs with no red errors in the browser console
- [ ] `npm run test:smoke` passes, and any `knownBug()` marker for the fixed issue has been removed
- [ ] `npm run lint` passes. If this branch removed warnings, `--max-warnings` in `package.json` is lowered to the new count.
- [ ] [FIX_PLAN.md](FIX_PLAN.md) status and [CHANGELOG.md](../CHANGELOG.md) updated
- [ ] No secrets, no `dist/`, no `node_modules/`

## Fixing common mistakes

| Problem | Fix |
|---|---|
| Wrong commit message (not pushed yet) | `git commit --amend -m "new message"` |
| Forgot a file in the last commit (not pushed yet) | `git add file` then `git commit --amend --no-edit` |
| Undo the last commit but keep the changes | `git reset --soft HEAD~1` |
| Started work on `main` by mistake (not committed) | `git switch -c fix/name`, and your changes move to the new branch |
| Committed on `main` by mistake (not pushed) | `git branch fix/name` → `git reset --hard origin/main` → `git switch fix/name` |
| `git pull` says there's a conflict | Open the files marked `<<<<<<<`, keep the right lines, then `git add` + `git commit` |
| Throw away all uncommitted changes in a file | `git restore path/to/file` |

Anything that rewrites history (`--amend`, `reset`) is only safe **before** you push.

## Optional: protect `main` on GitHub

**Settings → Branches → Add branch ruleset** → target `main` → enable **Require a pull request before merging**. After that, GitHub will reject any direct push to `main`.

## Branch plan

The order the known issues are fixed in. Issue codes refer to [FIX_PLAN.md](FIX_PLAN.md). From #5 on, the plan follows [ADR 0002](decisions/0002-screen-markup.md).

| # | Branch | Fixes | Status |
|---|---|---|---|
| 0 | `docs/workflow-guides` | This guide, CLAUDE.md, PR template | ✅ |
| 1 | `test/smoke-tests` | Browser test: open every view, fail on any error | ✅ |
| 2 | `chore/eslint-setup` | Linter: catch mistakes before running | ✅ |
| 3 | `fix/load-component-data` | A1–A8 — stops all crashes | ✅ |
| 4 | `fix/keyboard-shortcuts` | D2, D13 | ✅ |
| 4b | `fix/viewer-first-load` | D15: 3D Viewer empty at startup | ✅ |
| 5 | `docs/screen-markup-decision` | F1 decided per screen → ADR 0002, new plan below | ✅ |
| 6 | `chore/remove-legacy-code` | E1: delete `legacy/` (old data listed in FIX_PLAN) | ✅ |
| 7 | `style/shared-panels` | F2: shared styles for panels, titles and buttons on every screen | ✅ |
| 8 | `feat/dashboard-home` | B8 (part): add the Dashboard as the home screen; keys `1–9` | ✅ |
| 9 | `fix/viewer-new-layout` | B4–B7, C1: switch the Viewer to the new layout (replaces the old #9–#11). Done **before #8**, so the canvas sizing is in place before the Viewer stops being the start screen. | ✅ |
| 10 | `fix/database-library` | C3, B8 (part), D10: show the Component Library in the Database screen | ✅ |
| 11 | `fix/ai-chat-wiring` | B1–B3, F6, F7 (AI chat layout, found here) | ✅ |
| 12 | `fix/ai-answer-matching` | D1 | ✅ |
| 12b | `feat/ai-chip-answers` | D17: the suggestion chips get real answers (write 3 answers, or change the chips) | ⏳ |
| 13 | `fix/chat-html-escaping` | D6, D7 | ✅ |
| 13b | `fix/chat-lists-tables` | D18: show "- " lists and tables in AI replies | ⏳ |
| 14 | `fix/simulator-layout-controls` | F3, C2, B9 (D12 moved to 14b) | ✅ |
| 14b | `fix/simulator-circuit-logic` | D12 (battery polarity, closed loop), D19 (delete keeps a wire), C7 (node count part) | ✅ |
| 14c | `fix/simulator-oscilloscope` | D21 (oscilloscope and multimeter resistance show real circuit values), C7 (ON button, V/div and T/div dials) | ✅ |
| 15 | `fix/simulator-init-once` | D3, D5, D20 (clock counts frames) | ✅ |
| 16 | `style/board-explorer` | F4 | ✅ |
| 16b | `fix/board-explorer-behaviour` | D22 (handlers added on every visit, redraw on resize), D23 (pin highlight), D24 (stand-in board tabs) | ⏳ |
| 17 | `style/datasheet-sidebar` | F5 | ⏳ |
| 17b | `style/ai-screen` | F8: move the AI screen's inline styles to CSS with design tokens | ⏳ |
| 18 | `fix/projects-view` | C4 | ⏳ |
| 19 | `fix/settings-theme` | C5 | ⏳ |
| 20 | `fix/topbar-panels` | C6, D14 (search ↑↓/↵) | ⏳ |
| 21 | `fix/single-background` | D4 | ⏳ |
| 22 | `feat/hash-routing` | D9 | ⏳ |
| 23 | `fix/3d-model-mapping` | D8, D11, D16 (free old models); restore resistor/capacitor data from `legacy/` history | ⏳ |
| 24 | `chore/upgrade-threejs` | E7 | ⏳ |
| 25 | `chore/cleanup-assets` | E2–E5, E10, E12 (unused Simulator CSS) | ⏳ |
| 26 | `chore/update-dependencies` | E6 | ⏳ |
| 27+ | `refactor/split-*` | Split `app.js`, `data.js`, `main.css` into `src/` folders | ⏳ |

Status: ⏳ not started · 🔄 in progress · ✅ merged
