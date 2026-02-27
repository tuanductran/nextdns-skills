import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    build: 'src/build.ts',
    validate: 'src/validate.ts',
    'extract-tests': 'src/extract-tests.ts',
    migrate: 'src/migrate.ts',
  },
  format: ['esm'],
  target: 'node20',
  clean: true,
  outDir: 'dist',
});
