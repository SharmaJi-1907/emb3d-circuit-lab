# CircuitLab (emb3d) — Bug Report & Fix Plan

_Scanned: 2026-09-12 · Files reviewed: all of `index.html`, `src/`, `js/`, `css/`, `dist/`, `package.json`_

## How this was checked

1. **Static check** — every `getElementById('...')` in the JS was compared with the `id="..."` values in `index.html`.
2. **Live check** — the app was run with `npm run dev`, opened in headless Chrome, and a script clicked every menu item, button, search box and keyboard shortcut while recording every error.
3. **Dependency check** — `npm audit`.

## Summary

| Area | Status |
|---|---|
| App loads, background animates | ✅ Works |
| Dashboard (home screen) | ✅ Stats, quick access, recently viewed, sample projects (#8) |
| Left menu switches screens | ✅ Works |
| 3D viewer | ✅ New layout (#9): part info, controls, full pin table, pin details, tooltip; canvas fills its area. Memory still grows on each visit (D16). |
| Circuit simulator | ✅ Layout, toolbar, palette (with a battery) and status bar work (#14). Circuits give correct results (#14b): an LED lights only in a closed loop and the right way round, and currents follow Ohm's law. The oscilloscope and multimeter show real circuit values, and the scope's ON button and dials work (#14c). It is set up once and draws only while visible, with a real-time clock (#15) |
| Component Database | ✅ Component Library (#10): category filter, sort, compare, part cards with "View 3D" |
| Board Explorer | ⚠️ Shows the board and its pins; layout partly unstyled (F1) |
| Datasheet Viewer | ✅ Shows datasheets |
| AI Assistant | ✅ Chat works (#11), picks the right stored answer (#12), shows typed text safely and code blocks correctly (#13). The chips ask things no stored answer covers (D17); lists and tables show as raw text (D18) |
| Projects | ✅ Shows 6 projects ("New project" button still dead, C4) |
| Search (Ctrl+K) | ✅ Works |
| Settings (dark mode) | ❌ Button does nothing |
| Keyboard shortcuts | ✅ Every listed shortcut works (1–9, / Ctrl/⌘ K, ?, W, E, R, Space, Esc) |

_Status updated after branch #3 (`fix/load-component-data`): no screen throws an error any more._

**Root cause:** `app.js` and the CSS were written together for a page layout that isn't in this project, and most of `index.html` was built separately (F1). On top of that, `data.js` was never loaded (A1, fixed in #3). **Which markup each screen uses is decided in [ADR 0002](decisions/0002-screen-markup.md).**

> **Paths:** this report was written before the restructure. File paths below use the new layout (see [ARCHITECTURE.md](ARCHITECTURE.md)). Line numbers are unchanged, because the files were moved without edits.

---

## Part 1 — Everything that is broken

Severity: 🔴 Critical (crash / feature dead) · 🟠 High (feature wrong) · 🟡 Medium · ⚪ Low (cleanup)

### A. Crashes (seen live in the browser)

| # | Sev | Problem | Where | Error seen |
|---|---|---|---|---|
| A1 | ✅ | `data.js` is never loaded, so `CircuitLabData` does not exist. This one bug causes A2–A8. _Fixed in #3: imported in `src/main.js`._ | [src/main.js](../src/main.js) | `ReferenceError: CircuitLabData is not defined` |
| A2 | ✅ | 3D Viewer: no part is selected, so it crashes reading `.id` of nothing. _Fixed by A1: the first part is selected at startup. No extra guard was added, because it would only hide a future data-loading failure, and the "component data is loaded" test catches that._ | [app.js:644](../src/app/app.js#L644) | `TypeError: Cannot read properties of null (reading 'id')` |
| A3 | ✅ | 3D model loader also needs `CircuitLabData`. _Fixed by A1._ | [three-viewer/index.js:726](../src/engines/three-viewer/index.js#L726) | (silently never called because of A2) |
| A4 | ✅ | Board Explorer crashes. _Fixed by A1._ | [app.js:983](../src/app/app.js#L983) | `ReferenceError` |
| A5 | ✅ | Datasheet Viewer crashes. _Fixed by A1._ | [app.js:1252](../src/app/app.js#L1252) | `ReferenceError` |
| A6 | ✅ | Projects crashes. _Fixed by A1._ | [app.js:1498](../src/app/app.js#L1498) | `ReferenceError` |
| A7 | ✅ | Search (Ctrl+K or `/`) crashes on typing. _Fixed by A1._ | [app.js:362](../src/app/app.js#L362) | `ReferenceError` |
| A8 | ✅ | AI Assistant crashes when you send a message. _Answer engine fixed by A1. The Send button is still broken (B1, B3), and answers are wrong (D1)._ | [app.js:1429](../src/app/app.js#L1429) | `ReferenceError` |

### B. Code looks for page elements that don't exist (name mismatch)

`app.js` asks for these IDs, but `index.html` uses different names. Result: that part of the screen stays empty.

> Per [ADR 0002](decisions/0002-screen-markup.md): **B4–B7** are fixed by switching the Viewer to the new layout (the page gets the IDs the JS expects). **B8** is fixed by adding the Dashboard and showing the Component Library in the Database screen. **B1–B3 and B9** are fixed on the JS side (those screens keep the current page).

| # | Sev | Code looks for | Page actually has | Where in code |
|---|---|---|---|---|
| B1 | ✅ | `ai-chat-area` | `ai-chat-messages` _**Fixed in #11:** messages show in the chat (tested: Send, Enter, chips, Datasheet "Ask AI"), below the welcome message, which now stays._ | [app.js:1391](../src/app/app.js#L1391) |
| B2 | ✅ | `ai-input` | `ai-user-query` _**Fixed in #11:** Enter sends exactly one message and clears the input (tested)._ | [app.js:1363](../src/app/app.js#L1363) |
| B3 | ✅ | `ai-send` | `ai-send-btn`. The only working hook is a page-wide click listener that checks `e.target.id === 'ai-send-btn'`, so clicking the **arrow icon** inside the button (where most people click) sends nothing. _Found by the smoke tests._ _**Fixed in #11:** the button is wired by its ID, so the icon works too (tested). The page-wide click and `keypress` listeners are removed; they only avoided double sends by accident (the first handler empties the input)._ | [app.js:1362](../src/app/app.js#L1362) |
| B4 | ✅ | `viewer-sidebar` | nothing — closest is `component-list` / `pin-info-panel` _**Fixed in #9:** the Viewer now uses the new layout (ADR 0002)._ | [app.js:649](../src/app/app.js#L649) |
| B5 | ✅ | `pin-table-body` | nothing — closest is `pin-details` _**Fixed in #9:** the Viewer now uses the new layout (ADR 0002)._ | [app.js:722](../src/app/app.js#L722) |
| B6 | ✅ | `pin-detail-panel` | `pin-info-panel` _**Fixed in #9:** the Viewer now uses the new layout (ADR 0002)._ | [app.js:756](../src/app/app.js#L756) |
| B7 | ✅ | `pin-tooltip` | nothing _**Fixed in #9:** the tooltip element exists and shows on pin hover (tested)._ | [app.js:1598](../src/app/app.js#L1598) |
| B8 | ✅ | `view-dashboard`, `view-components` | these screens don't exist in the page _**Dashboard part fixed in #8:** it is added as the home screen. The Component Library part follows in #10 (`fix/database-library`)._ _**Fully fixed in #10:** the library now draws into the Database screen, and the dead `components` view is removed._ | [app.js:386](../src/app/app.js#L386), [app.js:502](../src/app/app.js#L502) |
| B9 | ✅ | `mm-value` / `mm-unit` / `mm-mode-select` | `multimeter-val` / `multimeter-unit` / `mm-mode` _**Fixed in #14:** the engine uses the page's IDs, so the multimeter updates (tested: a resistor reads 1.00 kΩ)._ | [simulator.js:1140](../src/engines/simulator/index.js#L1140) |

### C. Buttons on the page with no code behind them

These are visible and clickable, but **nothing happens** (confirmed by clicking them in the live test).

| # | Sev | Screen | Dead buttons / panels |
|---|---|---|---|
| C1 | ✅ | 3D Viewer | Part list (`component-list`), filter box (`component-filter`), category buttons, Rotate, Wireframe, Explode, Pins, Reset camera, Screenshot, package switcher, HUD values, pin panel close. _ADR 0002: replaced by the new layout's working controls (part switcher, Solid/Wire/Explode, auto-rotate, zoom/reset). The package buttons, HUD and screenshot button are dropped (see Future ideas)._ _**Fixed in #9:** part switcher, Solid/Wire/Explode, auto-rotate and zoom/reset all work (tested)._ |
| C2 | ✅ | Simulator | Run, Pause, Stop, Clear, Export, Speed slider, Upload code, all "Add Resistor / LED / Capacitor / IC / Wire" buttons. The simulator's `startSim()` is **never called** by anything, so a circuit can never run. _Found in #14: the palette had no battery (no power source at all), "Wire" and "NE555 IC" aren't simulator parts, drag-from-palette read the wrong attribute, Stop was always disabled, and the status bar never changed._ _**Fixed in #14:** every control is wired once (tested). A Battery button is added to the palette. Wire and NE555 IC explain themselves; Upload Code says it isn't available yet. Pause keeps the time, Stop resets it, and the buttons are enabled only when they can be used. The status bar shows Running / Paused / Ready and the time._ |
| C3 | ✅ | Database | Component grid (`db-components-grid`), Compare button, comparison table. _ADR 0002: replaced by the Component Library (grid, filters, compare, sort)._ _**Fixed in #10:** the Database screen shows the Component Library (tested: all cards, filter, compare, View 3D)._ |
| C4 | 🟠 | Projects | "Create project" button (`create-project-btn`), project grid (`projects-grid`) |
| C5 | 🟠 | Settings | "Toggle Dark Mode" (`theme-btn-toggle`), top-bar theme toggle |
| C6 | 🟡 | Top bar | Notifications drawer, "Clear all", shortcuts modal (nothing can open it) |
| C7 | ✅ | Simulator | The oscilloscope ON button and the V/div and T/div dials do nothing, and "Nodes: 0" in the status bar never changes. _Found in #14._ _**Nodes part fixed in #14b:** the status bar shows the real number of nets (tested). The oscilloscope part moves to #14c with D21._ _**Fixed in #14c:** the ON button turns the screen off and on, and the V/div (0.5–10 V) and T/div (10 ms–1 s) dials step through their values, update their readouts and change the traces (tested)._ |

### D. Logic bugs (code runs but does the wrong thing)

| # | Sev | Problem | Where |
|---|---|---|---|
| D1 | ✅ | **AI always gives the wrong answer.** It matches only the first or second word of each stored question. Any message with "what" gets the LED-resistor answer; anything with "how" or "do" gets the I2C answer. Example: _"how does an esp32 work"_ → I2C wiring guide. _Measured in #12: 19 of 34 test questions right. Even the stored question "Explain how an ESP32 works" got the I2C guide._ _**Fixed in #12:** a named part gets its card first (punctuation ignored, so "MPU-6050" = "mpu6050"); otherwise the stored answer with the most whole-word keyword hits wins, specific topics first on a tie; no hits gives the "be more specific" reply. 59 of 60 test questions right (the miss is a nickname, see Future ideas). Tested in `ai.spec.js`._ | [app.js:1440-1482](../src/app/app.js#L1440-L1482) |
| D2 | ✅ | **Keyboard shortcuts are wrong.** Keys `1` and `2` go to "dashboard" and "components", which don't exist, so you get a blank screen. The shortcuts shown to the user (`W`, `E`, `R`, `Space`) are not coded at all. _Also found: ⌘K didn't work, Ctrl+3 (a browser shortcut) switched screens, `?` couldn't open the list, and Space re-clicked the focused sidebar button._ **Fixed in #4:** `1–8` follow the sidebar order; `W`/`E`/`R` work on the Viewer; `Space` works on the Simulator; `?` opens the list; Ctrl/⌘+K and `/` open search; keys are ignored while typing, with Ctrl/⌘/Alt, and on auto-repeat. Both shortcut lists now show every key. | [app.js:1526](../src/app/app.js#L1526) |
| D3 | ✅ | **Simulator gets set up again on every visit.** Each time you open the Simulator screen, it adds another set of mouse handlers and another endless drawing loop. After 5 visits one click adds 5 parts, and the CPU use keeps growing. _**Corrected in #15 (measured):** parts are **not** added twice. The canvas handlers are named functions, and the browser ignores adding the same function again (one drag after 3 visits adds 1 part; #14's note saying otherwise was wrong). What did pile up is the drawing loop: 3 visits → 3 loops, 99 frames/s instead of 33, and a clock running 3× too fast._ _Note from #14c (read in the code, not yet tested): `resizeCanvas` sizes the board from its box, and a hidden board's box is 0×0. Today each visit sets the engine up again, which hides this. Once #15 sets it up only once, a window resize while the Simulator is hidden must not shrink the board to 0×0._ _**Fixed in #15:** `init()` runs on the first visit only (and refuses to run twice), without the old 100 ms wait. The engine resizes its canvases on the first frame the board is visible again, which covers the first visit and a window resize while hidden (tested: one drawing loop after 3 visits; the board keeps its real size)._ | [app.js:878](../src/app/app.js#L878), [simulator.js:619](../src/engines/simulator/index.js#L619) |
| D4 | 🟡 | **Two background animations draw on the same canvas** (`circuit-bg`), which uses double the CPU and can flicker. | [app.js:87](../src/app/app.js#L87) and [circuit-bg.js:188](../src/engines/background/circuit-bg.js#L188) |
| D5 | ✅ | 3D and simulator drawing loops keep running when their screen is hidden, which wastes battery. _ESLint confirms: `animationId` and `animId` are stored but never used to cancel the loops._ _**3D part fixed in #9:** the 3D scene is not drawn while its screen is hidden (0 frames vs 38/s before, tested). The simulator loop is still open (#15)._ _**Simulator part fixed in #15:** the board is not drawn while its screen is hidden, using the same check as the 3D Viewer (60 frames/s before, 0 after, tested). The simulation pauses while hidden. The unused `animId` is removed._ | [three-viewer.js:957](../src/engines/three-viewer/index.js#L957), [simulator.js:938](../src/engines/simulator/index.js#L938) |
| D6 | ✅ | **Unsafe HTML in AI chat.** The user's typed text is put into the page as raw HTML (`escapeHtml` exists but isn't used here). Typing `<img src=x onerror=alert(1)>` would run code. Low risk today (no login or server), but a bad habit to fix now. _Since #11 the chat shows messages, so this really happens (confirmed in a scratch copy)._ _**Fixed in #13:** `formatMarkdown` escapes the text first, so typed HTML shows as text and never runs (tested). The chat was the only place typed text reached `innerHTML` (search never shows the query). `escapeHtml` now also escapes `"` and `'`, so it is safe inside attributes too._ | [app.js:1400](../src/app/app.js#L1400), [app.js:1674](../src/app/app.js#L1674), [app.js:1688](../src/app/app.js#L1688) |
| D7 | ✅ | Markdown formatter runs the `` `inline` `` rule before the ```` ```block``` ```` rule, so code blocks in AI answers come out broken. _Visible since #11: they show as small empty boxes._ _Measured in #13: all 7 code blocks in 4 answers became 14 empty boxes, and `#include <Wire.h>` lost `<Wire.h>`._ _**Fixed in #13:** code blocks are set aside before the other rules and put back last, so all 7 show with their exact code (tested). A CSS rule stops the inline-code box from appearing on every line inside a block._ | [app.js:1674](../src/app/app.js#L1674), [main.css:1985](../src/styles/main.css#L1985) |
| D8 | ⚪ | The 3D loader has cases for `nrf52840` and `bme280`, which aren't in the data. Parts that are in the data (`l298n`, `ams1117`, `nrf24l01`) all fall back to a plain 8-pin chip. _ESLint found more: 4 finished models (`buildArduinoUno`, `buildResistor`, `buildCapacitor`, `buildLED`) are never called, so they can never be shown._ | [three-viewer.js:739-770](../src/engines/three-viewer/index.js#L739-L770), [three-viewer.js:423](../src/engines/three-viewer/index.js#L423), [:553](../src/engines/three-viewer/index.js#L553), [:590](../src/engines/three-viewer/index.js#L590), [:628](../src/engines/three-viewer/index.js#L628) |
| D9 | ⚪ | The HTML has `onclick="window.location.hash='#simulator'"`, but the app has no URL/hash routing, so it does nothing. | [index.html](../index.html) |
| D10 | ✅ | `sortComponents(by)` ignores `by`, so the sort dropdown does nothing. _Found by ESLint._ _**Fixed in #10:** sorts by name, pin count or lowest voltage, and the dropdown keeps the choice (tested)._ | [app.js:1704](../src/app/app.js#L1704) |
| D11 | 🟡 | **Chip names are never drawn on the 3D chips.** `buildDIP` and `buildQFP` take a `label` (e.g. "ATmega328P") but never use it. _Found by ESLint._ | [three-viewer.js:295](../src/engines/three-viewer/index.js#L295), [three-viewer.js:368](../src/engines/three-viewer/index.js#L368) |
| D12 | ✅ | Simulator leftovers: `mmEnabled` is never read, so the multimeter on/off flag does nothing. `posNode` / `negNode` are worked out in `runSimulation` but never used. Check whether battery polarity is ignored. _Found by ESLint._ _**Confirmed in #14** (engine test): an LED lights with only the battery's + wired to it (no loop back to −), and also when it is reversed in a closed loop. Moved to its own branch (#14b), because it needs a new voltage solver._ _Measured in #14b with 6 test circuits: the LED lit in all 6, and a 1 kΩ resistor gave 40.7 mA (should be 6.93 mA), because the old solver only followed wires out of the + terminal, faked resistors as a "10% drop" and assumed 150 Ω for every LED._ _**Fixed in #14b:** a DC solver (nets + nodal analysis). LEDs and diodes conduct only forwards, capacitors block DC, and all 6 circuits match hand calculations (tested). The multimeter's current is the battery's current, and wires animate only when current flows. `mmEnabled` (never read) is removed. 6 lint warnings fewer (cap 24 → 18)._ | [simulator.js:818-931](../src/engines/simulator/index.js#L818-L931) |
| D13 | ✅ | **Explode destroyed the 3D model.** The target position was calculated from the saved position **before** it was saved (`undefined + 0.3 = NaN`), so the parts vanished and never came back. Toggling quickly also made two animations fight (parts bounced). _Found in #4._ **Fixed in #4:** save first (checking for `undefined`, since 0 is valid), and stop the previous animation before starting a new one. _Follow-up in #9: the explode and grow-in animations are now time-based, so they last ~320 ms / ~200 ms even when frames are slow._ | [three-viewer.js:920](../src/engines/three-viewer/index.js#L920) |
| D14 | 🟡 | The search popup footer shows **↑↓ Navigate** and **↵ Select**, but those keys do nothing (only Esc is handled). _Found in #4._ | [app.js:314](../src/app/app.js#L314) |
| D15 | ✅ | **The 3D Viewer is empty when the app first opens.** At startup the app asks for the model before the 3D engine is ready (the engine starts 300 ms later), and nothing asks again. The chip only appears after leaving and returning to the Viewer. The "Rendering 3D Model..." text also never hid. _Found in #4 (`getModelBounds()` returns `null` at first load)._ **Fixed in #4b:** a `showSelectedModel()` helper draws the part and hides the loading text. It's called when the Viewer opens **and** as soon as the engine is ready. | [app.js:651](../src/app/app.js#L651), [app.js:79](../src/app/app.js#L79) |
| D16 | 🟡 | **Each visit to the Viewer leaks graphics memory.** Every visit rebuilds the model, and the old one is removed with `scene.remove()` but never freed with `dispose()`. Measured: **2 → 297 geometries after 5 visits** (about 59 per visit). _Found in #4b._ | [three-viewer.js:733](../src/engines/three-viewer/index.js#L733) |
| D17 | 🟡 | **The AI suggestion chips ask things no stored answer covers.** "Reset Hookup" (RESET pin) gets the "be more specific" reply, "555 Astable Eq" gets the NE555 card without the timing equation, and "ESP32 5V Tolerance" gets the ESP32 overview, which doesn't mention 5V. Fix by writing 3 answers or changing the chips. _Found in #12._ | [index.html:495-497](../index.html#L495-L497), [data.js:827](../src/data/data.js#L827) |
| D18 | ⚪ | **AI replies show lists and tables as raw text.** The formatter only turns lines starting with "•" into a list, but the stored answers use "- " (43 lines, 0 list items). Tables (20 rows) show as raw `\|` pipes. Still readable. _Found in #13._ | [app.js:1674](../src/app/app.js#L1674) |
| D19 | ✅ | **Deleting a part (right-click) keeps one of its wires.** `onContextMenu` removes the part, then filters the wires using `components[i]`, which is now the *next* part. Measured: battery–LED–resistor with 2 wires, delete the LED → 1 wire left, still pointing at the deleted LED (should be 0). _Found in #14._ _**Fixed in #14b:** the removed part is kept and its wires are filtered by it (tested with a real right-click)._ | [simulator.js:768](../src/engines/simulator/index.js#L768) |
| D20 | ✅ | **The simulation clock counts frames, not real time.** Each frame adds 0.016 s × speed, so the clock runs slow when the browser draws slowly (for example in headless tests). Other engine animations are time-based. _Found in #14._ _Measured in #15: 0.51 simulated seconds per real second at 33 frames/s, about 0.3 under test load._ _**Fixed in #15:** the clock adds the real time since the last frame (at most 1 s), and so does the wire animation. Now 1.00× (3.03× at speed 3), and 0.96–0.99× under test load (tested)._ | [simulator.js:955](../src/engines/simulator/index.js#L955) |
| D21 | ✅ | **The oscilloscope shows made-up signals.** CH1 is a 5 V sine from a signal generator that isn't connected to the circuit, and it runs at 1 Hz while the label says "1.0kHz" (the time in seconds is divided by 1000). CH2 is just "3.3 V if any LED is on". The multimeter's Resistance mode also just adds up every resistor on the board, wired or not. The V/div and T/div dials (C7) can only make sense once the scope shows real circuit values. _Found in #14b._ _**Fixed in #14c:** CH1 is the battery's voltage and CH2 the voltage across the first LED, both from the solver (measured: 9.00 V, and 0 V → 2.07 V when a switch closes). Samples keep their simulation time and the screen shows the last 10 × T/div, 0 V on the centre line. The scope screen draws at its real size. Resistance mode shows the resistance the battery sees (V ÷ I), or OL when no current flows. The unused signal generator (`setSigGen`) is removed. Also fixed: a part added by drag and drop now runs the solver (found by the tests: the new scope label crashed on it)._ | [simulator.js:1056](../src/engines/simulator/index.js#L1056), [simulator.js:1140](../src/engines/simulator/index.js#L1140), [app.js:934](../src/app/app.js#L934) |

### E. Cleanup / project health

| # | Sev | Problem |
|---|---|---|
| E1 | ✅ | **Two versions of the app are mixed together.** `legacy/script.js` (old app) and `legacy/database.js` (old data) aren't used by the new app. `script.js` would also crash if loaded: it imports `ThreeViewer` / `CircuitSimulator`, which those files don't export. **Fixed in #6:** `legacy/` deleted, and the build output is byte-identical before and after. **Old data worth restoring later** (in a different format from `data.js`; restore with `git show 3cd518a:legacy/database.js`): resistor and capacitor entries (for D8's unused models), a description for every Arduino Uno pin, and datasheet electrical tables for 5 parts (Arduino Uno, ESP32, NE555, resistor, capacitor). The old wiring code is at `git show 3cd518a:legacy/script.js`. |
| E2 | 🟡 | `manifest.json` is linked in the HTML but doesn't exist (browser logs a syntax error). `favicon.ico` is missing (404). |
| E3 | ⚪ | CSS is loaded twice: `<link>` in [index.html:28](../index.html#L28) **and** `import` in [src/main.js](../src/main.js). |
| E4 | ⚪ | `assets/fonts`, `assets/models`, `assets/icons` are empty folders. |
| E5 | ⚪ | The notifications panel shows fake hardcoded messages ("Just now", "3 mins ago"). |
| E6 | 🟡 | `npm audit`: 3 known security issues in dev tools — `nanoid` (high), `postcss` (high), `esbuild`/`vite 5.4.21` (moderate). These only affect the dev machine, not visitors. |
| E7 | 🟡 | Three.js **r128** (from 2021) is loaded from a CDN. It's old, and the app needs the internet to work. |
| E8 | ✅ | No git, no README, no linter, no tests. _Fixed: git, README, smoke tests (`npm run test:smoke`) and ESLint (`npm run lint`) added._ |
| E9 | ⚪ | `dist/` is a build of the broken code. Rebuild it after fixing. |
| E10 | ⚪ | **GSAP and ScrollTrigger are downloaded on every page load but never used** by any code. That's wasted network and load time. _Found while setting up ESLint._ |
| E11 | ⚪ | **27 lint warnings** (25 after #4, 24 after #10, 18 after #14b, 17 after #15) (unused code, an empty `catch`, `const` in `switch` cases), capped with `--max-warnings` (currently 17). Most are symptoms of D5, D8, D10–D12. Each fix branch clears its own warnings and lowers the cap. |
| E12 | ⚪ | **Unused Simulator CSS in `main.css`.** Rules for IDs that don't exist in the page (`#sim-toolbar`, `#sim-palette`, `#sim-canvas-area`, `#sim-instruments`, `#sim-osc-panel`, `#osc-main-canvas`) and classes nothing uses (`.sim-status-dot`, `.palette-section-title`, `.sim-canvas-hint`…). Harmless; the working styles are in `src/styles/views/simulator.css` since #14. _Found in #14._ |

### F. Page layout and CSS don't match

_Found in branch #3 by comparing the class and ID names in `index.html`, the CSS and the HTML that `app.js` generates._

| # | Sev | Problem | Evidence |
|---|---|---|---|
| F1 | ✅ | **`app.js` and the CSS were written together for a page layout that isn't in this project.** Most of `index.html`'s own markup has no styling. This explains the B bugs (missing IDs), the unstyled 3D Viewer and Board Explorer (browser-default buttons, a tiny 3D box), and the "Rendering 3D Model..." text that never goes away. **Decided in [ADR 0002](decisions/0002-screen-markup.md):** the Viewer and Database switch to the new layout, the Dashboard is added as the home screen, and the other screens keep the current page (F2–F6). | HTML generated by `app.js`: **126 of 143** classes have CSS rules (88%). HTML written in `index.html`: **38 of 217** (18%). CSS ID rules: **21 of 34** target IDs that don't exist in `index.html` (`#viewer-sidebar`, `#viewer-canvas-area`, `#sim-toolbar`, `#ai-input`…). |
| F2 | ✅ | **Shared building blocks are unstyled on every current-page screen:** `glass-panel` (22 uses), `panel`, `panel-header`, `panel-title`, `view-title`, `view-subtitle` and the shared buttons have no CSS. The sidebar and top-bar buttons also showed the browser's default grey (`rgb(239, 239, 239)`), because `.nav-item` and `.icon-btn` never set a background on `<button>` elements. **Fixed in #7:** new `src/styles/components/panels.css` (design tokens only, matching the Dashboard cards). Screen-specific styling stays with F3–F6. | [ADR 0002](decisions/0002-screen-markup.md) measurements, `tests/smoke/styles.spec.js` |
| F3 | ✅ | **Simulator layout is broken:** it's stacked and unstyled, and the breadboard canvas isn't visible. The CSS styles `#sim-toolbar`, `#sim-palette`, `#sim-canvas-area` and `#sim-instruments` as **IDs**, while the page uses those names as **classes**. Only 7 of the CSS's 26 simulator classes appear in the page. _Measured in #14: `#view-simulator` was a 3×3 grid with one child, so everything sat in its 160 px first column (board 160×112, screen scrolled). The board also took its drawing size from its parent, so drawings were squashed._ _**Fixed in #14:** new `src/styles/views/simulator.css` styles the page's own classes (toolbar, palette, board, instruments, status bar), the two blocking grid rules are removed, and the board draws at its own size (726×558 at 1280×720; tested, also after a resize)._ | [screenshot](images/f1-simulator-current.png), [simulator.css](../src/styles/views/simulator.css) |
| F4 | 🟡 | **Board Explorer unstyled.** The page and the JS draw the board on a canvas, but the CSS describes an element-based board (`board-visual`, `board-pin-dot`…). The page's classes (`board-tab`, `pin-filter-btn`, `board-info-panel`…) have no CSS. | 3 of 23 page classes styled |
| F5 | 🟡 | **Datasheet sidebar unstyled** (`ds-list`, `ds-search`, `toc-btn`…). The content area is already styled by the JS. | 4 of 22 page classes styled |
| F6 | ✅ | **AI message classes don't match the CSS:** the JS generates `ai-msg-avatar` / `ai-msg-content` / `ai-msg-time`, and the CSS styles `ai-message-avatar` / `-content` / `-time`. The suggestion buttons are unstyled. _**Fixed in #11:** the JS uses the CSS names and its structure (`.ai-message-body` holds the bubble and the time). The chips and the page's welcome bubble (`.chat-bubble`) share the existing rules (tested with computed styles)._ | 1 of 5 JS classes styled |
| F7 | ✅ | **AI screen layout was written for a different page.** `#view-ai` had `grid-template-rows: 1fr auto auto` (three rows the page doesn't have) and `padding: 0 !important`. Once messages showed, the chat grew instead of scrolling: after 3 questions the input was at y=1154 on a 720 px screen. The title and chips also touched the sidebar (0 px padding, other screens 20 px). _Found and fixed in #11:_ `grid-template-rows: minmax(0, 1fr)` and no padding override (tested). | [main.css:1912](../src/styles/main.css#L1912) |
| F8 | ⚪ | **AI screen markup has inline styles with hard-coded colours** (`#222`, `#07070a`, `#0c0c14`, `#fff`), which override the CSS and ignore the design tokens. The input also shows the browser's white focus outline. _Found in #11._ | [index.html:483-517](../index.html#L483-L517) |

### Future ideas (not bugs)

Features of the old 3D Viewer that the new layout doesn't have ([ADR 0002](decisions/0002-screen-markup.md)). Re-add them only if wanted:
- pin legend (colour key for pin types)
- "example usage" code for the selected pin
- info overlay on the 3D view (component, package, pins, voltage)
- DIP / SMD / QFP / BGA package buttons (never worked)
- screenshot button

Simulator (found in #14b):
- warn when an LED gets too much current (for example over 30 mA). Today an LED straight across the 9 V battery shows 667 mA and simply lights.
- an "Import" button that opens a file saved with Export (the engine's `loadCircuit()` can already read it).
- probe a part: click a part to show its voltage on the oscilloscope and its voltage, current or resistance on the multimeter (today CH1 is the battery, CH2 the first LED, and the multimeter reads the whole circuit).

AI assistant (found in #12):
- short names for parts: the AI finds a part only by its full name or ID, so "stm32", "blue pill", "555" or "esp32" (for the ESP32-WROOM-32 card) aren't recognised. This needs a list of extra names for each part in `data.js`.

---

## Part 2 — The fix plan (step by step)

Do the phases **in order**. Each phase ends with a check, so you always know it worked before moving on.

### Phase 0 — Folder structure ✅ DONE

- Project restructured into `src/`, `docs/`, `public/`, `tests/`, `scripts/`, `legacy/` (files moved, code unchanged). See [decisions/0001-folder-structure.md](decisions/0001-folder-structure.md).

### Phase 1 — Stop the crashes (30 min) → fixes A1–A8

1. ✅ **Load the data file** (branch #3). In [src/main.js](../src/main.js), add this line **before** `three-viewer.js` and `app.js`:
   ```js
   import './data/data.js';
   ```
2. ~~Guard against "nothing selected"~~. **Not needed:** fixing A1 removes A2. See A2 above.
3. ✅ **Fix the keyboard map** (branch #4). Keys follow the sidebar order, so they update when screens are added. After #8:
   `1 dashboard · 2 viewer · 3 simulator · 4 database · 5 boards · 6 datasheet · 7 ai · 8 projects · 9 settings`.

✅ **Check:** run `npm run dev`, open the browser console (F12), and click every menu item. There should be **zero red errors**, and a 3D chip should appear in the viewer.

### Phase 2 — Pick one version and delete the other (30 min) → fixes E1 ✅ DONE (#6)

Keep the **new** code (`app.js` + `data.js`). It is bigger and has the 3D models, AI answers, datasheets and projects.

1. ~~Copy anything useful from `legacy/database.js` into `src/data/data.js` first.~~ **Changed (ADR 0002 analysis):** the old data uses a different format, and adding the resistor and capacitor now would show them as an 8-pin chip until D8 is fixed. So they're listed under E1 instead, and restored from git in the branch that needs them.
2. ✅ Delete the `legacy/` folder, and its entry in `eslint.config.js`. (The `database.js` import was already removed from `src/main.js` during the restructure.)

✅ **Check:** the app still runs with no errors, and `grep -r "ComponentDatabase\|appState" src/` returns nothing.

### Phase 3 — Reconnect the page to the code (2–4 hours) → fixes B1–B9, C1–C6

**Rule ([ADR 0002](decisions/0002-screen-markup.md)):** follow the per-screen table. The Viewer, Database (→ Component Library) and Dashboard use the markup the JS and CSS expect. All other screens keep `index.html`, and the JS and CSS adapt to it.

> **Replaced by ADR 0002:** steps 2–3 (Viewer: use the new layout instead of rewiring the old panel), step 5 (Database: use the Component Library instead of writing `renderDatabase()`), and step 9 (Dashboard: added as the home screen). Steps 1, 4, 6, 7 and 8 still apply. The styling work is F2–F6.

1. **Rename IDs in the JS** using table B:
   - ✅ `ai-chat-area → ai-chat-messages`, `ai-input → ai-user-query`, `ai-send → ai-send-btn` (#11)
   - ✅ `mm-value → multimeter-val`, `mm-unit → multimeter-unit`, `mm-mode-select → mm-mode` (#14)
   - `pin-detail-panel → pin-info-panel`
2. **Rewrite `renderViewerSidebar` / `renderPinTable`** so they fill the elements that exist:
   - Part list → `#component-list` (one row per `CircuitLabData.components`, click → `selectComponent(id)`)
   - Filter → `#component-filter` + the `.cat-btn` buttons → `setFilter(cat)`
   - Pin details → `#pin-number-badge`, `#pin-name-display`, `#pin-type-badge`, `#pin-voltage`, `#pin-current`, `#pin-protocol`, `#pin-direction`, `#pin-alt`, `#pin-example-code`
   - HUD → `#hud-component`, `#hud-package`, `#hud-pins`
3. **Hook up the 3D toolbar** (in `initViewerPanel`, once):
   `btn-rotate → ThreeViewer.setAutoRotate`, `btn-wireframe → setViewMode('wireframe')`, `btn-explode → setViewMode('explode')`, `btn-reset-cam → ThreeViewer.resetView`, `btn-pins` → show/hide `#pin-labels-layer`, `btn-screenshot` → `renderer.domElement.toDataURL()` + download.
4. ✅ **Hook up the simulator toolbar** (once, see Phase 4.3; done in #14):
   `sim-run → CircuitSimulator.startSim`, `sim-pause/sim-stop → stopSim`, `sim-clear → resetSim`, `sim-export → exportCircuit`, `sim-speed → setSimSpeed(value)`, `ws-add-resistor/led/capacitor/ic/wire → addComponentToCanvas(type)`.
5. **Database screen:** write `renderDatabase()` that fills `#db-components-grid` using the existing `renderComponentCard()`. Connect `#compare-mode-btn` / `#close-matrix-btn` to the existing `toggleCompare` / `clearCompare`, and fill `#comparison-table-body`.
6. **Projects:** point `renderProjects` at `#projects-grid` and `#create-project-btn → newProject()`.
7. **Settings:** `theme-btn-toggle` and `theme-toggle` toggle a `light` class on `<body>`. Save the choice in `localStorage`.
8. **Top bar:** the notification bell opens and closes `#notif-drawer`, `#clear-notifs` empties it, and `?` opens `#shortcuts-modal`.
9. **Delete the dead code paths** for `dashboard` and `components` in `navigateTo`, or add those screens to the HTML (decide one).

✅ **Check:** click every button on every screen. Each one should visibly do something, and there should be no console errors.

### Phase 4 — Fix the logic bugs (1–2 hours) → fixes D1–D9

1. ✅ **AI matcher (D1, #12):** replace the first/second-word check with keyword lists per answer, and pick the answer with the most keyword hits:
   ```js
   const topics = [
     { keys: ['resistor', 'ohm', 'led'], answer: 'What resistor do I need for an LED at 5V?' },
     { keys: ['i2c', 'sda', 'scl'],      answer: 'How do I wire an I2C sensor to Arduino?' },
     // ...
   ];
   ```
   Check specific part names **before** generic topics.
2. ✅ **Safe chat HTML (D6, D7, #13):** run `escapeHtml(text)` first, then `formatMarkdown`. Move the ```` ``` ```` block rule **above** the single-backtick rule.
3. **Initialize once (D3):** add an `initialized` flag in `CircuitSimulator.init` (and the toolbar wiring) so it only runs the first time.
4. **One background (D4):** keep either `circuit-bg.js` or `initBackground()` in `app.js`, not both.
5. **Pause hidden loops (D5):** in `navigateTo`, pause the 3D/simulator loops when leaving their screen, and resume when you come back.
6. **3D model cases (D8):** make the `switch` in `loadComponent` match the real IDs in `data.js`.
7. **Hash routing (D9):** add a `hashchange` listener that calls `navigateTo(location.hash.slice(1))`, and set the hash inside `navigateTo`. Page refresh and the back button then work too.

✅ **Check:** ask the AI "how does an esp32 work" and get the ESP32 answer. Visit the simulator 5 times, then click once and get exactly 1 part.

### Phase 5 — Cleanup & dependencies (1 hour) → fixes E2–E7, E9

1. Remove the `<link rel="stylesheet" href="/src/styles/main.css">` from `index.html` (Vite already loads it through `main.js`).
2. Either add a real `manifest.json` + `favicon` or remove the `<link rel="manifest">` line.
3. Delete the empty `assets/` folders, or put the real fonts and icons there.
4. Replace the fake notifications with real ones pushed from `showToast()`.
5. Run `npm audit fix` (safe, fixes `nanoid` + `postcss`). Plan a separate upgrade to Vite 6+ later, since it's a breaking change.
6. Optional: install Three.js with `npm i three` and `import * as THREE from 'three'` instead of the r128 CDN script, so the app works offline.
7. Run `npm run build` to regenerate `dist/`.

✅ **Check:** `npm audit` shows 0 high issues, `npm run build` succeeds, and `npm run preview` works.

### Phase 6 — Make it professional (half a day) → fixes E8

1. **README.md**: what the app is, how to run it, the folder map, screenshots.
2. ✅ **Linter**: ESLint 10 with the recommended rules (`npm run lint`). New mistakes are errors; the 27 known leftovers are capped warnings (E11). _Correction:_ ESLint **can't** catch A1-type bugs while files share names through `window`, because it can't tell a loaded file from a forgotten one. The smoke tests catch them at runtime, and moving to real `import`/`export` (the `refactor/split-*` branches) will make them build errors. Prettier is postponed until after the refactor, so it doesn't cause merge conflicts in every fix branch.
3. ✅ **Smoke test**: Playwright tests that open every screen, search, send an AI message and press shortcuts, and **fail if any error appears**. Run with `npm run test:smoke`. Known bugs are tracked as expected failures.
4. **Version control:** one branch per issue, merged through Pull Requests. See [GIT_WORKFLOW.md](GIT_WORKFLOW.md) for the full branch plan.

### Phase 7 — Optional upgrades

- **Real AI answers:** call the Claude API from a small backend (for example a Node/Express or serverless function). **Never put an API key in browser JavaScript.**
- **Save projects properly:** `loadProjects()` reads `localStorage`, but nothing ever saves to it. Add a save call.
- **Move to real ES modules:** replace `window.X = (function(){...})()` with `export` / `import`. This makes mistakes like A1 impossible.

---

## Time estimate

| Phase | Effort | Result |
|---|---|---|
| 0 | 10 min | Can undo anything |
| 1 | 30 min | **No more crashes** |
| 2 | 30 min | One clean codebase |
| 3 | 2–4 h | **Every button works** |
| 4 | 1–2 h | Correct behaviour |
| 5 | 1 h | Clean + secure deps |
| 6 | ½ day | Professional project |

See [LEARNING_GUIDE.md](LEARNING_GUIDE.md) for a plain-English explanation of how the code works.
