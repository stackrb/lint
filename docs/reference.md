# Reference

Technical description of the public API of `@stackrb/eslint-config` (version 0.1.0 plus the unreleased changes listed in the [changelog](../CHANGELOG.md)). For worked examples, see the [how-to guide](how-to-integrate.md).

## Requirements

| Requirement | Constraint |
| --- | --- |
| Node.js | `^20.19.0 \|\| ^22.13.0 \|\| >=24` (`engines`) |
| ESLint | `>=10.4.0` (peer dependency) |
| TypeScript | `>=4.8.4 <6.1.0` (optional peer; needed for TypeScript files and `typed: true`) |

## Exports

All exports come from the package root. Partials are functions that return `Linter.Config[]`; call them before spreading.

| Export | Kind | Description |
| --- | --- | --- |
| `default` | `Linter.Config[]` | `createConfig()` with no options — the `node` target with all defaults. |
| `createConfig(options?)` | function | Builds the complete config array from an `Options` object. |
| `plugin` | object | Plugin-shaped facade: `meta` exposes `name` (`@stackrb/eslint-config`), `namespace` (`stackrb`), and `version` (from `package.json`); `rules` is empty and `configs` holds the presets below. |
| `plugin.configs.recommended` | `Linter.Config[]` | Same as the default export (`createConfig()`). |
| `plugin.configs.node` / `.browser` / `.react` / `.native` / `.expo` | `Linter.Config[]` | `createConfig({ target: '<name>' })`. |
| `ignores(extraIgnores?)` | partial | Global ignores in a single `stackrb/ignores` block: the default list plus any extras. |
| `base(options?)` | partial | Core rules, plugins, presets, parser, and `settings.node.version`; option-driven `depend` and `deprecate` rules. |
| `javascript()` | partial | JSDoc recommended rules for JavaScript files. |
| `typescript(options?)` | partial | `typescript-eslint` recommended (plus type-aware rules when `typed: true`) and JSDoc TSDoc rules for TypeScript files. |
| `tests()` | partial | Vitest recommended rules and globals for test files. |
| `data(options?)` | partial | JSON, JSONC, and JSON5 language configs; dependency bans in JSON when `bannedDependencies` is set. |
| `markdown()` | partial | Markdown GFM recommended rules. |
| `shell()` | partial | `@eslint/shell` language for `.sh`/`.bash` with `shell/recommended` always enabled. |
| `prettier()` | partial | `eslint-config-prettier` flat config — disables rules that conflict with a formatter. |
| `node()` / `browser()` / `react()` / `native()` / `expo()` | partials | Target-specific globals and rules. |
| `Options`, `Target`, `DeprecationRule`, `DeprecationKind`, `GlobalValue` | type-only | Public TypeScript types. |

### Composition order

`createConfig(options)` assembles its array in this order:

1. `ignores(options.extraIgnores)`
2. `base(options)`
3. `javascript()`
4. `typescript(options)`
5. `tests()`
6. `data(options)`
7. `markdown()`
8. `shell()`
9. Target configs, in the order given in `target` after deduplication
10. A `stackrb/extra-globals` block with `files: [CODE_FILES]` and `languageOptions.globals` from `extraGlobals`, added only when `extraGlobals` is defined
11. `prettier()`
12. A final `stackrb/overrides` block with `files: [CODE_FILES]` and `rules` from `extraRules`, added only when `extraRules` is defined

## Options

Every property of `Options` is `readonly`.

