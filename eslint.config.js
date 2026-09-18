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
      // Warnings, but `npm run lint` allows none (--max-warnings 0 in package.json).
      'no-unused-vars': 'warn',
      'no-empty': 'warn',
      'no-case-declarations': 'warn',
    },
  },

  /* ── Cross-file globals ───────────────────────────────────────── */
  // The 4 public globals, each set on window in one place (ADR 0003).
  // The app code reads them by bare name.
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
