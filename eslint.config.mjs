import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      semi: ['error', 'always'],
      'max-len': ['error', { 'code': 90 }],
      'linebreak-style': ['error', 'windows'],
      'no-underscore-dangle': ['error', { 'allow': ['_id'] }]
    },
  },
];