| Option | Type | Default | Meaning |
| --- | --- | --- | --- |
| `target` | `Target \| readonly Target[]` | `'node'` | Runtime(s) the consuming package targets. `undefined` and `[]` both resolve to `node`. The set is deduplicated: a target implied by another selected target is dropped (for example `['native', 'expo']` becomes `['expo']`), but the surviving target still emits its full cumulative chain — the `expo` chain contains the `react` and `native` blocks. |
| `extraIgnores` | `readonly string[]` | `[]` | Extra patterns added to the global ignore list. |
| `nodeVersion` | `string` | `'>=20.19.0'` | Value for `settings.node.version`; prevents guessing from the consumer's `engines`. |
| `typed` | `boolean` | `false` | Enable type-aware rules via `parserOptions.projectService`. |
| `deprecations` | `readonly DeprecationRule[]` | `[]` (no rules enabled) | Deprecated symbols that `eslint-plugin-deprecate` should report. |
| `bannedDependencies` | `readonly string[]` | `[]` (rule not enabled) | Dependency names or patterns that `eslint-plugin-depend` should ban. |
| `extraGlobals` | `Readonly<Record<string, GlobalValue>>` | `undefined` | Additional ambient globals (for example `chrome`, `GM_xmlhttpRequest`), emitted as a `stackrb/extra-globals` block scoped to `CODE_FILES`. |
| `extraRules` | `Linter.RulesRecord` | `undefined` | Final rule overrides scoped to `CODE_FILES`, applied after every preset including Prettier. Scoping keeps a plugin rule from crashing JSON or Markdown linting. |

### Helper types

| Type | Definition |
| --- | --- |
| `Target` | `'node' \| 'browser' \| 'react' \| 'native' \| 'expo'` |
| `DeprecationKind` | `'function' \| 'import' \| 'member-expression'` |
| `DeprecationRule` | `{ readonly name: string; readonly use?: string; readonly kind?: DeprecationKind }` — `kind` defaults to `'function'`; `use` names the replacement. |
| `GlobalValue` | `boolean \| 'readonly' \| 'writable' \| 'off'` |

## Targets

