# Changelog

All notable changes to this project are listed here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed
- Restructured the project into a professional folder layout (`src/`, `docs/`, `public/`, `tests/`, `scripts/`). Files were moved without changing their code. See [docs/decisions/0001-folder-structure.md](docs/decisions/0001-folder-structure.md).
- Moved `js/script.js` and `js/database.js` (unused old code) to `legacy/` for review.

### Added
- `README.md`, `CHANGELOG.md`, `.editorconfig`, expanded `.gitignore`.
- `docs/` with an index, architecture, contributing guide and decision records.
- `docs/GIT_WORKFLOW.md`: branch-per-issue workflow, commit format and branch plan.
- `CLAUDE.md`: working rules for the AI coding assistant.
- `.github/pull_request_template.md`: PR checklist.
- Playwright smoke tests (`npm run test:smoke`): 12 tests covering app start, all 8 screens, search, AI chat and number-key shortcuts. They fail on any page error, and known bugs are tracked as expected failures.
