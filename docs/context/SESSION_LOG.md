# Session log

One entry per work session, **newest first**. Anyone (AI or person) picking up the work reads the top entry. Add an entry at the end of every session, before proposing a commit ([AGENTS.md](../../AGENTS.md)).

Entry format:

```
## YYYY-MM-DD — short title
- Tool / who:
- Branch:
- Done:
- Tests run and results:
- Left open:
- Next step:
```

---

## 2026-09-19 — R0: accept the roadmap ADRs, Phase 0 starts

- **Tool / who:** Claude Code (Opus), with the owner.
- **Branch:** `docs/accept-roadmap-adrs` (row R0), from `phase/0-foundations`. At the start, `main`, `phase/0-foundations` and this branch were all at `a4e221c`, so the "uncommitted on `main`" note in PROJECT_CONTEXT was out of date. It is fixed now.
- **Done:**
  1. The owner said "go" on the plan: ADRs 0004–0008 are marked **Accepted (2026-09-19)**.
  2. New [ADR 0009](../decisions/0009-vanilla-js-with-type-checks.md): stay on vanilla JS, with JSDoc + `checkJs` type checks (roadmap decision 4 had no ADR; row R0d depends on it).
  3. "Proposed" removed from [docs/README.md](../README.md), [ROADMAP.md](../planning/ROADMAP.md) (decisions table, open questions) and PROJECT_CONTEXT.
  4. PROGRESS: Phase 0 and R0 🔄, #32 ✅. CHANGELOG updated.
- **Tests run and results:** `npm test`: **220 passed**, lint 0 warnings, the docs link test passing (it covers the new ADR 0009 links). `npm run build`: clean. No test had to fail first, because only docs changed.
- **Left open:** the later questions in ROADMAP "Open questions" (hosted AI before Phase 8, which server runs our model); the "check before launch" items in ADR 0004.
- **Next step:** the owner merges the R0 PR into `phase/0-foundations`, then row R0a `chore/ci-github-actions`.

## 2026-09-18 — Audit, #32 fixes, roadmap and docs structure

- **Tool / who:** Claude Code (Opus), with the owner.
- **Branch:** `main`. A one-time exception, at the owner's request (no branch, no PR). Nothing is committed yet.
- **Done:**
  1. **Full audit** of code and docs. The finished fix plan held up, but it found 6 new bugs and dead code.
  2. **#32 on `main`:**
     - D49: sample projects' "Open" → "View in 3D"
     - D50: complete pin lists for Uno, ESP32 DevKit, Pi 4 and Blue Pill
     - D51: the ESP32 3D headers turned the right way
     - D52: the AI's comparison words
     - D53: clickable Dashboard sample cards
     - D54: made-up sample data
     - E23: unplaceable Simulator parts removed; Switch, Diode and Ground added to the palette
     - E24–E27: unused code, old comments, a service showing UI, stale docs
  3. **Research** (in [KNOWLEDGE_BASE.md](KNOWLEDGE_BASE.md)):
     - online simulators (Wokwi, Tinkercad, Falstad…)
     - backend, login, security and hosting
     - GitHub Student Pack offers
     - phone OTP costs in India (DLT)
     - the owner's `pcb-board-3d-model` skill
  4. **Plan:**
     - [ROADMAP.md](../planning/ROADMAP.md) (phases 0–8, free tier, page map, admin panel, login, AI by request, own LLM)
     - ADRs 0004–0008 (proposed)
     - phase-branch Git workflow
  5. **Docs structure** (from the owner's AI-DEV-FRAMEWORK):
     - `context/`, `planning/`, `rules/`, `tracking/`, `guides/`, `archive/`
     - AGENTS.md as the one rulebook, with CLAUDE.md and the Cursor rules pointing to it
     - this session log and PROJECT_CONTEXT
- **Tests run and results:**
  - Before #32: 213 passed.
  - After #32: **220 passed**, and the 7 new tests **failed on the old code** (proved in a copy of the last commit).
  - Lint 0 warnings, build clean.
  - Docs link test passing after every doc change.
- **Left open:**
  - the owner's browser check of #32
  - the owner's go/no-go on the plan
  - commits on `main`
  - the Uno pin list (D50) still to be checked against Arduino's official pinout
  - the known leftovers in [BUGS.md](../tracking/BUGS.md)
- **Next step:** the owner reviews [ROADMAP.md](../planning/ROADMAP.md) and the ADRs. On "go": commit on `main` (the commands were given in chat; see [PROGRESS.md](../tracking/PROGRESS.md), "Now"), then start `phase/0-foundations`.