| Target | Adds |
| --- | --- |
| `node` | `globals.node` and `globals.builtin`. |
| `browser` | `globals.browser` and `globals.builtin`; turns off `n/no-unsupported-features/node-builtins`. |
| `react` | `@eslint-react` recommended-typescript, `react-hooks` flat recommended, `jsx-a11y` recommended; browser and builtin globals. |
| `native` | Everything in `react`, plus `react-native/no-deep-imports`, `react-native/platform-colors`, and React Native globals. |
| `expo` | Everything in `native`, plus the Expo rules listed under [Rule sources](#rule-sources-by-plugin). |

Targets are cumulative: `expo` includes `native`, which includes `react`. Overlaps are deduplicated automatically — `createConfig` drops any selected target implied by another selected target, so `['native', 'expo']` emits a single `expo` chain containing the `react`, `native`, and `expo` blocks, not one lone block. Independent combinations such as `['node', 'browser']` apply both.

## File globs

| Glob | Constant | Applies to |
| --- | --- | --- |
| `**/*.{js,jsx,mjs,cjs}` | `JS_FILES` | `javascript()` (JSDoc rules) |
| `**/*.{ts,tsx,mts,cts}` | `TS_FILES` | `typescript()` |
| `**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}` | `CODE_FILES` | `base()` and every target |
| `**/*.{test,spec}.{js,jsx,mjs,cjs,ts,tsx,mts,cts}` | `TEST_FILES` | `tests()` |
| `**/*.json` | — | `data()` — `json/json` language |
| `**/*.jsonc` | — | `data()` — `json/jsonc` language |
| `**/*.json5` | — | `data()` — `json/json5` language |
| `**/*.md` | — | `markdown()` — `markdown/gfm` language |
| `**/*.{sh,bash}` | `SHELL_FILES` | `shell()` — `shell/bash` language and `shell/recommended` |

## Ignore list

`ignores()` always applies these patterns, plus anything passed in `extraIgnores`:

| Pattern |
| --- |
| `**/node_modules/**` |
| `**/dist/**` |
| `**/build/**` |
| `**/coverage/**` |
| `**/.vitest/**` |
| `**/test/results/**` |
| `**/cache/**` |
| `package-lock.json` |
| `.cache-dist-bak` |

## Rule sources by plugin

| Plugin / package | Config block | Contribution |
| --- | --- | --- |
| `@eslint/js` | `base` | `js/recommended` |
| `@typescript-eslint/parser` | `base` | Parser for all code files |
| `typescript-eslint` | `typescript` | `recommended`; `recommendedTypeChecked` when `typed: true` |
| `eslint-plugin-jsdoc` | `javascript`, `typescript` | `flat/recommended` for JS; `flat/recommended-tsdoc` for TS |
| `eslint-plugin-n` | `base` | `n/recommended-module` |
| `@deslint/eslint-plugin` | `base` | `recommended` |
| `eslint-plugin-de-morgan` | `base` | `recommended` |
| `eslint-plugin-sonarjs` | `base` | `recommended` |
| `eslint-plugin-security` | `base` | `recommended` |
| `eslint-plugin-regexp` | `base` | `recommended` |
| `eslint-plugin-promise` | `base` | `flat/recommended` |
| `eslint-plugin-perfectionist` | `base` | `recommended-natural` |
| `eslint-plugin-unicorn` | `base` | `recommended`, with `no-asterisk-prefix-in-documentation-comments` turned off |
| `@stylistic/eslint-plugin` | `base` | `recommended` |
| `@eslint-community/eslint-plugin-eslint-comments` | `base` | `no-duplicate-disable`, `no-unlimited-disable`, `no-unused-enable` |
| `eslint-plugin-depend` | `base`, `data` | `depend/ban-dependencies` — enabled only when `bannedDependencies` is non-empty |
| `eslint-plugin-deprecate` | `base` | `deprecate/function`, `deprecate/import`, `deprecate/member-expression` — enabled only when `deprecations` is non-empty |
| `@vitest/eslint-plugin` | `tests` | `recommended` plus test-environment globals |
| `@eslint/json` | `data` | `json/recommended` for JSON, JSONC, and JSON5 |
| `@eslint/markdown` | `markdown` | `markdown/gfm` language and `markdown/recommended` |
| `@eslint/shell` | `shell` | `shell/bash` language and `shell/recommended` (10 ShellCheck-inspired rules, always on) |
| `eslint-config-prettier` | `prettier` | Disables formatting-conflicting rules from all earlier presets |
| `@eslint-react/eslint-plugin` | `react` | `recommended-typescript` |
| `eslint-plugin-react-hooks` | `react` | `flat.recommended` |
| `eslint-plugin-jsx-a11y` | `react` | `recommended` |
| `@react-native/eslint-plugin` | `native` | `no-deep-imports`, `platform-colors` |
| `eslint-plugin-react-native-globals` | `native` | React Native ambient globals |
| `eslint-plugin-expo` | `expo` | `no-env-var-destructuring`, `no-dynamic-env-var`, `use-dom-exports` (errors) and `prefer-box-shadow` (warning) |
| `globals` | `node`, `browser`, `react` | Node.js, browser, and builtin ambient globals |

Unused `eslint-disable` directives are reported by ESLint's core `linterOptions.reportUnusedDisableDirectives: true` in `base`; this replaces the removed `@eslint-community/eslint-comments/no-unused-disable` rule.

## Compatibility notes

The full reasoning lives in [Compatibility caveats](explanation.md#compatibility-caveats); the short version:

- Consumers do not need `legacy-peer-deps`. It is set only in this repository's `.npmrc`, because here ESLint and the stale-peer plugins are direct dev dependencies; in a consuming package those plugins are transitive.
- `unicorn/no-asterisk-prefix-in-documentation-comments` is off to avoid circular autofixes with `jsdoc/check-alignment`.
- React and React Native coverage uses ESLint-10-compatible plugins (`@eslint-react/eslint-plugin@5`, `eslint-plugin-react-hooks@7`, `@react-native/eslint-plugin`) instead of `eslint-plugin-react@7`.
