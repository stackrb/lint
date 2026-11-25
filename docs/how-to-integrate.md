# How-to guide

Task-focused recipes for integrating and customising `@stackrb/eslint-config`. Each section is independent; use the ones you need.

If you are new to the package, start with the [tutorial](tutorial.md).

## Add the config to a new package

1. Install the package and its required peer:

   ```sh
   npm install --save-dev eslint @stackrb/eslint-config
   ```

   Add `typescript` as well if you lint TypeScript files:

   ```sh
   npm install --save-dev typescript
   ```

2. Create `eslint.config.mjs` at the package root:

   ```js
   export { default } from '@stackrb/eslint-config';
   ```

   Re-exporting directly keeps the one-import API and avoids `unicorn/prefer-export-from`, which would flag the import-then-export form on this config file.

3. Lint your files:

   ```sh
   npx eslint .
   ```

Optionally add a script to your `package.json`:

```json
{
  "scripts": {
    "lint": "eslint ."
  }
}
```

## Add the config to an existing ESLint config

Keep your current flat config and compose the shared blocks into it. Put the shared config first, then your own blocks, so your rules are applied last and win:

```js
// eslint.config.mjs
import { createConfig } from '@stackrb/eslint-config';

export default [
  ...createConfig({ target: 'react' }),
  {
    files: ['src/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
```

For the default `node` target you can spread the one-import default instead:

```js
import config from '@stackrb/eslint-config';

export default [
  ...config,
  { files: ['src/**/*.ts'], rules: { 'no-console': 'error' } },
];
```

`extraRules` is a shorter alternative for a single block of overrides and is applied after everything, including Prettier:

```js
export default createConfig({
  extraRules: { '@typescript-eslint/no-explicit-any': 'off' },
});
```

### What rules you inherit

Spreading `createConfig(...)` adds the full preset — you do not have to register the plugins or copy their rules yourself:

| Files | Rules brought in |
| --- | --- |
| `**/*.{js,jsx,mjs,cjs}` | `@eslint/js` recommended, ESLint comments, `n`, `deslint`, `de-morgan`, `sonarjs`, `security`, `regexp`, `promise`, `perfectionist`, `unicorn`, `@stylistic`, and JSDoc `flat/recommended` |
| `**/*.{ts,tsx,mts,cts}` | The same base rules plus `typescript-eslint` recommended (and type-checked rules when `typed: true`) and JSDoc `flat/recommended-tsdoc` |
| `**/*.{test,spec}.{js,jsx,mjs,cjs,ts,tsx,mts,cts}` | Vitest recommended rules and globals **and** Playwright recommended rules and globals |
| `**/*.sh`, `**/*.bash` | `@eslint/shell` with `shell/bash` and `shell/recommended` |
| `**/*.json`, `**/*.jsonc`, `**/*.json5` | `@eslint/json` recommended language rules |
| `**/*.md` | `@eslint/markdown` GFM recommended rules |
| All code files | The chosen target's globals/rules: `node` (default), `browser`, `react`, `native`, or `expo` |
| All files | `eslint-config-prettier` last, disabling formatter conflicts |

To keep an existing config in its own module, import and spread it after the shared blocks:

```js
// eslint.config.mjs
import { createConfig } from '@stackrb/eslint-config';
import localConfig from './eslint.local.mjs';

export default [
  ...createConfig({ target: 'react', extraIgnores: ['generated/**'] }),
  ...localConfig,
];
```

Because your blocks come last, you can switch any inherited rule off without forking the shared config:

```js
{
  files: ['**/*.sh'],
  rules: { 'shell/no-unquoted-expansions': 'off' },
}
```

Use `extraRules` instead when the override should be scoped to code files only. To drop a whole family, omit the target (`node` is the default) or add an ignore pattern with `extraIgnores`.

A complete runnable version is in [`examples/consumer/eslint.config.extending.mjs`](../examples/consumer/eslint.config.extending.mjs); run it with `npm run lint:extending` from that directory.

## Choose a target

Pass `target` to `createConfig`:

```js
import { createConfig } from '@stackrb/eslint-config';

export default createConfig({ target: 'browser' });
```

Examples for each runtime:

```js
// Node.js (the default — you can also omit `target`)
createConfig({ target: 'node' });

// Browser code
createConfig({ target: 'browser' });

// React (includes browser globals and React, hooks, and JSX a11y rules)
createConfig({ target: 'react' });

// React Native (includes React, plus React Native rules and globals)
createConfig({ target: 'native' });

// Expo (includes React Native, plus Expo-specific rules)
createConfig({ target: 'expo' });
```

You can combine independent runtimes:

```js
export default createConfig({ target: ['node', 'browser'] });
```

