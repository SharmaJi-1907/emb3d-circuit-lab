# CircuitLab — Learning Guide

A plain-English tour of how this project works, so you can read, fix and extend it with confidence.
For the list of bugs and the step-by-step fixes, see [FIX_PLAN.md](FIX_PLAN.md).

---

## 1. What the app is

A single-page website for learning electronics. It has one HTML page with 9 "screens" (views) that are shown and hidden with JavaScript:

| Screen | What it's meant to do |
|---|---|
| Dashboard | Home screen: stats, quick access to every screen, recently viewed parts |
| 3D Viewer | Spin a 3D chip or board and click its pins to learn what each pin does |
| Circuit Simulator | Drag parts onto a breadboard, wire them up, watch an oscilloscope |
| Component Database | Browse and compare parts |
| Board Explorer | See the pinout of Arduino, ESP32, Raspberry Pi, STM32 boards |
| Datasheet Viewer | Read simplified datasheets |
| AI Assistant | Ask electronics questions (currently canned answers, not real AI) |
| Projects | Example projects like a weather station or robot arm |
| Settings | Theme and shortcuts |

---

## 2. The tools it uses

| Tool | What it is | Where |
|---|---|---|
| **Vite** | A dev server + bundler. `npm run dev` serves the files with live reload. `npm run build` packs everything into `dist/`. | [package.json](../package.json), [vite.config.js](../vite.config.js) |
| **Three.js** (r128) | A library for 3D graphics in the browser (WebGL) | Loaded from a CDN in [index.html](../index.html) |
| **Canvas 2D** | The browser's built-in drawing surface, used for the background, simulator, oscilloscope and board drawing | Plain JS |
| **Google Fonts** | Fonts | CDN |

There is **no framework** (no React or Vue). Everything is plain JavaScript that changes the page directly.

---

## 3. How the files connect

```
index.html  ── the page: all 9 screens, buttons, panels (each with an id="...")
   │
   └─ <script type="module" src="src/main.js">
                     │
      src/main.js ── the entry point: imports everything in order
         ├─ styles/main.css                   how it looks
         ├─ engines/background/circuit-bg.js  animated background
         ├─ data/data.js                      all the data   → window.CircuitLabData
         ├─ engines/three-viewer/index.js     3D engine      → window.ThreeViewer
         ├─ engines/simulator/index.js        circuit engine → window.CircuitSimulator
         └─ app/app.js                        the "brain"    → window.CircuitApp
```

An older version of the app (`script.js` + `database.js`) used to sit in a `legacy/` folder. It was never loaded, and it was deleted in branch #6. See [decisions/0002-screen-markup.md](decisions/0002-screen-markup.md) for why the project had two versions.

For the full folder map, see [ARCHITECTURE.md](ARCHITECTURE.md).

