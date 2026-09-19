# Project context

**Where the project is right now.** Read this first in every session, and update the "Now" block at the end of every session ([AGENTS.md](../../AGENTS.md)).

## Now

| | |
|---|---|
| Updated | 2026-09-19 |
| Stage | **Build, Phase 0 (Foundations)**. The owner agreed to the plan and accepted ADRs 0004–0009 on 2026-09-19 |
| Version | `1.0.0` in `package.json` (the finished demo). Roadmap releases will be tagged `v0.1.0`… per phase ([ADR 0008](../decisions/0008-phase-branches.md)) |
| Branch | `docs/accept-roadmap-adrs` (row R0), from `phase/0-foundations` |
| Committed | #32 and the planning docs are on `main` and pushed; `phase/0-foundations` was made from it |
| Tests | 220 smoke tests passing, lint 0 warnings, build clean (last full run 2026-09-19) |
| Last done | R0: ADRs 0004–0008 accepted, ADR 0009 (vanilla JS + JSDoc type checks) added |
| Next | The owner merges the R0 PR into `phase/0-foundations`, then row R0a `chore/ci-github-actions` |
| Blockers | None |

## The project in one paragraph

CircuitLab is an open-source (MIT) browser electronics lab (3D viewer, circuit simulator, component library, board pinouts, datasheets, an assistant). It started as a demo for the owner's students. The fix plan made it stable (220 tests), but it is still a demo: a DC-only simulator, boards drawn as rectangles, box-built 3D models, and keyword "AI". The goal is a real, public, secure product: mostly users in India, $0 to start, room to grow, one admin (the owner), Google and email login, and AI by request. The plan is in [ROADMAP.md](../planning/ROADMAP.md).

## Key decisions so far

| Decision | Where |
|---|---|
| Supabase (Mumbai) + a separate free Cloudflare account on `*.pages.dev`; Google + email login, no temporary emails; phone login on hold; no card on any service | [ADR 0004](../decisions/0004-backend-and-hosting.md) |
| Our own time-step simulator in a Web Worker, tested against ngspice; Wokwi's MIT libraries for microcontrollers; no GPL code | [ADR 0005](../decisions/0005-simulator-engine.md) |
| The admin panel is a separate page for the owner only, guarded by the database, with MFA and an audit log | [ADR 0006](../decisions/0006-admin-panel.md) |
| AI access is by request and approved by the admin; later our own fine-tuned open model | [ADR 0007](../decisions/0007-ai-assistant.md) |
| Phase branches: features → phase branch → `main` when verified, tagged per phase | [ADR 0008](../decisions/0008-phase-branches.md) |
| Stay on vanilla JS; JSDoc + `checkJs` type checks, run in CI | [ADR 0009](../decisions/0009-vanilla-js-with-type-checks.md) |
| MIT licence; guests may use the lab; the owner is the only admin | [ROADMAP.md](../planning/ROADMAP.md), "What we need" |

## Files to look at first

- The plan: [ROADMAP.md](../planning/ROADMAP.md) · status: [PROGRESS.md](../tracking/PROGRESS.md) · rules: [AGENTS.md](../../AGENTS.md)
- Code entry: [src/main.js](../../src/main.js) → [src/app/app.js](../../src/app/app.js); the engines are in `src/engines/`
- The last session: the newest entry in [SESSION_LOG.md](SESSION_LOG.md)
