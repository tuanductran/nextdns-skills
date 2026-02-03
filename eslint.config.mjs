import markdown from '@eslint/markdown';

/** @type {import('eslint').Linter.Config[]} */
export default [
    // Markdown
    ...markdown.configs.recommended,
    {
        files: ['**/*.md'],
        rules: { 'markdown/no-invalid-label-refs': 'error' },
    },
];
