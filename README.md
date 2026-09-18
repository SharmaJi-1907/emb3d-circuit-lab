# CircuitLab (emb3d)

An electronics learning web app: a 3D component viewer, circuit simulator, component database, board pinouts, datasheets and an assistant — all in the browser.

> **Status:** every issue in [docs/FIX_PLAN.md](docs/archive/FIX_PLAN.md) is fixed. All 9 screens work in both themes, with 220 browser smoke tests, 0 lint warnings, 0 `npm audit` issues and a clean build. Ideas for new features are listed at the end of the fix plan.

## Quick start

```bash
npm install       # needs Node 20.19+ or 22.12+ (Vite 8)
npm run dev       # http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with live reload |
| `npm run build` | Build the production site into `dist/` |
| `npm run preview` | Serve the `dist/` build locally |
| `npm test` | Run lint, then the smoke tests (use before every commit) |
| `npm run lint` | Check the code for mistakes with ESLint |
| `npm run test:smoke` | Run the browser smoke tests (Playwright) |
| `npm run test:report` | Open the last test report |

The smoke tests use the Google Chrome installed on your machine. Without Chrome, remove `channel: 'chrome'` from `playwright.config.js` and run `npx playwright install chromium`.

## Project structure

```
├── index.html          Page markup (Vite entry — must stay at root)
├── public/             Static files copied to dist/ as-is (favicon, manifest)
├── src/
│   ├── main.js         Entry point — loads styles and all modules
│   ├── app/            App shell: startup, router, state, window.CircuitApp
│   ├── views/          One <screen>.view.js per screen
│   ├── engines/        3D viewer, circuit simulator, animated background
│   ├── ui/             Page-wide UI: toast, search, shortcuts, notifications, theme, top bar
│   ├── data/           Component, board, datasheet and project data
│   ├── services/       AI answers, local storage
│   ├── utils/          Small helpers (HTML escaping, markdown, canvas, design tokens)
│   └── styles/         CSS: base/, layout/, components/, views/
├── tests/smoke/        Playwright browser tests
└── docs/               All documentation
```

Details: [docs/ARCHITECTURE.md](docs/planning/ARCHITECTURE.md)

## Documentation

- [docs/README.md](docs/README.md): the index of every doc
- [docs/context/PROJECT_CONTEXT.md](docs/context/PROJECT_CONTEXT.md): where the project is right now
- [docs/planning/ROADMAP.md](docs/planning/ROADMAP.md): the plan from demo to a real, public product
- [docs/guides/LEARNING_GUIDE.md](docs/guides/LEARNING_GUIDE.md): how the code works, in plain English
- [CONTRIBUTING.md](CONTRIBUTING.md): how to help · [AGENTS.md](AGENTS.md): rules for AI tools · [SECURITY.md](SECURITY.md): reporting a problem
- [CHANGELOG.md](CHANGELOG.md): everything that changed

## Tech

Vanilla JavaScript (ES modules) · [Vite 8](https://vitejs.dev) · [Three.js r186](https://threejs.org) · Canvas 2D · [Playwright](https://playwright.dev) smoke tests · ESLint 10
