export const JS_FILES = '**/*.{js,jsx,mjs,cjs}';
export const TS_FILES = '**/*.{ts,tsx,mts,cts}';
export const CODE_FILES = '**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}';
export const TEST_FILES = '**/*.*{test,spec}.{js,jsx,mjs,cjs,ts,tsx,mts,cts}';
export const SHELL_FILES = '**/*.{sh,bash}';

export const DEFAULT_IGNORES: readonly string[] = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/coverage/**',
  '**/cache/**',
  '**/package-lock.json',
  '**/.*/**',
  '**/.*',
];

export const DEFAULT_NODE_VERSION = '>=20.19.0';
