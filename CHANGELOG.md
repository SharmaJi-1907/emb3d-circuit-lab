# Changelog

All notable changes to this project are listed here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed
- Restructured the project into a professional folder layout (`src/`, `docs/`, `public/`, `tests/`, `scripts/`). Files were moved without changing their code. See [docs/decisions/0001-folder-structure.md](docs/decisions/0001-folder-structure.md).
- Moved `js/script.js` and `js/database.js` (unused old code) to `legacy/` for review.
- Lint warning cap lowered from 27 to 25, then to 24, then to 18, then to 17, then to 15.
- 3D explode and grow-in animations are time-based (~320 ms / ~200 ms), so slow frames no longer stretch them.
- The 3D canvas sizes itself from its container and is resized whenever the Viewer is shown.
- Branch plan reorganised to follow ADR 0002. The three Viewer branches merge into one, the Database branch becomes small, and the Dashboard, shared-styles and per-screen styling branches are added.

### Added
- `public/manifest.json` and `public/favicon.svg` (E2), so the page no longer 404s for either. New `tests/smoke/assets.spec.js` with 8 tests (151 tests in total).
- `README.md`, `CHANGELOG.md`, `.editorconfig`, expanded `.gitignore`.
- `docs/` with an index, architecture, contributing guide and decision records.
- `docs/GIT_WORKFLOW.md`: branch-per-issue workflow, commit format and branch plan.
- `CLAUDE.md`: working rules for the AI coding assistant.
- `.github/pull_request_template.md`: PR checklist.
- Playwright smoke tests (`npm run test:smoke`): 12 tests covering app start, all 8 screens, search, AI chat and number-key shortcuts. They fail on any page error, and known bugs are tracked as expected failures.
- ESLint 10 (`npm run lint`) with the recommended rules. New mistakes are errors; the 27 known leftovers are warnings capped with `--max-warnings`. `npm test` now runs lint and smoke tests together.
- Smoke tests: "component data is loaded" and "AI answer engine replies without errors" (14 tests in total).
- `tests/smoke/keyboard.spec.js`: 9 tests covering every keyboard shortcut and the 3D explode fix (22 tests in total).
- Smoke tests: "3D viewer shows a model at first load" and "loading text is hidden once the model is shown" (24 tests in total).
- 3D viewer: read-only `isWireframe()`, `isExploded()` and `getModelBounds()`.
- [ADR 0002](docs/decisions/0002-screen-markup.md): which page markup each screen uses. Includes per-screen measurements and prototype screenshots in `docs/images/`.
- `src/styles/components/panels.css`: shared styles for cards, panels, titles and icon buttons (F2).
- `tests/smoke/styles.spec.js`: 5 computed-style tests for the shared building blocks (29 tests in total).
- `tests/smoke/viewer.spec.js`: 9 tests for the new 3D Viewer layout (38 tests in total). 3D viewer: read-only `getFrameCount()`.
- **Dashboard home screen** (ADR 0002): stats, quick access, recently viewed parts and sample projects. It's the first sidebar item and the screen the app opens on; the number keys are now `1–9`. Plus 2 new dashboard tests (41 tests in total).
- `tests/smoke/database.spec.js`: 6 tests for the Component Library in the Database screen (47 tests in total).
- `tests/smoke/ai.spec.js`: 9 tests for the AI chat: sending by arrow icon, Enter, chips and the Datasheet's "Ask AI", the welcome message, layout and styles (56 tests in total). `knownBug()` and `styleOf()` moved to `tests/smoke/helpers.js`, so every spec file can use them.
- `tests/smoke/ai.spec.js`: 5 tests for which answer the AI picks (61 tests in total). App: read-only `CircuitApp.getAIResponse()`, so tests can check answers without waiting for the reply timer.
- `tests/smoke/ai.spec.js`: 4 tests for safe chat text and code blocks (65 tests in total).
- `tests/smoke/simulator.spec.js`: 10 tests for the Simulator layout, controls and multimeter (75 tests in total). Simulator: read-only `CircuitSimulator.getState()`.
- `src/styles/views/simulator.css`: the first per-screen stylesheet (F3).
- `src/styles/views/boards.css` (F4) and `tests/smoke/boards.spec.js`: 3 tests for the Board Explorer layout (94 tests in total).
- `tests/smoke/boards.spec.js`: 4 tests for the Board Explorer's behaviour (98 tests in total).
- Board Explorer: 4 new boards with pinouts from official sources (Arduino Mega 2560 Rev3, NodeMCU 1.0 / ESP8266, Raspberry Pi Pico, STM32 Nucleo-F401RE) and an "STM32 Blue Pill" tab (8 tabs). Plus 3 tests for the board data (101 tests in total).
- `src/styles/views/datasheet.css` (F5) and `tests/smoke/datasheet.spec.js`: 5 tests for the Datasheet sidebar, section bar and layout (106 tests in total).
- `src/styles/views/ai.css` (F8) and 4 tests in `tests/smoke/ai.spec.js` for the AI screen's styles and layout (110 tests in total).
- Datasheet Viewer: a working search box, a **Pinout** section built from the part's own pin list, and a 7th **Package** button for package sizes. Plus 5 tests in `tests/smoke/datasheet.spec.js` (115 tests in total).
- 4 tests in `tests/smoke/ai.spec.js` for lists and tables in AI replies (122 tests in total).
- `src/styles/components/notifications.css` (C6) and `tests/smoke/topbar.spec.js`: 7 tests for the notifications drawer and the search pop-up's arrow keys (143 tests in total).
- A light theme (C5). Both theme buttons switch between light and dark, the Settings button says what it will do, and the choice is kept in the browser. New `tests/smoke/theme.spec.js` with 7 tests (136 tests in total).
- Projects: make your own project, open it in the Simulator and delete it; they are kept in the browser. New `src/styles/views/projects.css` and `tests/smoke/projects.spec.js` with 7 tests (129 tests in total).
- Three new AI answers for the suggestion chips — the RESET pin, the NE555 astable timing equations, and ESP32 5 V tolerance — each checked against the manufacturer's datasheet. Plus 3 tests in `tests/smoke/ai.spec.js` (118 tests in total).
- A Battery button in the Simulator palette, so a circuit has a power source.
- `tests/smoke/simulator.spec.js`: 7 tests for the circuit logic (82 tests in total). Simulator: `loadCircuit()` reads the JSON that Export writes (Export now includes each part's `id`); `getState()` also returns each part's readings.
- `tests/smoke/simulator.spec.js`: 5 tests for the oscilloscope and the multimeter's resistance (87 tests in total). Simulator: `setScope()` for the oscilloscope settings.
- `tests/smoke/simulator.spec.js`: 4 tests for the Simulator's setup and drawing loop (91 tests in total). Simulator: read-only `getFrameCount()`.

### Removed
- GSAP and ScrollTrigger, downloaded on every page load and used by nothing (E10). FontAwesome went too — a whole CDN stylesheet for one glyph, the robot in the AI header, now a 🤖 character. Three CDN requests gone from every page load.
- 29 dead CSS rules from `main.css` (E12): 2267 → 2072 lines, built CSS 54.76 kB → 52.97 kB. Every selector was checked against the live app first; all 22 matched nothing on any of the 9 screens.
- The duplicate `<link rel="stylesheet">` for `main.css` (E3) — `src/main.js` already imports it.
- The empty `public/icons` folder (E4).
- The Simulator's unused signal generator and its `setSigGen()` function (nothing called it; it only fed the made-up oscilloscope sine).
- `legacy/` (the old, never-loaded `script.js` and `database.js`) and its lint ignore rule (E1). The built app is byte-identical before and after. Old data worth reusing is listed under E1 in [docs/FIX_PLAN.md](docs/FIX_PLAN.md).

### Changed
- 12 hard-coded dark surfaces in `main.css` became design tokens (`--bg-panel`, `--bg-panel-soft`, `--bg-overlay`, `--glass`, `--bg-code`), so they follow the theme. The 16 `<kbd>` keys in Settings and the shortcuts pop-up lost their inline `background:#222` and are styled in `panels.css` instead — in light mode they had been black boxes with invisible text.
- The smoke-test timeout is back to 30 s. It was raised to 60 s in #18 as a stop-gap after 4 tests timed out with no assertion failing. Only the 3D tests wait for the 3D engine now (E15), and 572 slots pass clean at 30 s where 516 failed 4 at 30 s before.
- Smoke tests: `openApp()` waits only for the app, not the 3D engine. `waitForViewer()` and `openViewer()` wait for it where it is actually needed. **This did not speed the suite up** — 160.9 s to 158.2 s, which is noise; the #18 note claiming the waiting was the real cost was wrong and is corrected in FIX_PLAN. It is kept because a screen with no 3D should not fail when WebGL is slow.

### Fixed
- The notifications feed says something real (E5). It used to show invented messages with "3 mins ago" timestamps; it now reports the actual component, board, datasheet and project counts, timestamped when the app started.
- A hiccup at the font CDN no longer fails a random smoke test (E14). It is the one entry in the known-noise list, and a test blocks both font hosts to prove the app still starts clean without them.
- The notifications drawer works (C6). The bell used to show a "No new notifications" toast while the drawer markup sat unused, and the unread dot on the bell had no CSS at all (0 px wide and transparent). The bell now opens and closes the drawer, Esc and a click elsewhere close it, and "Clear All" empties the list and hides the dot. Its inline styles moved to CSS with design tokens, so it follows the light theme.
- The search pop-up's ↑↓ and ↵ keys work (D14). The footer had promised them since the start. ↑↓ move a highlight through the results and wrap at both ends, ↵ opens the highlighted part, and a new search starts at the top.
- The theme buttons work (C5). The Settings "Toggle Dark Mode" button and the top-bar button did nothing; `state.theme` existed but nothing read it. The 3D viewport, the simulated multimeter display and code blocks stay dark on purpose in both themes.
- The Projects screen's "New Project" button works (C4). It used to show "Project creation coming soon!". It now opens a form to name the project (Enter creates, Esc cancels); the project joins the grid, survives a reload, opens the Simulator and can be deleted. A blank name is refused, and the name is escaped so typed HTML shows as text. The grid and "Open →" already worked — only the button was dead.
- AI replies show lists and tables properly (D18). Before, all 45 "- " lines and 34 table rows across the 9 stored answers came out as raw text — the formatter only handled "•", which no answer uses. A run of "- " lines now becomes a list, and a `|---|` separator turns the rows around it into a table, styled with the design tokens. Lists and tables are set aside before the other rules, the same way code blocks are, so they can't swallow the headings between them.
- All three AI suggestion chips now get a real answer (D17). Before: "Reset Hookup" got the "be more specific" reply, "555 Astable Eq" got the NE555 spec card with no equation, and "ESP32 5V Tolerance" got an ESP32 overview that never mentions 5 V. The answer matcher also learned that a question about a topic beats the part card when it names a part — so asking for the NE555 timing equation gives the equation, while "tell me about the NE555" still gives the card.
- The Board Explorer's board is drawn at the full new size after the window changes size (D27). The resize handler measured the board while the event was still firing, so it could catch the old box and leave the drawing 1 px short (682×458 in a 682×459 board); it now waits one frame and rounds instead of truncating. Measured: the resize test failed 3 times in 60 runs before, 0 in 60 after.
- The Datasheet search box works (C8). Typing filters the list by name or maker, ignoring case; no match shows "No datasheet matches …". It is wired on the first visit only, so repeat visits don't pile up handlers.
- Every Datasheet section button shows real content (D26). "Pinout" used to show the placeholder "Section content under catalog index division."; it now lists the part's own pins (28 for the ATmega328P, 38 for the ESP32-WROOM-32) with name, alt name, type, voltage and alt functions. The stored `package` data was unreachable — a new **Package** button shows it (DIP-28, TQFP-32, MLF-32 and their sizes). No new component data was invented; both sections reuse data the app already had.
- The AI screen uses the design tokens instead of inline styles (F8). 12 elements carried 14 inline `style` rules with hard-coded colours (`#07070a` chat box, `#222` borders, `#0c0c14` input, `#fff` text); they now live in `src/styles/views/ai.css`. The input's white browser focus ring is replaced by a cyan border, and the title uses the shared 22 px like every other screen. The markup, classes and IDs are unchanged, and the page is 790 bytes smaller.
- The Datasheet Viewer's sidebar and section bar are styled (F5), and the screen is no longer cut off. Before: the search box was a plain white browser input with black Arial text, the 6 section buttons were browser grey and the selected one looked exactly like the rest, and list rows had no padding, no hover and no pointer. The bottom 204 px of the screen was also clipped, because both columns grew to 832 px (1318 px on Examples) inside a 628 px layout; the content area now scrolls instead.
- A flaky smoke test (E13). The Board Explorer's "does not repeat pin clicks" test counted every toast before the click and expected one more, but toasts delete themselves after 3.3 s, so under load an old toast expired as the new one appeared. It now counts only the toast that click makes. Measured: 1 failure in 12 runs before, 12 of 12 green after, and it still catches D22.
- Every Board Explorer tab shows its own board (D24). The Mega, ESP8266 and Pico tabs used to show the Uno, the ESP32 and the Pi 4, and "STM32 Nucleo" showed a Blue Pill.
- Board Explorer behaviour (D22, D23, D25): a pin click shows one toast however often you visit (before: one per visit), the board redraws at the right size when the window is resized, a clicked pin is highlighted in the list, and the Board Explorer's selected pin no longer changes the 3D Viewer's or carries over to another board.
- The Board Explorer is styled (F4): the board sits beside the info panel and is drawn whole (862×529 instead of 174 px tall and cut off), it no longer grows when a filter is clicked, and the board tabs, pin filters, zoom buttons, specs and pin list are styled with the design tokens.
- The Simulator is set up once instead of on every visit (D3), draws nothing while its screen is hidden (D5), and its clock follows real time instead of counting frames (D20). Before: 3 visits started 3 drawing loops and a clock running 3× too fast, and the hidden screen was drawn 60 times a second. The board sizes itself when its screen is shown, so a window resize while it was hidden is handled.
- The Simulator's instruments show real values (D21, C7). The oscilloscope shows the battery's voltage (CH1) and the first LED's voltage (CH2) over time, instead of a made-up sine; its ON button and V/div and T/div dials work; its screen draws at its real size. The multimeter's Resistance mode shows the resistance the battery sees, or OL when no current flows, instead of adding up every resistor on the board. A part added by drag and drop now updates the circuit.
- Simulator circuits give correct results (D12). A new DC solver (nets + nodal analysis): an LED lights only in a closed loop back to the battery and only the right way round, a capacitor blocks DC, and currents follow Ohm's law (9 V, 1 kΩ, LED = 6.93 mA; before: 40.7 mA, and the LED lit in every circuit). The multimeter's current is the battery's current, wires animate only when current flows, and the status bar shows the number of nodes. Deleting a part removes all its wires (D19).
- The Circuit Simulator is usable (F3, C2, B9). The board fills the middle of the screen (726×558 instead of 160×112) between the palette and the instruments, and draws at its real size. Every toolbar and palette control works: Run, Pause, Stop (and Space), Speed, Clear, Export, adding parts by click or drag. Wire, NE555 IC and Upload Code explain themselves. The status bar shows the state and time, and the multimeter shows readings.
- Typed HTML in the AI chat shows as text and never runs (D6). Code blocks in AI replies show as one block with the exact code (D7). Before, all 7 stored code blocks became empty boxes and `#include <Wire.h>` lost `<Wire.h>`. `escapeHtml` also escapes quotes now.
- The AI picks the right stored answer (D1). It used to match only the first or second word of each stored question, so "how does an esp32 work" got the I2C guide. Now a named part gets its card first ("MPU-6050", "mpu6050" and "mpu 6050" all work), then the answer with the most keyword hits wins, and unrelated questions get the "be more specific" reply. 59 of 60 test questions right, up from 19 of 34.
- The AI Assistant chat works (B1–B3). The Send button (including its arrow icon), Enter, the suggestion chips and the Datasheet's "Ask AI" button show the question and the reply, and the welcome message stays. The leftover page-wide Send/Enter listeners are removed. Messages, the welcome message and the chips are styled (F6). The chat scrolls inside its box so the input stays on screen, and the screen has the same side padding as the others (F7).
- The Database screen shows the Component Library (ADR 0002): category filter, compare mode, part cards with "View 3D" (C3, B8). Sorting by name, pin count or voltage now works, and the dropdown keeps the choice (D10).
- 3D Viewer uses the new layout (ADR 0002). It shows the part info and specs, working controls (part switcher, Solid/Wire/Explode, auto-rotate, zoom), the full pin table, pin details with a signal view and a pin tooltip, and a canvas that fills its area (B4–B7, C1).
- The 3D scene is no longer drawn while its screen is hidden (D5, 3D part).
- Sidebar and top-bar buttons no longer show the browser's grey button background. Cards, panels, panel titles and screen titles are styled on Settings, Datasheet, Simulator, AI, Boards, Projects and the shortcuts popup (F2).
- The component data (`src/data/data.js`) is now loaded, so the 3D Viewer, Board Explorer, Datasheet Viewer, Projects, Search and the AI answer engine no longer crash (A1–A8). No screen throws an error any more.
- Keyboard shortcuts (D2):
  - `1–8` open the screens in sidebar order
  - `W` / `E` / `R` toggle wireframe, toggle explode and reset the camera in the 3D Viewer
  - `Space` runs or pauses the simulation
  - `?` shows the shortcuts list
  - Ctrl/⌘+K and `/` open search
  - shortcuts are ignored while typing, with Ctrl/⌘/Alt, and on key auto-repeat
  - both shortcut lists show every key
- Exploding the 3D model no longer makes it vanish, and quick toggling no longer makes the parts bounce (D13).
- The 3D Viewer shows the part as soon as the app opens (it used to stay empty until you reopened it), and the "Rendering 3D Model..." text now hides once the part is drawn (D15).
### Found
- New issues from linting: D8 (4 unused 3D models), D10 (sort ignores its option), D11 (chip labels never drawn), D12 (unused simulator values), E10 (GSAP loaded but unused), E11 (lint warning cap).
- F1: most of `index.html` has no matching CSS. The CSS and `app.js` were written for a different page layout. Decided in ADR 0002.
- F2–F6: per-screen styling gaps (shared panels, simulator layout, board explorer, datasheet sidebar, AI message classes).
- D14: search popup ↑↓/↵ keys do nothing. D15: the 3D Viewer is empty when the app first opens (fixed in #4b).
- D16: each visit to the 3D Viewer leaks graphics memory (old models are never freed).
- F7: once messages show, the AI chat grows past the screen and the screen has no side padding (fixed in #11). F8: the AI screen's markup has inline styles with hard-coded colours. D6 can now be triggered, because chat messages are shown since #11.
- D17: the AI suggestion chips ask things no stored answer covers (RESET pin, NE555 timing equation, ESP32 5V tolerance). Short part names ("stm32", "555") aren't recognised; listed under Future ideas.
- D18: AI replies show "- " lists and tables as raw text.
- D12 confirmed: an LED lights without a loop back to the battery, or when reversed (moved to #14b). D19: deleting a part keeps one of its wires. C7: the oscilloscope controls and the node count do nothing. D20: the simulation clock counts frames, not real time. E12: unused Simulator CSS in `main.css`.
- D21: the oscilloscope shows made-up signals (CH1 is not connected to the circuit and runs at 1 Hz while labelled 1 kHz), and the multimeter's Resistance mode adds up every resistor on the board.
- D22: the Board Explorer adds its canvas click handlers again on every visit (3 visits → 3 toasts per pin click). D23: a clicked board pin isn't highlighted in the list. D24: 3 of the 7 board tabs show a different board (real data planned in #16c). D25: the Board Explorer and the 3D Viewer shared one selected pin (fixed in #16b).
- E14: a hiccup loading the Google Fonts CDN fails whichever smoke test is running, because the fixture fails on any `console.error`. Seen once as `ERR_CERT_VERIFIER_CHANGED`. Planned for #25.
- C8: the Datasheet search box does nothing — no JS references it. D26: the Datasheet "Pinout" section has no data and shows a placeholder, while a `package` section has data but no button. Both planned for #17c. E12 also covers the unused Datasheet CSS in `main.css`.
