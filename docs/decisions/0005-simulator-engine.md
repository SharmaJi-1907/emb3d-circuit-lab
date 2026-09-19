# 0005 — Simulator engine: our own time-step solver in the browser

- **Status:** Accepted (2026-09-19)
- **Date:** 2026-09-18

## Context

Today's simulator solves DC only (a steady state). The oscilloscope shows flat lines, capacitors never charge, and the meters read fixed points. To be a real tool it needs to show how a circuit changes over time, have probes the user places, a breadboard, and later a microcontroller running code ([ROADMAP.md](../planning/ROADMAP.md), Phase 1).

What the research found about Wokwi, Tinkercad, Falstad, EveryCircuit, CircuitLab.com, EasyEDA and Proteus:
- Serious web simulators **run the simulation in the user's browser**. The server only compiles code and stores projects.
- Analog simulation means modified nodal analysis **with time steps**: companion models for capacitors and inductors, and Newton iteration for diodes and transistors.
- Microcontrollers are emulated in the browser: Wokwi's `avr8js` and `rp2040js` are MIT-licensed.

## Options considered

1. **Embed Falstad CircuitJS in an iframe.** Quick, but it is GPL (so no copying code), it looks and works like a separate app, and it is hard to link with our parts, probes and microcontrollers.
2. **ngspice in WebAssembly (`eecircuit-engine`, MIT) as the main engine.** Accurate, but built for batch runs: changing a value while it runs doesn't yet work well in the browser.
3. **Our own time-step engine in a Web Worker, checked against ngspice.** ✅ Recommended.

## Decision

- Write our own engine in a Web Worker: modified nodal analysis, time steps, companion models, Newton iteration and a sparse solver. It runs in real time, and values can change while it runs.
- Use ngspice (`eecircuit-engine`) in the **tests** to check our results, and later as an optional "accurate analysis" mode (AC sweep and similar).
- One saved format in the style of Wokwi's `diagram.json`: a list of parts (type, position, attributes) plus connections (`"part:pin" → "part:pin"`). The drawing code and the simulation models are kept apart.
- Microcontrollers: `avr8js` (Uno) first, then `rp2040js` (Pico), running in the same worker, with their pins driving the analog circuit. The code is compiled by `arduino-cli` in a separate container. No ESP32: no permissive browser emulator exists.
- **Never copy code** from GPL projects (Falstad CircuitJS, SimulIDE, QEMU, simavr), so the licence choice stays open.

## Consequences

- There's no server cost for simulation: more users don't need more servers.
- The engine is the biggest piece of work in the roadmap (5–7 weeks), and it needs its own unit tests (a Node test runner) alongside the Playwright tests.
- The current engine (`src/engines/simulator/index.js`) is replaced step by step, with saved projects converted to the new format.
