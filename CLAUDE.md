# CLAUDE.md

Instructions for Claude Code when working in this repository.

## Project

CircuitLab (`emb3d-circuit-lab`): a browser electronics lab with a 3D component viewer, circuit simulator, component database, board pinouts, datasheets and an assistant. Vanilla JS, Vite 5, Three.js r128 from CDN (GSAP is also loaded but unused, E10), Canvas 2D. No framework.

```bash
npm run dev          # http://localhost:3000
npm run build        # → dist/
npm run preview
npm test             # lint + smoke tests
npm run lint         # ESLint only
npm run test:smoke   # browser smoke tests only
```

- Folder map and dependency rules: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Known bugs (codes A1…F6) and fix steps: [docs/FIX_PLAN.md](docs/FIX_PLAN.md)
- Branch rules, commit format and branch plan: [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md)

## Git: the user runs every git command

- **Never run git commands that change anything**: no `init`, `add`, `commit`, `push`, `pull`, `merge`, `switch`, `checkout`, `branch -d`/`-D`, `reset`, `restore`, `stash`, `rebase`, `tag`, and no `gh` commands that write.
- Read-only git is fine: `git status`, `git log`, `git diff`, `git branch`, `git branch --show-current`, `git remote -v`.
- When work is ready, **give the user the exact commands** to run: `git add <files by name>` plus `git commit -m "..."`. Use push and PR steps from [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md).
- Commit messages: `type: short description`, lowercase, under 72 characters, no `!`, and **no AI attribution or `Co-Authored-By` lines**.
- Suggest several small commits (one per logical change), not one big one.

## Workflow for each issue

1. Check the branch with `git branch --show-current`. If it's `main`, **stop** and give the user the branch command from the branch plan. Don't edit code on `main`.
2. **Analyse first, then wait for "go".** Before changing anything, present:
   - what the branch does and why
   - findings, verified by running or reading the code (never guessed)
   - constraints
   - the test plan
   - a "done when" checklist

   Edit no files until the user says go.
3. Work on **only** the issue(s) this branch is for, as listed in the branch plan. Note anything else you notice (add it to FIX_PLAN), but don't fix it here.
4. Fix the root cause and keep the change as small as possible.
5. Verify, test and validate:
   - `npm test` must pass (lint and smoke tests; see **Tests** below).
   - `npm run build` must succeed.
   - Add or extend a test that **fails before the fix and passes after it**, and prove both.
   - Report the before and after results honestly. If something still fails, say so.
6. Update the docs:
   - Mark the issue ✅ in [docs/FIX_PLAN.md](docs/FIX_PLAN.md).
   - Set the branch status in [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md).
   - Add a line under **Unreleased** in [CHANGELOG.md](CHANGELOG.md).
   - Update [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) if files moved or the load order changed.
7. Present the results. Include **how the user can verify it themselves**, the commit commands split into logical commits, the PR title and description, and the push/merge steps.
8. After the user confirms the merge, give the commands to start the next branch in the plan.

## Tests

```bash
npm test              # lint, then smoke tests
npm run lint          # ESLint 10 (eslint.config.js)
npm run test:smoke    # Playwright smoke tests (tests/smoke/)
npm run test:report   # open the HTML report
```

**Lint**
- New mistakes (undefined names, duplicate keys, unreachable code…) are **errors**.
- Known leftovers are **warnings**, capped by `--max-warnings` in `package.json` (currently 17, issue E11). When a fix removes warnings, lower the cap to the new count. Never raise it.
- Cross-file `window` globals are declared only for `src/app/app.js` in [eslint.config.js](eslint.config.js). If another file starts using one by bare name, declare it there for that file.
- `dist/` and test output are ignored.

**Smoke tests**

