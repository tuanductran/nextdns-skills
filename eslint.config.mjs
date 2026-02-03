import markdown from '@eslint/markdown';
import pluginCasePolice from 'eslint-plugin-case-police';

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
];
