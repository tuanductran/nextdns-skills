import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    build: 'src/build.ts',
    validate: 'src/validate.ts',
    'extract-tests': 'src/extract-tests.ts',
    migrate: 'src/migrate.ts',
    search: 'src/search.ts',
    export: 'src/export.ts',
  },
  format: ['esm'],
  target: 'node20',
  clean: true,
  dts: true,
  outDir: 'dist',
});