- Uses the locally installed Google Chrome (`channel: 'chrome'` in [playwright.config.js](playwright.config.js)). It starts the dev server on port 3000 itself, or reuses one that's already running.
- A test fails on any uncaught exception or `console.error`. Known noise is listed in `IGNORED_CONSOLE_ERRORS` in [tests/smoke/helpers.js](tests/smoke/helpers.js), tagged with its issue code. Remove an entry when that issue is fixed.
- Known bugs are marked `knownBug('<code>')` (from `helpers.js`) in the spec files and are **expected to fail**. When a fix makes one pass, Playwright reports "Expected to fail, but passed". Remove that marker in the same branch as the fix. Never add a `knownBug()` just to hide a new failure.
- Files: `app.spec.js` (screens, data, 3D first load, search, AI), `keyboard.spec.js` (shortcuts, explode), `styles.spec.js` (computed styles of shared building blocks), `viewer.spec.js` (3D Viewer layout and sizing), `database.spec.js` (Component Library in the Database screen), `ai.spec.js` (AI chat: sending, layout, message styles, which answer is picked, safe text, code blocks), `simulator.spec.js` (Simulator layout, controls, multimeter, circuit logic, oscilloscope, drawing loop), `boards.spec.js` (Board Explorer layout and styles).
- **3D tests are slower than the rest**: headless Chrome draws 3D on the CPU (about 15 fps with 1 browser, about 5 fps with 4). The 3D scene and the Simulator board aren't drawn while hidden, and the Dashboard is the start screen, so only Viewer tests pay this cost (full suite about 1.4 min). Use `openViewer()` from `helpers.js` in 3D tests. Engine animations are **time-based**; keep new ones time-based too.
- **Style checks use computed styles, not screenshots.** Assert `getComputedStyle` values with `styleOf()` from `helpers.js`, and check the element has no inline style overriding that property first (the app sets inline `display` on screens, so check the property itself, e.g. `el.style.padding`).
- **Wait for conditions, not fixed times.** Headless Chrome renders 3D in software, so timers and animations run several times slower under load. Use `expect.poll` or `expect(locator)` waits, and use `settle()` only to let pending timers fire.
- **3D checks use model data, not pixels.** Use `modelSize()` / `waitForStableModel()` from `helpers.js` (built on `ThreeViewer.getModelBounds()`). Colour and pixel counts change with camera angle and lighting, and proved flaky.
- Before merging a branch that touches tests, run `npx playwright test tests/smoke --repeat-each=4` and expect **0 unexpected**.

## Code rules

- **Page markup follows [ADR 0002](docs/decisions/0002-screen-markup.md), per screen.**
  - **Viewer, Database (→ Component Library) and Dashboard** use the markup that `app.js` and `main.css` expect. Change `index.html` to match them.
  - **All other screens** (Simulator, Boards, Datasheet, AI, Projects, Settings, sidebar, top bar) keep `index.html`. Change the JS or CSS to match the page.
- Modules currently talk through `window` globals (`CircuitApp`, `ThreeViewer`, `CircuitSimulator`, `CircuitLabData`). Every file must be imported in [src/main.js](src/main.js) in dependency order.
- Wire each button once, on the first visit to a screen, never on every visit.
- Escape user text before putting it into `innerHTML`.
- No secrets or API keys in browser code.
- Match the existing style: 2-space indent, IIFE modules, `/* ── Section ── */` comment headers.
- **CSS:** use the design tokens in `main.css` (`--bg-card`, `--border`, `--radius-lg`…), never hard-coded colours. Shared building blocks go in `src/styles/components/`, and styles for one screen go in `src/styles/views/<screen>.css`. Import new CSS files in `src/main.js` after `main.css`.
- Don't edit `dist/` (generated) or `node_modules/`.
- The old `legacy/` folder was deleted in branch #6. Old data worth restoring (resistor/capacitor entries, pin descriptions, datasheet tables) is listed under E1 in FIX_PLAN, with the `git show` command to get it back.

## Communication

The user prefers **simple English** and short bullet points. Explain what changed, why, and how it was tested, then give the commands.
