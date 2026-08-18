import { defineConfig } from 'vite-plus';

export default defineConfig({
  pack: {
    entry: {
      index: 'src/index.ts',
      cli: 'src/cli.ts',
      build: 'src/commands/build.ts',
      validate: 'src/commands/validate.ts',
      'extract-tests': 'src/commands/extract-tests.ts',
      migrate: 'src/commands/migrate.ts',
      search: 'src/commands/search.ts',
      export: 'src/commands/export.ts',
    },
    format: ['esm'],
    target: 'node20',
    clean: true,
    dts: false,
    outDir: 'dist',
  },
});
