# Documentation

| Doc | Read it when… |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | You want to know where code lives and which folder may use which |
| [LEARNING_GUIDE.md](LEARNING_GUIDE.md) | You're new to the code and want a plain-English tour |
| [FIX_PLAN.md](FIX_PLAN.md) | You're fixing bugs — full list, severity, and step-by-step plan |
| [CONTRIBUTING.md](CONTRIBUTING.md) | You're about to write code |
| [GIT_WORKFLOW.md](GIT_WORKFLOW.md) | You're starting a branch, committing, or merging, or want the branch plan |
| [decisions/](decisions/) | You want to know *why* something was decided |

## Folder guide

- `decisions/` — Architecture Decision Records (ADRs). One short file per big decision, numbered `0001-…`, `0002-…`. Never edit an old one; write a new one that replaces it.
- `images/` — screenshots and diagrams used by these docs.

## Decisions so far

| ADR | Decision |
|---|---|
| [0001](decisions/0001-folder-structure.md) | Folder structure (`src/`, `docs/`, `tests/`…) |
| [0002](decisions/0002-screen-markup.md) | Which page markup each screen uses: new layout for Viewer, Database and Dashboard; current page for the rest |
