import { defineConfig } from 'vite-plus';

export default defineConfig({
  pack: {
    entry: {
      index: 'src/index.ts',
      cli: 'src/cli.ts',
      'validate-rules': 'src/validate-rules.ts',
      'update-counts': 'src/update-counts.ts',
      'check-duplicates': 'src/check-duplicates.ts',
      'check-tags': 'src/check-tags.ts',
      'generate-stats': 'src/generate-stats.ts',
    },
    format: ['esm'],
    target: 'node20',
    clean: true,
    dts: false,
    outDir: 'dist',
  },
});
