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
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    categories: {
      correctness: 'error',
      suspicious: 'warn',
    },
    rules: {
      'no-underscore-dangle': 'off',
      'unicorn/no-array-sort': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'vite-plus/prefer-vite-plus-imports': 'error',
    },
    ignorePatterns: ['**/dist/**', '**/coverage/**', '**/node_modules/**'],
    options: { typeAware: true, typeCheck: true },
  },
  staged: {
    '*.{ts,json,yml,yaml}': 'vp check --fix',
  },
});
