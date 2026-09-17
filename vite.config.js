import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: false,
    host: true
  },
  build: {
    outDir: 'dist',
    // The app is ~146 kB. The only bigger chunk is Three.js (~550 kB), which is
    // its own file and is downloaded the first time the 3D Viewer opens (E18),
    // so warn above that instead of at the 500 kB default.
    chunkSizeWarningLimit: 600
    // No `minify` setting: Vite 8's default minifier (Oxc) is used. `minify: 'esbuild'`
    // would need esbuild installed on its own, which Vite 8 no longer includes (E6).
  }
});