`react`, `native`, and `expo` are cumulative (`expo` includes `native`, which includes `react`). Overlaps are deduplicated automatically: `{ target: ['native', 'expo'] }` collapses to a single `expo` target whose chain still contains the `react`, `native`, and `expo` blocks — it does not emit just one block. Independent runtimes such as `['node', 'browser']` are both applied. See [Targets](reference.md#targets) for the full list.

If you prefer preset names, use the plugin facade:

```js
import { plugin } from '@stackrb/eslint-config';

export default plugin.configs.node; // or .browser, .react, .native, .expo, .recommended
```

`plugin.configs.recommended` is the same as the default export.

## Customise rules

Use `extraRules` for final overrides. These are applied **after** all presets and after the Prettier compatibility config, so your settings always win. Overrides are scoped to code files (`**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}`), so a plugin rule cannot crash JSON or Markdown linting:

```js
import { createConfig } from '@stackrb/eslint-config';

export default createConfig({
  extraRules: {
    'no-console': 'warn',
    '@typescript-eslint/no-unused-vars': 'off',
  },
});
```

Values follow ESLint's normal rule severities (`'off'`, `'warn'`, `'error'`, or `0`/`1`/`2`) and rule-option arrays.

## Ignore additional files or directories

`extraIgnores` extends the built-in global ignore list:

```js
export default createConfig({
  extraIgnores: ['**/generated/**', '**/*.snap'],
});
```

The defaults already exclude `node_modules`, `dist`, `build`, `coverage`, `cache`, `package-lock.json`, and dotfiles/dot-directories (`**/.*`, `**/.*/**`). See the [full ignore list](reference.md#ignore-list).

## Set the Node.js version

The config sets `settings.node.version` to `>=20.19.0` by default, which drives Node.js feature checks. Override it to match your project's supported runtime:

```js
export default createConfig({ nodeVersion: '>=22.13.0' });
```

Setting this explicitly stops the config from guessing based on your package's `engines` field.

## Enable type-aware linting

Type-aware rules need a TypeScript project definition. Set `typed` to `true`:

```js
import { createConfig } from '@stackrb/eslint-config';

export default createConfig({ target: 'node', typed: true });
```

This adds `typescript-eslint`'s `recommendedTypeChecked` preset and sets `parserOptions.projectService: true`, so ESLint uses the nearest TypeScript project to resolve type information.

Before enabling it, make sure:

- `typescript` is installed (it is an optional peer).
- Your `tsconfig.json` includes the files you lint.

Type-aware mode is opt-in because it needs a project and costs more to run. Leave `typed` off for a quick, zero-config setup.

## Flag deprecated symbols

`deprecations` configures `eslint-plugin-deprecate`. Each entry needs a `name`; `use` names the replacement, and `kind` selects the rule to use:

```js
export default createConfig({
  deprecations: [
    { name: 'oldApi' },
    { name: 'legacyFn', use: 'newFn' },
    { name: 'config.oldOption', kind: 'member-expression', use: 'config.newOption' },
    { name: 'old-package/legacy', kind: 'import', use: 'new-package' },
  ],
});
```

`kind` accepts `'function'` (the default), `'import'`, or `'member-expression'`. `use` is optional: a bare `{ name: 'oldApi' }` entry is valid and reports the symbol without suggesting a replacement. When the option is empty or omitted, no deprecation rules are enabled.

## Ban dependencies

`bannedDependencies` configures `eslint-plugin-depend`'s `ban-dependencies` rule. Values are passed to its `modules` option as names or patterns:

```js
export default createConfig({
  bannedDependencies: ['lodash', 'moment', 'request'],
});
```

The ban is enforced in code files (via the base config) and in JSON files (via the data config). When the option is empty or omitted, the rule is not enabled.

## Add ambient globals

Use `extraGlobals` to declare additional globals for code files:

```js
import { createConfig } from '@stackrb/eslint-config';

export default createConfig({
  extraGlobals: { GM_xmlhttpRequest: 'readonly', chrome: 'readonly' },
});
```

This emits a `stackrb/extra-globals` config scoped to `CODE_FILES`. Values can be `true` or `'writable'` (writable global), `'readonly'` (read-only global), or `false` or `'off'` (disabled global).

## Compose your own config from parts

Every layer is exported as a function returning a `Linter.Config[]`. Call them in the order you want and pass the options each one accepts:

```js
import { defineConfig } from 'eslint/config';
import {
  ignores,
  base,
  javascript,
  typescript,
  tests,
  data,
  markdown,
  react,
  prettier,
} from '@stackrb/eslint-config';

export default defineConfig([
  ...ignores(),
  ...base(),
  ...javascript(),
  ...typescript(),
  ...tests(),
  ...data(),
  ...markdown(),
  ...react(),
  ...prettier(),
]);
```

`base(options)`, `typescript(options)`, and `data(options)` accept the relevant `Options` fields, and `ignores(extraIgnores?)` accepts an optional array of extra ignore patterns; the rest take no arguments. Your own block can go at the end for final overrides. See the [exports table](reference.md#exports) for the authoritative list.
