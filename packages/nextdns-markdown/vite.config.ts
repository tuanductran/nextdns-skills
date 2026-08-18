import { defineConfig } from 'vite-plus';

export default defineConfig({
  pack: {
    entry: {
      index: 'src/index.ts',
    },
    format: ['esm'],
    target: 'node20',
    clean: true,
    dts: true,
    outDir: 'dist',
  },
});
