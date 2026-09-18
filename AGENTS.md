# AGENTS.md

The rules for **every AI agent** working in this repository (Claude Code, Cursor, Codex, Copilot and others) and for any person helping. [CLAUDE.md](CLAUDE.md) and [.cursor/rules/circuitlab.mdc](.cursor/rules/circuitlab.mdc) load this file. When a rule changes, change it **here**.

## Project

CircuitLab (`emb3d-circuit-lab`) is an open-source (MIT) browser electronics lab: a 3D component viewer, circuit simulator, component library, board pinouts, datasheets and an assistant. It is built with vanilla JS, Vite 8 (Node 20.19+), Three.js r186 (bundled from npm) and Canvas 2D, with no framework. It is growing from a working demo into a public product: [ROADMAP.md](docs/planning/ROADMAP.md).

```bash
npm run dev          # http://localhost:3000
npm run build        # → dist/
npm test             # lint + smoke tests (must pass before every commit)
npm run lint         # ESLint only (0 warnings allowed)
npm run test:smoke   # Playwright browser tests only
```

## Start and end of every session

Anyone (AI or person) must be able to continue exactly where the last work stopped.

**At the start**, read these three before doing anything:
1. [PROJECT_CONTEXT.md](docs/context/PROJECT_CONTEXT.md): where the project is right now (stage, phase, branch, last done, next, blockers).
2. The latest entry in [SESSION_LOG.md](docs/context/SESSION_LOG.md): what the last session did and left open.
3. [PROGRESS.md](docs/tracking/PROGRESS.md): the status of each phase and branch.

Then check the branch with `git branch --show-current` and compare it with PROJECT_CONTEXT. If they disagree, say so before working.

**At the end** (and before any commit is proposed), update:
1. [SESSION_LOG.md](docs/context/SESSION_LOG.md): add an entry (date, tool, branch, what was done, tests run and their results, what is left, the next step).
2. [PROJECT_CONTEXT.md](docs/context/PROJECT_CONTEXT.md): the "Now" block.
3. Whatever else the change touched (see "Keeping the docs current" below).

A fresh AI chat can start from [RESUME_PROMPT.md](docs/context/RESUME_PROMPT.md).

## Keeping the docs current

The docs are part of the work: **a change is not done until its docs are updated in the same PR.**

| When this happens | Update |
|---|---|
| Any session | `docs/context/SESSION_LOG.md`, and `docs/context/PROJECT_CONTEXT.md` |
| A branch starts, gets merged or changes status | `docs/tracking/PROGRESS.md` |
| Anything a user would notice | `CHANGELOG.md`, under **Unreleased** |
| A bug is found (even if not fixed now) | `docs/tracking/BUGS.md` (the next free code) |
| A decision is made or changed | A new ADR in `docs/decisions/`. Never rewrite an accepted one; add one that replaces it. Then update `docs/README.md` |
| Files move, or the load order or structure changes | `docs/planning/ARCHITECTURE.md` |
| A new risk, or a risk changes | `docs/planning/RISK_REGISTER.md` |
| Research or facts found (with sources) | `docs/context/KNOWLEDGE_BASE.md` |
| A lesson learned, or something that went wrong | `docs/context/OBSERVATIONS.md` |
| A trial whose result matters (simulator accuracy, AI model) | `docs/tracking/EXPERIMENTS.md` |
| A phase finishes | Everything above, plus the ROADMAP status and a CHANGELOG version heading ([REVIEW_CHECKLIST.md](docs/rules/REVIEW_CHECKLIST.md), "Phase PR") |

A test fails on any broken link in the docs, so check links when moving or renaming a file.

## Git: the owner runs every git command

