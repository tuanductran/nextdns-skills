import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'validate-rules': 'src/validate-rules.ts',
    'update-counts': 'src/update-counts.ts',
  },
  format: ['esm'],
  target: 'node20',
  clean: true,
  outDir: 'dist',
});
