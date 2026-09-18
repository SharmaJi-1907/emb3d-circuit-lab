# Contributing

Thanks for helping with CircuitLab. It is open source under the MIT licence.

## Before you start

1. Read [docs/context/PROJECT_CONTEXT.md](docs/context/PROJECT_CONTEXT.md) (where the project is now) and [docs/tracking/PROGRESS.md](docs/tracking/PROGRESS.md) (which phase and branch is open).
2. Using an AI tool? It must follow [AGENTS.md](AGENTS.md). Claude Code and Cursor load it by themselves.
3. Found a security problem? Don't open a public issue: see [SECURITY.md](SECURITY.md).

## Making a change

1. Make **one** focused change, on a feature branch made from the current **phase branch** ([GIT_WORKFLOW.md](docs/guides/GIT_WORKFLOW.md)).
2. Follow [CODING_STANDARDS.md](docs/rules/CODING_STANDARDS.md).
3. Test it ([TESTING_STRATEGY.md](docs/rules/TESTING_STRATEGY.md)):
   - `npm test` and `npm run build` must pass.
   - A new test must fail before your change and pass after it.
   - Open the app with `npm run dev`, and check that the browser console (F12) shows **no red errors** on the screens you touched.
4. Update the docs in the same PR ([AGENTS.md](AGENTS.md), "Keeping the docs current").
5. Open a PR into the phase branch, and go through [REVIEW_CHECKLIST.md](docs/rules/REVIEW_CHECKLIST.md) ("Feature PR").

Tip: install the **ESLint** extension in VS Code to see lint problems as you type.

## Where to find things

The index of every doc is [docs/README.md](docs/README.md).
