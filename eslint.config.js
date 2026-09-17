import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['dist/', 'playwright-report/', 'test-results/'],
  },

  js.configs.recommended,

  /* ── App code ─────────────────────────────────────────────────── */
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      // Known leftovers are warnings, capped by --max-warnings in package.json.
      // Fix them in the branch that owns that code (see docs/FIX_PLAN.md), then lower the cap.
      'no-unused-vars': 'warn',
      'no-empty': 'warn',
      'no-case-declarations': 'warn',
    },
  },

  /* ── Cross-file globals ───────────────────────────────────────── */
  // Each module assigns itself to window (see docs/ARCHITECTURE.md → Load order).
  // The app code split out of app.js (#27c) still reads them by bare name (ADR 0003).
  {
    files: ['src/app/**/*.js', 'src/ui/**/*.js', 'src/views/**/*.js', 'src/services/**/*.js', 'src/utils/**/*.js'],
    languageOptions: {
      globals: {
        CircuitApp: 'readonly',
        CircuitLabData: 'readonly',
        ThreeViewer: 'readonly',
        CircuitSimulator: 'readonly',
      },
    },
  },

  /* ── Tests and config ─────────────────────────────────────────── */
  // Test callbacks passed to page.evaluate() run in the browser, so both sets apply.
  {
    files: ['tests/**/*.js', '*.config.js'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
];
