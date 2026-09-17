import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: false,
    host: true
  },
  build: {
    outDir: 'dist'
    // No `minify` setting: Vite 8's default minifier (Oxc) is used. `minify: 'esbuild'`
    // would need esbuild installed on its own, which Vite 8 no longer includes (E6).
  }
});
