# Review checklists

Three checklists: one for a feature PR, one for a phase PR, and one for a deploy. The PR template ([.github/pull_request_template.md](../../.github/pull_request_template.md)) has the short version of the first.

## Feature PR (feature branch → phase branch)

- [ ] **Base is the current `phase/*` branch**, not `main`
- [ ] The branch does one thing: its roadmap row (e.g. `R1a`) or bug code (e.g. `D55`)
- [ ] The analysis was shown and the owner said "go" before the code changed
- [ ] `npm test` passes (lint with 0 warnings, and the smoke tests); `npm run build` passes
- [ ] A test fails before the change and passes after it, and both results are in the PR (a refactor shows its before/after snapshot)
- [ ] If tests changed: `--repeat-each=4` with 0 unexpected
- [ ] No red errors in the browser console on the screens touched
- [ ] Code follows [CODING_STANDARDS.md](CODING_STANDARDS.md): tokens, escaping, wired once, nothing dead
- [ ] No secrets, no `dist/`, no `node_modules/`; any new dependency is explained and MIT-compatible
- [ ] **Docs updated in this PR:** [PROGRESS.md](../tracking/PROGRESS.md), [PROJECT_CONTEXT.md](../context/PROJECT_CONTEXT.md), [SESSION_LOG.md](../context/SESSION_LOG.md), [CHANGELOG.md](../../CHANGELOG.md), and any other doc the change touched ([AGENTS.md](../../AGENTS.md), "Keeping the docs current")
- [ ] New bugs noticed but not fixed are in [BUGS.md](../tracking/BUGS.md)
- [ ] The PR says how the owner can check it themselves

## Phase PR (phase branch → `main`)

- [ ] Every row of the phase in [PROGRESS.md](../tracking/PROGRESS.md) is ✅
- [ ] On the phase branch: `npm test`, `npm run build`, and `npx playwright test tests/smoke --repeat-each=4` with 0 unexpected
- [ ] The phase's "Done when" in [ROADMAP.md](../planning/ROADMAP.md) is met, and **the owner has checked it on the preview link**
- [ ] Security: the items in [SECURITY_RULES.md](SECURITY_RULES.md) that apply to this phase (RLS tests, secrets, headers) pass
- [ ] Docs:
  - ROADMAP phase status
  - ARCHITECTURE (if the structure changed)
  - RISK_REGISTER reviewed
  - ADRs accepted or added
  - KNOWLEDGE_BASE and OBSERVATIONS updated
- [ ] CHANGELOG: the phase's lines moved from **Unreleased** to `## [v0.<phase+1>.0] – <date>`
- [ ] The PR is titled `Phase <n>: <name>` and lists every feature PR in it
- [ ] After the merge: the version tag is pushed, the phase branch is deleted, and PROJECT_CONTEXT points to the next phase

## Deploy (from Phase 0 on)

- [ ] It deploys from `main` (or a preview from a PR), never from a laptop
- [ ] The secrets are set in the host (Cloudflare, Supabase, Doppler), and none are in the build output
- [ ] Security headers are present on the live site (check with the browser's network tab)
- [ ] The live site opens every screen with no console errors
- [ ] Sentry receives a test error; the backup job ran this week
- [ ] The free-tier usage numbers are below 80% (the admin panel, once it exists)
