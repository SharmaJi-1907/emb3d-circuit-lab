# Project context

**Where the project is right now.** Read this first in every session, and update the "Now" block at the end of every session ([AGENTS.md](../../AGENTS.md)).

## Now

| | |
|---|---|
| Updated | 2026-09-18 |
| Stage | **Discussion**: planning and docs only. No roadmap code is written until the owner agrees to the whole plan |
| Version | `1.0.0` in `package.json` (the finished demo). Roadmap releases will be tagged `v0.1.0`… per phase ([ADR 0008](../decisions/0008-phase-branches.md)) |
| Branch | `main` (one-time exception for #32 and the planning docs, by the owner's request) |
| Uncommitted on `main` | The #32 fixes (D49–D54, E23–E27), the roadmap, ADRs 0004–0008, and this docs structure. **Waiting for the owner's browser check, then the owner commits** |
| Tests | 220 smoke tests passing, lint 0 warnings, build clean (last full run 2026-09-18) |
| Last done | The docs moved into `context/`, `planning/`, `rules/`, `tracking/`, `guides/`, `archive/`; AGENTS.md is the one rulebook; the handoff system was added |
| Next | 1. The owner reviews the docs and gives go/no-go on the plan. 2. The owner commits on `main`. 3. `phase/0-foundations` from `main`, first row `docs/accept-roadmap-adrs` |
| Blockers | None. Waiting for the owner's decision |

## The project in one paragraph

CircuitLab is an open-source (MIT) browser electronics lab (3D viewer, circuit simulator, component library, board pinouts, datasheets, an assistant). It started as a demo for the owner's students. The fix plan made it stable (220 tests), but it is still a demo: a DC-only simulator, boards drawn as rectangles, box-built 3D models, and keyword "AI". The goal is a real, public, secure product: mostly users in India, $0 to start, room to grow, one admin (the owner), Google and email login, and AI by request. The plan is in [ROADMAP.md](../planning/ROADMAP.md).

## Key decisions so far

| Decision | Where |
|---|---|
| Supabase (Mumbai) + a separate free Cloudflare account on `*.pages.dev`; Google + email login, no temporary emails; phone login on hold; no card on any service | [ADR 0004](../decisions/0004-backend-and-hosting.md) (proposed) |
| Our own time-step simulator in a Web Worker, tested against ngspice; Wokwi's MIT libraries for microcontrollers; no GPL code | [ADR 0005](../decisions/0005-simulator-engine.md) (proposed) |
| The admin panel is a separate page for the owner only, guarded by the database, with MFA and an audit log | [ADR 0006](../decisions/0006-admin-panel.md) (proposed) |
| AI access is by request and approved by the admin; later our own fine-tuned open model | [ADR 0007](../decisions/0007-ai-assistant.md) (proposed) |
| Phase branches: features → phase branch → `main` when verified, tagged per phase | [ADR 0008](../decisions/0008-phase-branches.md) (proposed) |
| MIT licence; guests may use the lab; the owner is the only admin | [ROADMAP.md](../planning/ROADMAP.md), "What we need" |

## Files to look at first

- The plan: [ROADMAP.md](../planning/ROADMAP.md) · status: [PROGRESS.md](../tracking/PROGRESS.md) · rules: [AGENTS.md](../../AGENTS.md)
- Code entry: [src/main.js](../../src/main.js) → [src/app/app.js](../../src/app/app.js); the engines are in `src/engines/`
- The last session: the newest entry in [SESSION_LOG.md](SESSION_LOG.md)
