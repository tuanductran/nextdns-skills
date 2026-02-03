import markdown from '@eslint/markdown';
import pluginCasePolice from 'eslint-plugin-case-police';
import pluginPrettier from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Markdown
  ...markdown.configs.recommended,
  {
    files: ['**/*.md'],
    rules: { 'markdown/no-invalid-label-refs': 'error' },
  },
  // Case Police for markdown files
  {
    name: 'case-police',
    files: ['skills/**/*.md'],
    plugins: {
      'case-police': pluginCasePolice,
    },
    rules: {
      'case-police/string-check': 'error',
    },
  },
  // Prettier integration
  {
    name: 'prettier',
    files: ['**/*.md', '**/*.js', '**/*.mjs'],
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  // Disable ESLint rules that conflict with Prettier (must be last)
  configPrettier,
];
