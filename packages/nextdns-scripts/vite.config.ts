import { defineConfig } from 'vite-plus';

export default defineConfig({
  pack: {
    entry: {
      index: 'src/index.ts',
      cli: 'src/cli.ts',
      'validate-rules': 'src/commands/validate-rules.ts',
      'update-counts': 'src/commands/update-counts.ts',
      'check-duplicates': 'src/commands/check-duplicates.ts',
      'check-tags': 'src/commands/check-tags.ts',
      'generate-stats': 'src/commands/generate-stats.ts',
      audit: 'src/commands/audit.ts',
    },
    format: ['esm'],
    target: 'node20',
    clean: true,
    dts: false,
    outDir: 'dist',
  },
});
