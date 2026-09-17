# CircuitLab (emb3d)

An electronics learning web app: a 3D component viewer, circuit simulator, component database, board pinouts, datasheets and an assistant — all in the browser.

> **Status:** work in progress. All 9 screens work; the remaining known bugs and clean-up are listed in [docs/FIX_PLAN.md](docs/FIX_PLAN.md).

## Quick start

```bash
npm install
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
│   ├── app/            App shell: startup, routing, state, shortcuts
│   ├── views/          One file per screen
│   ├── engines/        3D viewer, circuit simulator, animated background
│   ├── ui/             Reusable UI pieces (toast, modal, search)
│   ├── data/           Component, board, datasheet and project data
│   ├── services/       AI answers, local storage
│   ├── utils/          Small helpers (DOM, HTML escaping, formatting)
│   ├── styles/         CSS
│   └── assets/         Fonts, models, images imported by code
├── tests/              Smoke and unit tests
├── scripts/            Developer helper scripts
└── docs/               All documentation
```

Details: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Documentation

- [docs/README.md](docs/README.md) — index of all docs
- [docs/FIX_PLAN.md](docs/FIX_PLAN.md) — known bugs and the fix plan
- [docs/LEARNING_GUIDE.md](docs/LEARNING_GUIDE.md) — how the code works, in plain English
- [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) — code style rules
- [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md) — branches, commits, pull requests and the branch plan

## Tech

Vanilla JavaScript · [Vite](https://vitejs.dev) · [Three.js](https://threejs.org) · Canvas 2D
