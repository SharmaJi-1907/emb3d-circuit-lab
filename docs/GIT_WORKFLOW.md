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
npm run test:smoke   # must end in "passed" with no unexpected results
npm run test:report  # optional: open the visual report
npm run lint         # after chore/eslint-setup is merged
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
- [ ] `npm run lint` passes (once it exists)
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

The order the known issues are fixed in. Issue codes refer to [FIX_PLAN.md](FIX_PLAN.md).

| # | Branch | Fixes | Status |
|---|---|---|---|
| 0 | `docs/workflow-guides` | This guide, CLAUDE.md, PR template | ✅ |
| 1 | `test/smoke-tests` | Browser test: open every view, fail on any error | ✅ |
| 2 | `chore/eslint-setup` | Linter to catch undefined names | ⏳ |
| 3 | `fix/load-component-data` | A1–A8 — stops all crashes | ⏳ |
| 4 | `fix/keyboard-shortcuts` | D2 | ⏳ |
| 5 | `chore/remove-legacy-code` | E1 | ⏳ |
| 6 | `fix/ai-chat-wiring` | B1–B3 | ⏳ |
| 7 | `fix/ai-answer-matching` | D1 | ⏳ |
| 8 | `fix/chat-html-escaping` | D6, D7 | ⏳ |
| 9 | `fix/viewer-component-list` | B4, C1 (part list) | ⏳ |
| 10 | `fix/viewer-pin-panel` | B5–B7 | ⏳ |
| 11 | `fix/viewer-toolbar` | C1 (toolbar) | ⏳ |
| 12 | `fix/simulator-controls` | C2, B9 | ⏳ |
| 13 | `fix/simulator-init-once` | D3, D5 | ⏳ |
| 14 | `fix/database-view` | C3 | ⏳ |
| 15 | `fix/projects-view` | C4 | ⏳ |
| 16 | `fix/settings-theme` | C5 | ⏳ |
| 17 | `fix/topbar-panels` | C6 | ⏳ |
| 18 | `fix/single-background` | D4 | ⏳ |
| 19 | `feat/hash-routing` | D9 | ⏳ |
| 20 | `fix/3d-model-mapping` | D8 | ⏳ |
| 21 | `chore/cleanup-assets` | E2–E5 | ⏳ |
| 22 | `chore/update-dependencies` | E6 | ⏳ |
| 23+ | `refactor/split-*` | Split `app.js`, `data.js`, `main.css` into `src/` folders | ⏳ |

Status: ⏳ not started · 🔄 in progress · ✅ merged