- **Never run git commands that change anything**: no `init`, `add`, `commit`, `push`, `pull`, `merge`, `switch`, `checkout`, `branch -d`/`-D`, `reset`, `restore`, `stash`, `rebase`, `tag`, and no `gh` commands that write.
- Read-only git is fine: `git status`, `git log`, `git diff`, `git branch`, `git branch --show-current`, `git remote -v`.
- When work is ready, **give the owner the exact commands**: `git add <files by name>` plus `git commit -m "..."`, then the push and PR steps from [GIT_WORKFLOW.md](docs/guides/GIT_WORKFLOW.md).
- Commit messages: `type: short description`, lowercase, under 72 characters, no `!`, and **no AI attribution or `Co-Authored-By` lines**.
- Suggest several small commits (one per logical change), not one big one.
- **Branch model** ([ADR 0008](docs/decisions/0008-phase-branches.md)):
  - Each roadmap phase has a `phase/<n>-<name>` branch made from `main`.
  - Work happens on feature branches made from the **phase branch**, and their PRs target it.
  - A finished, verified phase goes to `main` in one PR and is tagged.
  - Never edit code on `main` or on a `phase/*` branch.

## Workflow for each change

1. **Check the branch.** If it is `main` or `phase/*`, **stop** and give the owner the branch command for the next row in [PROGRESS.md](docs/tracking/PROGRESS.md).
2. **Analyse first, then wait for "go".** Before changing anything, present:
   - what the branch does and why
   - findings, verified by running or reading the code (never guessed)
   - constraints
   - the test plan
   - a "done when" checklist

   Edit no files until the owner says go. While the project is in the **discussion stage** (see PROJECT_CONTEXT), only docs are written.
3. Work on **only** this branch's row or bug. Note anything else in [BUGS.md](docs/tracking/BUGS.md), but don't fix it here.
4. Fix the root cause, and keep the change as small as possible.
5. **Verify, test and validate** ([TESTING_STRATEGY.md](docs/rules/TESTING_STRATEGY.md)):
   - `npm test` and `npm run build` pass.
   - A new or extended test **fails before the change and passes after it**, and you show both. A refactor proves nothing changed with a before/after snapshot.
   - Report results honestly. If something still fails, say so.
6. **Update the docs** (the table above).
7. **Present:**
   - what changed and why, and how it was tested
   - **how the owner can check it themselves**
   - the commit commands split into logical commits
   - the PR title and description (base: the phase branch)
   - the push and merge steps
8. After the owner confirms the merge, give the commands for the next row.

## The rules in short (details in docs/rules/)

- **Code** ([CODING_STANDARDS.md](docs/rules/CODING_STANDARDS.md)):
  - follow ADR 0002 (screen markup) and ADR 0003 (ES modules, 4 `window` globals)
  - wire each button once
  - escape user text before `innerHTML`
  - design tokens only, never hard-coded colours
  - nothing dead
  - refactors change no behaviour
- **Tests** ([TESTING_STRATEGY.md](docs/rules/TESTING_STRATEGY.md)):
  - lint cap 0
  - smoke tests fail on any console error
  - wait for conditions, not fixed times
  - 3D checks use model data, not pixels
  - `--repeat-each=4` before merging test changes
- **Security** ([SECURITY_RULES.md](docs/rules/SECURITY_RULES.md)):
  - no secrets in the repo or in browser code (the repo is public)
  - Row Level Security on every table, with tests
  - server-side checks for the admin and AI
  - the no-card rule for free services
- **Reviews** ([REVIEW_CHECKLIST.md](docs/rules/REVIEW_CHECKLIST.md)): the feature PR, phase PR and deploy checklists.

## Where things are

| Need | File |
|---|---|
| Where we are now | [docs/context/PROJECT_CONTEXT.md](docs/context/PROJECT_CONTEXT.md) |
| The plan and why | [docs/planning/ROADMAP.md](docs/planning/ROADMAP.md) |
| Folder map and module rules | [docs/planning/ARCHITECTURE.md](docs/planning/ARCHITECTURE.md) |
| Decisions | [docs/decisions/](docs/decisions/) (index in [docs/README.md](docs/README.md)) |
| Branch and phase status | [docs/tracking/PROGRESS.md](docs/tracking/PROGRESS.md) |
| Open bugs | [docs/tracking/BUGS.md](docs/tracking/BUGS.md) |
| The finished fix plan (codes A1–F12, D49–E27) | [docs/archive/FIX_PLAN.md](docs/archive/FIX_PLAN.md) |
| Every doc | [docs/README.md](docs/README.md) |

## Communication

The owner prefers **simple English** and short bullet points. Explain what changed, why, and how it was tested, then give the commands.
