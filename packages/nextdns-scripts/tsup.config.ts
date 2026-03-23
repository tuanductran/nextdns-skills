import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
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
});
