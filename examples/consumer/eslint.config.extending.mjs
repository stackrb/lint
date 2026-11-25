import { createConfig } from '@stackrb/eslint-config';

// Your existing config blocks stay as they are. Put the shared config first so
// your own rules are applied last and win; createConfig accepts the same options
// as the one-import default export.
const existingConfig = [
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];

export default [
  ...createConfig({ target: 'react' }),
  ...existingConfig,
];
