import { defineConfig, devices } from '@playwright/test';

const PORT = 3000;

export default defineConfig({
  testDir: 'tests',
  // Generous: the first run after a code change can be slow while Vite recompiles.
  // Raised from 30 s in #18: 4 browsers draw 3D in software and `openApp` waits for
  // the 3D engine on every screen, so at peak a test can sit waiting for CPU. The
  // suite grew to 516 slots under --repeat-each=4 and 4 tests timed out with no
  // assertion failing. The real saving is to stop non-3D tests waiting for it (E15).
  timeout: 60_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        // Use the locally installed Google Chrome instead of downloading a browser.
        channel: 'chrome',
        launchOptions: {
          // Headless Chrome has no GPU; allow software WebGL so the 3D viewer can start.
          args: ['--enable-unsafe-swiftshader'],
        },
      },
    },
  ],

  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
