import { defineConfig } from 'vite-plus';

export default defineConfig({
  pack: {
    entry: {
      index: 'src/index.ts',
      cli: 'src/cli.ts',
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
    dts: false,
    outDir: 'dist',
  },
});
