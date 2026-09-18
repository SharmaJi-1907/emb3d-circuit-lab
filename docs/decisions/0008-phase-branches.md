# 0008 — Phase branches: `main` only receives finished phases

- **Status:** Proposed (the owner's idea, 2026-09-18; accepted when the plan is agreed)
- **Date:** 2026-09-18

## Context

During the fix plan (#0–#32), every branch was made from `main` and merged straight back into it. That fitted small, separate bug fixes. The roadmap ([ROADMAP.md](../planning/ROADMAP.md)) is different: each phase is many changes that only make sense together (the new simulator engine is not useful until its editor and probes exist). `main` will also be the **live site** from Phase 0 on, so a half-finished phase must never reach it.

## Options considered

1. **Every branch from `main`, as before.** `main` would hold half-finished phases, and the live site would change with every PR.
2. **One long `develop` branch** (GitFlow). One integration branch for everything: phases blur together, and there is no clear point where a phase is finished.
3. **One integration branch per phase.** ✅ Chosen by the owner.

## Decision

- Each roadmap phase gets a branch `phase/<n>-<name>`, made from the latest `main` only after the previous phase is merged.
- The work inside a phase is done on feature branches (`feat/`, `fix/`, `chore/`…) made from the phase branch, and merged into it by PR.
- A phase is merged into `main` by **one PR**, only when the whole phase is tested (`npm test`, the build, and the `--repeat-each=4` run) and **verified by the owner in the browser**. Then it is tagged `v0.<phase+1>.0`.
- `main` and `phase/*` are protected: no direct commits and no force pushes.
- An urgent fix to the live site is a `hotfix/…` branch from `main`, merged into `main`, then `main` is merged into the open phase branch.
- Commit messages and PRs keep the same rules as before ([GIT_WORKFLOW.md](../guides/GIT_WORKFLOW.md)).

## Consequences

- `main` is always a finished, verified release: what is deployed is what was checked.
- Each phase has one clear finish line (its merge PR and its version tag), which also reads well in the project's history.
- Feature PRs must target the phase branch, not `main`. The PR checklist asks for this.
- Phases are worked on one at a time. Running two phases in parallel would need both branches synced, so it is avoided.
