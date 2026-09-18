# Progress

Where every piece of work stands. **Update this file in the same PR as the work** ([AGENTS.md](../../AGENTS.md), "Keeping the docs current"). The rules for branches are in [GIT_WORKFLOW.md](../guides/GIT_WORKFLOW.md); what each row means and why is in [ROADMAP.md](../planning/ROADMAP.md).

Status: ⏳ not started · 🔄 in progress · ✅ merged

## Now

| | |
|---|---|
| Stage | **Discussion**: the roadmap and ADRs 0004–0008 are proposed, and nothing is built yet |
| Waiting for | The owner's go/no-go on the whole plan, then committing #32 and the docs on `main` |
| Next | Accept the ADRs (`docs/accept-roadmap-adrs`), then start `phase/0-foundations` |

## Roadmap (phases and their rows)

The work in [ROADMAP.md](../planning/ROADMAP.md), in order. Each phase has a **phase branch**. Each row is one feature branch, made from its phase branch, with one PR into it. A phase can gain rows when its work is split up further. No row starts until the decisions it depends on ([ADRs 0004–0008](../decisions/)) are accepted.

| Phase | Phase branch | Merged into `main` as | Status |
|---|---|---|---|
| 0 Foundations | `phase/0-foundations` | `v0.1.0` | ⏳ |
| 1 Simulator v2 | `phase/1-simulator` | `v0.2.0` | ⏳ |
| 2 Boards and 3D | `phase/2-boards-3d` | `v0.3.0` | ⏳ |
| 3 Accounts, admin v1, public beta | `phase/3-accounts-beta` | `v0.4.0` | ⏳ |
| 4 AI and admin v2 | `phase/4-ai-admin` | `v0.5.0` | ⏳ |
| 5 Microcontrollers | `phase/5-microcontrollers` | `v0.6.0` | ⏳ |
| 6 Classrooms | `phase/6-classrooms` | `v0.7.0` | ⏳ |
| 8 Own AI model | `phase/8-own-llm` | `v0.8.0` | ⏳ |

`v1.0.0` is for when the owner calls it finished for the public.

The feature rows:

| # | Branch | Phase | What | Status |
|---|---|---|---|---|
| R0 | `docs/accept-roadmap-adrs` | 0 | Mark ADRs 0004–0008 "Accepted" (the first PR into `phase/0-foundations`) | ⏳ |
| R0a | `chore/ci-github-actions` | 0 | CI: lint, build and Playwright on every PR (bundled Chromium); protect `main` | ⏳ |
| R0b | `chore/deploy-cloudflare` | 0 | Deploy to Cloudflare, a preview link per PR, security headers | ⏳ |
| R0c | `refactor/no-inline-handlers` | 0 | Replace inline `onclick` handlers with `addEventListener`, so the CSP needs no `unsafe-inline` | ⏳ |
| R0d | `chore/type-checks` | 0 | JSDoc + `checkJs` on data and services, run in CI | ⏳ |
| R0e | `feat/circuit-format` | 0 | One `diagram.json`-style circuit format with a validator; old saved projects converted | ⏳ |
| R0f | `chore/sentry` | 0 | Error tracking | ⏳ |
| R0g | `chore/mit-licence` | 0 | MIT `LICENSE` file and the `license` field in `package.json` | ⏳ |
| R1a | `feat/sim-engine-worker` | 1 | Time-step engine in a Web Worker, unit-tested against ngspice ([ADR 0005](../decisions/0005-simulator-engine.md)) | ⏳ |
| R1b | `feat/sim-editor` | 1 | Breadboard, select/move/rotate/delete parts and wires, properties panel, undo/redo | ⏳ |
| R1c | `feat/sim-probes` | 1 | Probes and scope channels as parts, live current dots | ⏳ |
| R1d | `feat/sim-parts` | 1 | Potentiometer, button, inductor, transistors, op-amp, signal generator, 555, logic gates | ⏳ |
| R2a | `feat/board-models-glb` | 2 | Board models from the `pcb-board-3d-model` skill, compressed, pins from the spec | ⏳ |
| R2b | `feat/board-explorer-real` | 2 | Board Explorer on the real artwork, pin panel with sources | ⏳ |
| R3a | `feat/auth-supabase` | 3 | Google and email login (no temporary emails), profiles with roles, Row Level Security with tests ([ADR 0004](../decisions/0004-backend-and-hosting.md)) | ⏳ |
| R3b | `feat/cloud-projects` | 3 | Projects in the cloud, sharing, fork, import local projects, backups | ⏳ |
| R3c | `feat/admin-v1` | 3 | Admin panel v1 ([ADR 0006](../decisions/0006-admin-panel.md)) | ⏳ |
| R3d | `feat/landing-and-legal` | 3 | Landing, help, privacy and terms pages: **public beta** | ⏳ |
| R4a | `feat/ai-access-requests` | 4 | "Request access" for AI, approved by the admin ([ADR 0007](../decisions/0007-ai-assistant.md)) | ⏳ |
| R4b | `feat/ai-proxy` | 4 | The AI server function: access check, limits, grounded answers, model behind a switch | ⏳ |
| R4c | `feat/admin-v2` | 4 | Service health, AI usage and switch, announcements | ⏳ |
| R5a | `feat/mcu-avr8js` | 5 | Code editor, build service, the Uno running in the worker | ⏳ |
| R5b | `feat/mcu-rp2040js` | 5 | Raspberry Pi Pico | ⏳ |
| R6a | `feat/classrooms` | 6 | Classes, join codes, assignments | ⏳ |
| R8a | `feat/own-llm-server` | 8 | Our own open model on a server behind the AI function | ⏳ |
| R8b | `test/ai-eval-set` | 8 | Checked electronics questions to score the model | ⏳ |
| R8c | `feat/llm-fine-tune` | 8 | LoRA fine-tune, deployed only if it beats R8b | ⏳ |

