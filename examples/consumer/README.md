# Consumer example

Standalone package that uses `@stackrb/eslint-config` through a one-import flat config.

## Run

Build the package in the repository root first, then:

```sh
npm install
npm run lint
```

`npm install` links the config from `file:../..`.

## Extending an existing config

If you already have an `eslint.config.mjs`, keep it and compose the shared config into it. `eslint.config.extending.mjs` shows the pattern: spread `createConfig(...)` first, then your existing blocks so your rules win.

Spreading the config brings all of its rule families: base/TypeScript for code files, Vitest and Playwright for test files, `@eslint/shell` for `.sh`/`.bash`, JSON/Markdown language rules, and the rules of the target you select (`react` in the example). You can override any of them in your own blocks.

```sh
npm run lint:extending
```

For the default `node` target, the one-import form works too:

```js
import config from '@stackrb/eslint-config';

export default [
  ...config,
  {
    files: ['src/**/*.ts'],
    rules: { 'no-console': 'error' },
  },
];
```

You can also pass your overrides through `createConfig({ extraRules })`; see the [how-to guide](../../docs/how-to-integrate.md#add-the-config-to-an-existing-eslint-config).