**Key idea:** each JS file puts one object on `window` (the browser's global scope), and the other files use it by name. If a file is never loaded, its object doesn't exist. That's exactly why most screens crashed until branch #3 added the missing `data/data.js` line (bug A1).

---

## 4. Concepts you'll see in the code

### 4.1 The "module pattern" (IIFE)
```js
window.CircuitApp = (function () {
  const state = { ... };          // private: nobody outside can touch it
  function navigateTo(view) { }   // private helper
  return { init, navigateTo };    // public: what other files can call
})();
```
The function runs immediately and returns only what should be public. It's an older way to organize code. Modern code uses `export` / `import` instead.

### 4.2 Finding things on the page by ID
```js
document.getElementById('ai-send-btn')   // must match id="ai-send-btn" in index.html exactly
```
If the names don't match, you get `null` and nothing happens. **Most of the "dead buttons" in this project are just name mismatches.**

### 4.3 Event listeners — making buttons do things
```js
button.addEventListener('click', () => { /* do something */ });
```
A button with no listener does nothing when clicked. Also, **adding a new function as a listener on every visit makes it run once per visit**. That's why every screen wires its buttons once, on the first visit (bugs D3 and D22).

### 4.4 Screen switching ("routing")
`navigateTo('simulator')` in [app.js](../src/app/app.js#L124):
1. puts `#simulator` in the address, so refresh, Back/Forward and links work (a `hashchange` listener does the reverse)
2. hides every `<section class="view">`
3. shows `<section id="view-simulator">`
4. runs that screen's setup function (`initSimulatorPanel`)

### 4.5 The animation loop
```js
function animate() {
  requestAnimationFrame(animate);  // "call me again before the next screen refresh" (~60×/sec)
  // update and draw one frame
}
```
It's used by the background, the 3D viewer and the simulator. Every loop you start keeps running until you cancel it with `cancelAnimationFrame`.

### 4.6 Three.js basics (3D viewer)
Every Three.js app has the same 4 parts. See [three-viewer/index.js](../src/engines/three-viewer/index.js):
- **Scene**: the 3D world that holds objects
- **Camera**: where you look from
- **Renderer**: draws the scene onto the `<canvas id="viewer-canvas">`
- **Meshes**: shape (geometry) + surface look (material)

The chips aren't loaded from model files. They're **built from boxes and cylinders in code** (`buildDIP`, `buildQFP`, `buildESP32`…). Clicking a pin uses a **Raycaster**, which shoots an invisible line from the mouse into the scene to see what it hits.

### 4.7 The simulator (a small DC solver)
[simulator/index.js](../src/engines/simulator/index.js) draws parts on a 2D canvas. `runSimulation()` joins wired pins into nets and works out every net's voltage with nodal analysis, so currents follow Ohm's law and an LED lights only in a closed loop, the right way round. It's a teaching simplification (DC only, simple part models), not a full circuit simulator like SPICE.

### 4.8 The "AI"
`getAIResponse()` in [app.js](../src/app/app.js#L1601) looks for words in your question and returns a pre-written answer from `data.js`. It doesn't connect to any AI service. To make it real, you'd call an AI API **from a server** (never put API keys in browser code).

### 4.9 localStorage
`localStorage` keeps data in the browser. It stays after a page refresh, but only on that one browser. This project saves the theme under `circuitlab.theme` and your own projects under `circuitlab.my-projects`.

---

## 5. How to debug this kind of app (the skill that matters most)

1. `npm run dev`, then open http://localhost:3000
2. Press **F12**, then the **Console** tab. Red lines are errors, and each one gives the file and line number, like `app.js:983`.
3. Click around. Each click that shows a red error is a bug with its exact location.
4. Useful console commands while the app is running:
   ```js
   CircuitApp.getState()          // see the app's current data
   typeof CircuitLabData          // "undefined" = data.js not loaded (bug A1)
   CircuitApp.navigateTo('ai')    // jump to a screen
   ThreeViewer.isReady()          // is 3D running?
   ```
5. **Elements tab**: right-click a button, choose **Inspect**, and see its `id`. Then search the JS for that id. If you find nothing, the button isn't hooked up.

---

## 6. Why these bugs happened (and how to avoid them)

| What happened | Lesson |
|---|---|
| The page was designed for the old code, then the code was swapped for a new version without updating the page | When you replace a big file, check what it depends on (IDs, data, globals) |
| `data.js` was forgotten in `main.js` | Run tests that open every screen (`npm run test:smoke`), and prefer real `import`/`export` over `window` globals so a missing file breaks the build. A linter alone can't catch this while files share names through `window`. |
| Old files (`script.js`, `database.js`) were left behind | Delete dead code once anything useful has been copied out of it |
| There was no git and no tests | Commit often. One small automated test that opens each screen would catch all the crashes |

---

## 7. Commands cheat sheet

```bash
npm install        # install dev tools (Vite)
npm run dev        # start dev server → http://localhost:3000
npm run build      # build the finished site → dist/
npm run preview    # serve the dist/ build to test it
npm run lint       # check the code for mistakes without running it
npm test           # lint + smoke tests (run before every commit)
npm run test:smoke # open every screen in Chrome, fail on any error
npm run test:report # view the last test run in the browser
npm audit          # check dependencies for known security issues
```

## 8. Glossary

- **DOM**: the page as a tree of objects that JavaScript can read and change
- **SPA**: Single-Page App; one HTML page whose screens are switched by JS
- **CDN**: a public server that hosts libraries; your page downloads them from there at runtime
- **Bundler**: a tool (Vite) that combines your files into a few optimized files for production
- **WebGL**: the browser feature that draws 3D using the graphics card
- **PWM / I2C / SPI / UART**: common ways chips send signals and talk to each other (explained inside the app's datasheets)