**What changes from Phase 0 on:** every PR runs the tests in CI and gets a preview link. A PR is merged only when CI is green and the preview works. The phase branch also gets its own preview link, which is where a whole phase is checked before it goes to `main`. Secrets go into GitHub and Cloudflare secret settings, never into the repo.

## History: the fix plan (#0–#32, finished)

Issue codes refer to [FIX_PLAN.md](../archive/FIX_PLAN.md). These branches were made from `main` and merged into it, before phase branches existed.

The order the known issues are fixed in. Issue codes refer to [FIX_PLAN.md](../archive/FIX_PLAN.md). From #5 on, the plan follows [ADR 0002](../decisions/0002-screen-markup.md).

| # | Branch | Fixes | Status |
|---|---|---|---|
| 0 | `docs/workflow-guides` | This guide, CLAUDE.md, PR template | ✅ |
| 1 | `test/smoke-tests` | Browser test: open every view, fail on any error | ✅ |
| 2 | `chore/eslint-setup` | Linter: catch mistakes before running | ✅ |
| 3 | `fix/load-component-data` | A1–A8 — stops all crashes | ✅ |
| 4 | `fix/keyboard-shortcuts` | D2, D13 | ✅ |
| 4b | `fix/viewer-first-load` | D15: 3D Viewer empty at startup | ✅ |
| 5 | `docs/screen-markup-decision` | F1 decided per screen → ADR 0002, new plan below | ✅ |
| 6 | `chore/remove-legacy-code` | E1: delete `legacy/` (old data listed in FIX_PLAN) | ✅ |
| 7 | `style/shared-panels` | F2: shared styles for panels, titles and buttons on every screen | ✅ |
| 8 | `feat/dashboard-home` | B8 (part): add the Dashboard as the home screen; keys `1–9` | ✅ |
| 9 | `fix/viewer-new-layout` | B4–B7, C1: switch the Viewer to the new layout (replaces the old #9–#11). Done **before #8**, so the canvas sizing is in place before the Viewer stops being the start screen. | ✅ |
| 10 | `fix/database-library` | C3, B8 (part), D10: show the Component Library in the Database screen | ✅ |
| 11 | `fix/ai-chat-wiring` | B1–B3, F6, F7 (AI chat layout, found here) | ✅ |
| 12 | `fix/ai-answer-matching` | D1 | ✅ |
| 12b | `feat/ai-chip-answers` | D17: the suggestion chips get real answers (write 3 answers, or change the chips); D27 (Board Explorer resize measured 1 px short, found here and blocking the merge gate) | ✅ |
| 13 | `fix/chat-html-escaping` | D6, D7 | ✅ |
| 13b | `fix/chat-lists-tables` | D18: show "- " lists and tables in AI replies | ✅ |
| 14 | `fix/simulator-layout-controls` | F3, C2, B9 (D12 moved to 14b) | ✅ |
| 14b | `fix/simulator-circuit-logic` | D12 (battery polarity, closed loop), D19 (delete keeps a wire), C7 (node count part) | ✅ |
| 14c | `fix/simulator-oscilloscope` | D21 (oscilloscope and multimeter resistance show real circuit values), C7 (ON button, V/div and T/div dials) | ✅ |
| 15 | `fix/simulator-init-once` | D3, D5, D20 (clock counts frames) | ✅ |
| 16 | `style/board-explorer` | F4 | ✅ |
| 16b | `fix/board-explorer-behaviour` | D22 (handlers added on every visit, redraw on resize), D23 (pin highlight), D25 (shared selected pin, found here) | ✅ |
| 16c | `feat/board-data` | D24: real pin data for Arduino Mega, ESP8266 (NodeMCU), Raspberry Pi Pico and STM32 Nucleo-F401RE, plus an "STM32 Blue Pill" tab | ✅ |
| 17 | `style/datasheet-sidebar` | F5: style the Datasheet sidebar and section bar, and stop the screen being cut off; E13 (flaky toast-count test, found here and blocking the merge gate) | ✅ |
| 17b | `style/ai-screen` | F8: move the AI screen's inline styles to CSS with design tokens | ✅ |
| 17c | `fix/datasheet-search-sections` | C8 (the datasheet search box is dead), D26 ("Pinout" has no data, `package` has no button) — both found in #17 | ✅ |
| 18 | `fix/projects-view` | C4; test timeout raised to 60 s, E15 logged | ✅ |
| 18b | `chore/faster-smoke-tests` | E15: stop non-3D tests waiting for the 3D engine, timeout back to 30 s (no speed win — see the corrected note) | ✅ |
| 19 | `fix/settings-theme` | C5; F10 logged | ✅ |
| 20 | `fix/topbar-panels` | C6, D14 (search ↑↓/↵) | ✅ |
| 21 | `fix/single-background` | D4; D28, D29 logged | ✅ |
| 22 | `feat/hash-routing` | D9; C9, E16 logged | ✅ |
| 22b | `docs/fix-changelog-and-guides` | CHANGELOG sections for #21, out-of-date README, LEARNING_GUIDE, ARCHITECTURE and CLAUDE.md, fix plan ticks | ✅ |
| 22c | `fix/background-theme` | D28 (background follows the theme), D29 (particles after a resize) | ✅ |
| 22d | `fix/topbar-buttons` | C9: the top bar's New Project and Share buttons; E17 (a slow 3D test timed out under load, found here and blocking the merge gate) | ✅ |
| 23 | `fix/3d-model-mapping` | D8, D11, D16 (free old models) | ✅ |
| 23b | `feat/passive-components` | Add a resistor, capacitor and LED (values from their datasheets, not the unsourced `legacy/` data), so `buildResistor`, `buildCapacitor` and `buildLED` have parts to draw (D8 follow-up, E1); D30 logged | ✅ |
| 24 | `chore/upgrade-threejs` | E7: Three.js r128 CDN → r186 from npm, works offline; E18 logged | ✅ |
| 25 | `chore/cleanup-assets` | E2–E5, E10 (GSAP and FontAwesome removed), E12 (dead CSS), E14 (font CDN errors fail tests) | ✅ |
| 25b | `chore/remove-unused-leftovers` | E16: the empty `#particle-field` div, `loadProjects()` and `state.projects` | ✅ |
| 26 | `chore/update-dependencies` | E6: `npm audit fix` and Vite 5 → 8, 0 vulnerabilities | ✅ |
| 27a | `refactor/split-data` | `data.js` → `src/data/` modules (byte-identical data); [ADR 0003](../decisions/0003-es-modules.md) | ✅ |
| 27b | `refactor/split-styles` | All of `main.css` → `base/`, `layout/`, `components/`, `views/`, same cascade order (every computed style identical) | ✅ |
| 27c | `refactor/split-app` | All of `app.js`: `utils/`, `ui/`, `services/`, state and a router; one `views/<screen>.view.js` per screen; 3D model builders → `engines/three-viewer/models/`; docs wrap-up | ✅ |
| 28 | `fix/remaining-issues` | D30 (ICs filed as passive), D29 follow-up (time-based background speed), E11 (last 7 lint warnings, cap 0), E19 (fonts loaded twice). F9, F10 and E18 left open | ✅ |
| 29 | `style/simulator-inline-colours` | F10: the Simulator dials and multimeter move from inline colours to CSS tokens | ✅ |
| 30 | `fix/final-cleanup` | F9 (Datasheet inline colours to tokens), E9 closed, final pass over every doc | ✅ |
| 31 | `fix/final-remaining-issues` | The last branch: D31–D48 (unsafe toast, Viewer controls and pin highlight, canvas sizes, datasheet mismatch, search, AI order, drag, high-DPI, saved circuits, PDF link…), E18 (Three.js loaded only for the Viewer), E20–E22 (dead code, empty folders, doc links), F11, F12 (light theme and design tokens) | ✅ |
| 32 | _(on `main`, no PR, by request)_ | Audit pass: D49–D54 (sample projects, board pin data, ESP32 headers, AI comparison words, Dashboard cards, sample data), E23–E27 (unplaceable Simulator parts, unused code, old comments, a service showing a message, stale docs) | 🔄 done on `main`, waiting for the owner's browser check and commit |

Status: ⏳ not started · 🔄 in progress · ✅ merged

Every issue in [FIX_PLAN.md](../archive/FIX_PLAN.md) is fixed. #32 was a one-time exception: the owner asked for it to be done on `main` with no branch or PR. It is committed on `main` after the owner's check. Everything after it goes back to one branch per change, through a PR.

