# @stackrb/eslint-config

One-import ESLint flat config for Node.js, browser, React, React Native, and Expo projects.

Instead of assembling a dozen plugins, presets, and glob patterns yourself, you import one value and export it as your ESLint config. JavaScript, TypeScript, tests (Vitest and Playwright), JSON, Markdown, and shell scripts are all covered. You pick a runtime target (or several) and can optionally enable type-aware linting, deprecation checks, and dependency bans. Shell files (`.sh`, `.bash`) always get `@eslint/shell`'s recommended ShellCheck-inspired rules, regardless of target.

## Requirements

| Requirement | Version |
| --- | --- |
| Node.js | `^20.19.0 \|\| ^22.13.0 \|\| >=24` |
| ESLint (peer) | `>=10.4.0` |
| TypeScript (optional peer) | `>=4.8.4 <6.1.0` |

TypeScript is only needed to lint `.ts`/`.tsx` files and to use type-aware mode (`typed: true`). See the [reference](docs/reference.md#requirements) for the authoritative constraints.

## Install

```sh
npm install --save-dev eslint @stackrb/eslint-config
```

The package brings its own lint plugins as dependencies — you do not install them individually. The published package contains `dist`, `README.md`, `CHANGELOG.md`, and `LICENSE`. Consumers do not need `legacy-peer-deps`: this repository sets it in its own `.npmrc` only because ESLint and the stale-peer plugins are direct dependencies of its development install. See [Compatibility caveats](docs/explanation.md#compatibility-caveats).

## 30-second tutorial

1. Create `eslint.config.mjs` at the root of your project:

   ```js
   export { default } from '@stackrb/eslint-config';
   ```

   This is the same one-import API, re-exported directly. The direct re-export avoids `unicorn/prefer-export-from`, which would otherwise fire on `eslint.config.mjs` when this config lints its own config file. The default export is `createConfig()` with no options, which targets `node`.

2. Lint your code:

   ```sh
   npx eslint .
   ```

That's the complete setup. For a lesson that goes from an empty folder to a fixed TypeScript file, see [the tutorial](docs/tutorial.md).

## Pick a target

The default is `node`. Pass `target` to `createConfig` to choose another runtime:

```js
import { createConfig } from '@stackrb/eslint-config';

export default createConfig({ target: 'browser' });
```

Several runtimes can be combined:

```js
export default createConfig({ target: ['node', 'browser'] });
```

Available targets: `node`, `browser`, `react`, `native`, `expo`. The last three are cumulative — `expo` includes `native`, which includes `react` — and overlapping targets are deduplicated automatically: `{ target: ['native', 'expo'] }` collapses to a single `expo` target whose chain contains the `react`, `native`, and `expo` blocks (not just one block). Independent runtimes such as `['node', 'browser']` are both applied. See [Targets](docs/reference.md#targets) for the full list.

The same presets are available through the plugin facade if your tooling expects that shape:

```js
import { plugin } from '@stackrb/eslint-config';

export default plugin.configs.react;
```

`plugin.configs` also exposes `recommended` (identical to the default export), `node`, `browser`, `react`, `native`, and `expo`.

## Options at a glance

| Option | One-line purpose |
| --- | --- |
| `target` | Runtime(s) to lint for; defaults to `node`. |
| `extraIgnores` | Additional global ignore patterns. |
| `nodeVersion` | Override `settings.node.version` (default `>=20.19.0`). |
| `typed` | Enable type-aware rules with `parserOptions.projectService`. |
| `deprecations` | Symbols that `eslint-plugin-deprecate` should report. |
| `bannedDependencies` | Dependency names/patterns that `eslint-plugin-depend` should ban. |
| `extraGlobals` | Ambient globals for code files. |
| `extraRules` | Final rule overrides for code files, applied after every preset including Prettier. |

This table is a summary; [the reference](docs/reference.md#options) is the exhaustive source for types, defaults, and semantics, and the [how-to guide](docs/how-to-integrate.md) has worked examples.

## Scripts (this repository)

These scripts develop and verify the package itself; consuming projects do not need them.

| Script | Command |
| --- | --- |
| `build` | `tsup` |
| `typecheck` | `tsc --noEmit` |
| `test` | `vitest run test/unit test/integration test/e2e test/memory` |
| `test:unit` | `vitest run test/unit` |
| `test:integration` | `vitest run test/integration` |
| `test:e2e` | `vitest run test/e2e` |
| `test:memory` | `vitest run test/memory` |
| `test:perf` | `vitest bench --run test/performance` |
| `lint` | `npm run build && eslint .` |
| `docs` | `npm run build && mdaics && node scripts/clean-api-documents.mjs` |
| `docs:check` | regenerate the API reference and fail if it differs from the committed files |
| `audit` | `npm audit --audit-level=high` |
| `check` | `npm run typecheck && npm run test && npm run lint && npm run audit` |

Generating docs requires Node.js `>=22.17` (the `mdaics` dev dependency). Consumers are unaffected.

## Documentation

- [Tutorial](docs/tutorial.md) — learn by linting a TypeScript file from scratch.
- [How-to guide](docs/how-to-integrate.md) — recipes for integrating and customising the config.
- [Reference](docs/reference.md) — every option, export, glob, ignore, and rule source.
- [Explanation](docs/explanation.md) — design decisions and compatibility notes.
- [Generated API reference](docs/api/index.md) — one page per source module, produced from JSDoc by `mdaics` with `src:` and `dist:` line pointers. Run `npm run docs` after changing the public API.
