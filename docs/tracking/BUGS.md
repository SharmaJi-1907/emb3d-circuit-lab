# Bugs

Open bugs and cleanup, **found but not yet fixed**. Every issue from the original report (A1–F12, D49–E27) is fixed and kept in [FIX_PLAN.md](../archive/FIX_PLAN.md). New codes continue from there: **D** logic, **E** cleanup and project health, **F** layout and CSS.

How to add one: take the next free code, say how it was found and whether it was **measured** or only **read in the code**, and note where it lives. When it is fixed, mark it ✅ with the branch, and move it to "Fixed" below.

Severity: 🔴 critical · 🟠 high · 🟡 medium · ⚪ low

## Open

| # | Sev | Problem | Found | Where |
|---|---|---|---|---|
| D55 | 🟡 | **The Uno pin list isn't checked against the official pinout.** It was written from the standard shield layout in #32 (D50); the ESP32, Pi 4 and Blue Pill lists were checked against sources | #32, read | [src/data/boards.js](../../src/data/boards.js) |
| D56 | ⚪ | **The HC-SR04 3D model's pin header sits off the board's edge** (x 1.05–1.35 on a board ±0.9 wide) | #32, read in the code, not seen on screen | [models/boards.js](../../src/engines/three-viewer/models/boards.js) |
| D57 | ⚪ | **A 3D pin highlight can end up on the wrong pin.** Hovering a pin-table row highlights that pin in 3D, with nothing to undo it on mouse-out; hovering then leaving a pin in 3D removes the clicked pin's highlight | #32, read in the code, not tested | [viewer.view.js](../../src/views/viewer.view.js), [three-viewer/index.js](../../src/engines/three-viewer/index.js) |
| E28 | ⚪ | **Hard-coded colours on canvases and 3D materials**, against [CODING_STANDARDS.md](../rules/CODING_STANDARDS.md): the Board Explorer drawing, the background, the oscilloscope (the `--lcd-*` tokens exist) and the 3D `PIN_COLORS`, which copy the `--pin-*` values | #32, measured with grep | `boards.view.js`, `circuit-bg.js`, `simulator/index.js`, `three-viewer/` |
| E29 | ⚪ | **About 25 inline layout styles left in `index.html`** (Settings, Projects header and grid, Simulator toolbar, shortcuts pop-up). There are no colours, but Settings has no stylesheet of its own | #32, measured with grep | [index.html](../../index.html) |
| E30 | ⚪ | **Inline `onclick` handlers** in `index.html` and generated HTML stop a strict CSP. Planned in roadmap row R0c | #32, read | `src/views/`, `index.html` |

## Fixed

_Nothing yet since the fix plan._
