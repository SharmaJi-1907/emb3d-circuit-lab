# Documentation

Every doc for CircuitLab, and when to read it. The rules for AI agents and helpers are in [AGENTS.md](../AGENTS.md) at the repository root.

## Start here

| Doc | Read it when… |
|---|---|
| [context/PROJECT_CONTEXT.md](context/PROJECT_CONTEXT.md) | You want to know where the project is **right now** (read this first in every session) |
| [context/SESSION_LOG.md](context/SESSION_LOG.md) | You're picking up the work: what the last session did and left open |
| [context/RESUME_PROMPT.md](context/RESUME_PROMPT.md) | You're starting a new AI chat and want it to continue the work |
| [guides/LEARNING_GUIDE.md](guides/LEARNING_GUIDE.md) | You're new to the code and want a plain-English tour |

## The folders

| Folder | What's in it | Files |
|---|---|---|
| `context/` | The project's memory: current state, session history, research, lessons | [PROJECT_CONTEXT](context/PROJECT_CONTEXT.md) · [SESSION_LOG](context/SESSION_LOG.md) · [RESUME_PROMPT](context/RESUME_PROMPT.md) · [KNOWLEDGE_BASE](context/KNOWLEDGE_BASE.md) · [OBSERVATIONS](context/OBSERVATIONS.md) |
| `planning/` | What we are building and how it fits together | [ROADMAP](planning/ROADMAP.md) (the master plan) · [ARCHITECTURE](planning/ARCHITECTURE.md) · [RISK_REGISTER](planning/RISK_REGISTER.md) |
| `decisions/` | Why things are the way they are (ADRs). One file per decision. Never rewrite an accepted one; add a new one that replaces it | See the list below |
| `tracking/` | Where the work stands | [PROGRESS](tracking/PROGRESS.md) (phases and branches) · [BUGS](tracking/BUGS.md) (open bugs) · [EXPERIMENTS](tracking/EXPERIMENTS.md) (trials and results) |
| `rules/` | How we work | [CODING_STANDARDS](rules/CODING_STANDARDS.md) · [TESTING_STRATEGY](rules/TESTING_STRATEGY.md) · [SECURITY_RULES](rules/SECURITY_RULES.md) · [REVIEW_CHECKLIST](rules/REVIEW_CHECKLIST.md) |
| `guides/` | How-tos | [GIT_WORKFLOW](guides/GIT_WORKFLOW.md) · [LEARNING_GUIDE](guides/LEARNING_GUIDE.md) |
| `archive/` | Finished work, kept for its history and issue codes | [FIX_PLAN](archive/FIX_PLAN.md) (the bug report A1–F12, D49–E27, all fixed) |
| `images/` | Screenshots used by these docs | — |

**At the repository root:** [README](../README.md) · [AGENTS](../AGENTS.md) (rules for every AI tool) · [CLAUDE](../CLAUDE.md) (loads AGENTS) · [CONTRIBUTING](../CONTRIBUTING.md) · [SECURITY](../SECURITY.md) (reporting a problem) · [CHANGELOG](../CHANGELOG.md). The Cursor rules file is `.cursor/rules/circuitlab.mdc`.

## Keeping the docs current

A change isn't done until its docs are updated, in the same PR. The table of what to update when is in [AGENTS.md](../AGENTS.md), "Keeping the docs current".

## Decisions

| ADR | Decision |
|---|---|
| [0001](decisions/0001-folder-structure.md) | Folder structure (`src/`, `docs/`, `tests/`…) |
| [0002](decisions/0002-screen-markup.md) | Which page markup each screen uses: new layout for Viewer, Database and Dashboard; current page for the rest |
| [0003](decisions/0003-es-modules.md) | ES modules inside the split files; `window.CircuitApp`, `CircuitLabData`, `ThreeViewer` and `CircuitSimulator` stay as the public API |
| [0004](decisions/0004-backend-and-hosting.md) | Supabase (Mumbai) for login and data, a separate free Cloudflare account on `*.pages.dev`, Student Pack extras; Google and email login (no temporary emails), phone login on hold |
| [0005](decisions/0005-simulator-engine.md) | Our own time-step simulator in a Web Worker, tested against ngspice; Wokwi's MIT libraries for microcontrollers |
| [0006](decisions/0006-admin-panel.md) | The admin panel is a separate page for the owner only, guarded by database roles, MFA and an audit log |
| [0007](decisions/0007-ai-assistant.md) | AI access by request, approved by the admin; our own fine-tuned open model in an extra phase |
| [0008](decisions/0008-phase-branches.md) | One branch per roadmap phase; feature branches merge into it, and `main` only receives finished, verified phases |
| [0009](decisions/0009-vanilla-js-with-type-checks.md) | Stay on vanilla JS; add type checks with JSDoc + `checkJs`, starting with data and services, run in CI |
