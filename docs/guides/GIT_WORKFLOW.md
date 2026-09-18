# Git Workflow

How changes get from an idea to `main`.

## Branch model: phase branches (from the roadmap on)

Decided in [ADR 0008](../decisions/0008-phase-branches.md). Each phase of [ROADMAP.md](../planning/ROADMAP.md) gets its own **phase branch**. The work inside a phase is done on small **feature branches** made from the phase branch. `main` only receives a phase once the whole phase is tested and verified.

```
main   ●──────────────────────────────●───────────────────────────────●──▶
        \                          v0.1.0 \                        v0.2.0
         \                              ↗   \                        ↗
          phase/0-foundations ●───●───●      phase/1-simulator ●───●───●
                               ↑   ↑   ↑                        ↑   ↑   ↑
                       feature PRs (chore/ci-…, chore/deploy-…)   feature PRs (feat/sim-…)
```

| Branch | Made from | Merges into | Who commits to it |
|---|---|---|---|
| `main` | — | — | **Nobody directly.** Only a finished phase (by PR), or an urgent hotfix |
| `phase/<n>-<name>` | the latest `main` | `main`, by one PR when the phase is done | **Nobody directly.** Only feature PRs |
| `feat/…`, `fix/…`, `chore/…`, `docs/…`, `test/…`, `refactor/…`, `style/…` | the current phase branch | that phase branch, by PR | You, one logical change per branch |
| `hotfix/…` | `main` | `main` by PR, then `main` is merged into the open phase branch | Only for something broken on the live site |

## Rules

1. **`main` and every `phase/*` branch are protected.** Never commit to them directly. `main` always runs and is what is deployed.
2. **One phase branch per roadmap phase**, made from the latest `main` only after the previous phase is merged.
3. **One feature branch per change**, made from the current phase branch.
4. **Feature → phase:** a PR, merged only when its tests pass (CI green from R0a on) and its preview works.
5. **Phase → `main`:** one PR, merged only when **the whole phase** is tested and verified (see "Finishing a phase" below). Then the release is tagged (`v0.<phase+1>.0`).
6. **Small commits** with short, clear messages. Commit messages and PRs follow the same rules as always (below).

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

## Starting a phase

Only after the previous phase is merged into `main`:
```bash
git switch main
git pull
git switch -c phase/1-simulator
git push -u origin phase/1-simulator
```
On GitHub, protect it like `main` (see "Protect `main` and the phase branches" below).

## The cycle for every change inside a phase

### 1. Start from an up-to-date phase branch
```bash
git switch phase/1-simulator
git pull
git switch -c feat/short-description
```
_Before the roadmap (the FIX_PLAN branches), branches were made from `main`; that history is in [PROGRESS.md](../tracking/PROGRESS.md)._

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
git push -u origin feat/short-description
```
On GitHub: **Compare & pull request** → set **base: `phase/1-simulator`** (not `main`) → fill in the template → **Create pull request**.

### 5. Merge
Check the PR against the checklist, then use **Merge pull request** → **Create a merge commit**. This keeps every commit from the branch in the history. Then click **Delete branch**.

### 6. Sync and clean up
```bash
git switch phase/1-simulator
git pull
git branch -d feat/short-description
```
Then start the next change at step 1.

## Finishing a phase

When every row of the phase in [PROGRESS.md](../tracking/PROGRESS.md) is ✅:

1. On the phase branch, run the full checks: `npm test`, `npm run build`, and `npx playwright test tests/smoke --repeat-each=4` (0 unexpected).
2. Check the phase's preview link in the browser against the "Done when" line in [ROADMAP.md](../planning/ROADMAP.md). **The owner verifies it themselves.**
3. Docs are up to date (the list in [AGENTS.md](../../AGENTS.md), "Keeping the docs current"). CHANGELOG's lines for the phase move from "Unreleased" to a new version heading. The full list is in [REVIEW_CHECKLIST.md](../rules/REVIEW_CHECKLIST.md), "Phase PR".
4. Open **one PR: `phase/1-simulator` → `main`**, titled `Phase 1: Simulator v2`, with a summary of every feature PR in it.
5. Merge with **Create a merge commit**, then tag the release:
   ```bash
   git switch main
   git pull
   git tag -a v0.2.0 -m "phase 1: simulator v2"
   git push origin v0.2.0
   ```
6. Delete the phase branch, then start the next phase from `main`.

## Urgent fix on the live site (hotfix)

If `main` (the live site) is broken and can't wait for the phase:
```bash
git switch main
git pull
git switch -c hotfix/short-description
# fix, test, commit, push, PR into main, merge
git switch phase/1-simulator
git pull
git merge main          # bring the fix into the open phase
git push
```

## Pull Request checklist

- [ ] **Base branch is right:** a feature PR targets the current `phase/*` branch; only a phase PR or a hotfix targets `main`
- [ ] Branch does **one** thing: its roadmap row (e.g. `R1a`) or bug code (e.g. `D55`, from [BUGS.md](../tracking/BUGS.md))
- [ ] App runs with no red errors in the browser console
- [ ] `npm test` passes (lint with 0 warnings, and the smoke tests), and any `knownBug()` marker for the fixed issue has been removed
- [ ] Docs updated in the same PR: [PROGRESS.md](../tracking/PROGRESS.md), [PROJECT_CONTEXT.md](../context/PROJECT_CONTEXT.md), [SESSION_LOG.md](../context/SESSION_LOG.md), [CHANGELOG.md](../../CHANGELOG.md), and any doc the change touches
- [ ] No secrets, no `dist/`, no `node_modules/`

The full checklists (feature PR, phase PR, deploy) are in [REVIEW_CHECKLIST.md](../rules/REVIEW_CHECKLIST.md).

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

## Protect `main` and the phase branches

**Settings → Rules → Rulesets → New branch ruleset** → targets `main` and `phase/*` → enable **Require a pull request before merging**, **Block force pushes** and, once CI exists (R0a), **Require status checks to pass**. GitHub then rejects any direct push to them.

## Where the branch status lives

The list of branches, phase by phase, with their status, is in [PROGRESS.md](../tracking/PROGRESS.md). That includes the history of the fix plan (#0–#32).
