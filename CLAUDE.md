# CLAUDE.md

Instructions for Claude Code when working in this repository.

## Project

CircuitLab (`emb3d-circuit-lab`): a browser electronics lab with a 3D component viewer, circuit simulator, component database, board pinouts, datasheets and an assistant. Vanilla JS, Vite 5, Three.js r128 + GSAP from CDN, Canvas 2D. No framework.

```bash
npm run dev       # http://localhost:3000
npm run build     # → dist/
npm run preview
```

- Folder map and dependency rules: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Known bugs (codes A1…E9) and fix steps: [docs/FIX_PLAN.md](docs/FIX_PLAN.md)
- Branch rules, commit format and branch plan: [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md)

## Git: the user runs every git command

- **Never run git commands that change anything**: no `init`, `add`, `commit`, `push`, `pull`, `merge`, `switch`, `checkout`, `branch -d`/`-D`, `reset`, `restore`, `stash`, `rebase`, `tag`, and no `gh` commands that write.
- Read-only git is fine: `git status`, `git log`, `git diff`, `git branch`, `git branch --show-current`, `git remote -v`.
- When work is ready, **give the user the exact commands** to run: `git add <files by name>` plus `git commit -m "..."`. Use push and PR steps from [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md).
- Commit messages: `type: short description`, lowercase, under 72 characters, no `!`, and **no AI attribution or `Co-Authored-By` lines**.
- Suggest several small commits (one per logical change), not one big one.

## Workflow for each issue

1. Check the branch with `git branch --show-current`. If it's `main`, **stop** and give the user the branch command from the branch plan. Don't edit code on `main`.
2. Work on **only** the issue(s) this branch is for, as listed in the branch plan. Note anything else you notice, but don't fix it here.
3. Fix the root cause and keep the change as small as possible.
4. Test it:
   - `npm run build` must succeed.
   - Run the smoke tests (`npm run test:smoke`) and lint (`npm run lint`) once those branches are merged.
   - Until then, check with the dev server and a headless Chrome console that the affected screens throw no errors.
   - Report the before and after results honestly. If something still fails, say so.
5. Update the docs:
   - Mark the issue ✅ in [docs/FIX_PLAN.md](docs/FIX_PLAN.md).
   - Set the branch status in [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md).
   - Add a line under **Unreleased** in [CHANGELOG.md](CHANGELOG.md).
   - Update [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) if files moved or the load order changed.
6. Give the user the commit commands, split into logical commits, then the push/PR/merge steps.
7. After the user confirms the merge, give the commands to start the next branch in the plan.

## Code rules

- `index.html` is the source of truth for element IDs. Change the JS to match it, not the other way round.
- Modules currently talk through `window` globals (`CircuitApp`, `ThreeViewer`, `CircuitSimulator`, `CircuitLabData`). Every file must be imported in [src/main.js](src/main.js) in dependency order.
- Wire each button once, on the first visit to a screen, never on every visit.
- Escape user text before putting it into `innerHTML`.
- No secrets or API keys in browser code.
- Match the existing style: 2-space indent, IIFE modules, `/* ── Section ── */` comment headers.
- Don't edit `dist/` (generated) or `node_modules/`. `legacy/` is reference-only until `chore/remove-legacy-code`.

## Communication

The user prefers **simple English** and short bullet points. Explain what changed, why, and how it was tested, then give the commands.
