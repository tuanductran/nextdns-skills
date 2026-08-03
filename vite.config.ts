import { defineConfig } from 'vite-plus';

export default defineConfig({
  fmt: {
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: true,
    trailingComma: 'es5',
    ignorePatterns: [
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/*.md',
      '**/*.yml',
      '**/*.yaml',
    ],
    sortImports: {
      groups: [
        'type-import',
        ['value-builtin', 'value-external'],
        'type-internal',
        'value-internal',
        ['type-parent', 'type-sibling', 'type-index'],
        ['value-parent', 'value-sibling', 'value-index'],
        'unknown',
      ],
    },
  },
  lint: {
    // jsPlugins removed: vite-plus/oxlint-plugin causes oxc_allocator thread panic
    // in oxlint >=1.73 when used via vp lint. The vite-plus/prefer-vite-plus-imports
    // rule it provides is enforced via code review instead.
    categories: {
      correctness: 'error',
      suspicious: 'warn',
    },
    rules: {
      'no-underscore-dangle': 'off',
      'unicorn/no-array-sort': 'off',
      'unicorn/consistent-function-scoping': 'off',
    },
    ignorePatterns: ['**/dist/**', '**/coverage/**', '**/node_modules/**'],
    // typeAware/typeCheck also disabled: causes the same allocator panic.
    // Full type checking is covered by `tsc --noEmit` (pnpm types:check).
  },
  staged: {
    '*.{ts,json,yml,yaml}': 'vp check --fix',
  },
});
