# Changelog

All notable changes to `@stackrb/eslint-config` are recorded in this file. The format follows Keep a Changelog conventions and the project adheres to Semantic Versioning.

## 0.1.0 - 2026-11-25

Initial public release.

### Added

- `createConfig(options)` for building a complete `Linter.Config[]` from options.
- A default export equal to `createConfig()` — the one-import API: `export { default } from '@stackrb/eslint-config';`.
- A `plugin` facade with `configs.recommended`, `configs.node`, `configs.browser`, `configs.react`, `configs.native`, and `configs.expo`.
- Five targets: `node`, `browser`, `react`, `native`, and `expo`, with `native` building on `react` and `expo` building on `native`.
- Options: `target`, `extraIgnores`, `nodeVersion`, `typed`, `deprecations`, `bannedDependencies`, `extraGlobals`, and `extraRules`.
- Named partial exports for composition: `ignores`, `base`, `javascript`, `typescript`, `tests`, `playwright`, `data`, `markdown`, `shell`, `prettier`, `node`, `browser`, `react`, `native`, and `expo`.
- Exported types: `Options`, `Target`, `DeprecationRule`, `DeprecationKind`, and `GlobalValue`.
- Coverage for JavaScript, TypeScript, Vitest and Playwright test files, JSON/JSONC/JSON5, Markdown, and shell scripts (`.sh`, `.bash`), plus type-aware linting via `parserOptions.projectService`.
- `plugin.meta` exposes `namespace: 'stackrb'` and `version` (read from `package.json`) alongside `name`.
- The global-ignores config block is named `stackrb/ignores` instead of a generated `globalIgnores N` name.
- Shell linting via `@eslint/shell` with `shell/recommended`, always enabled for shell files.
- Playwright linting via `eslint-plugin-playwright`'s `flat/recommended`, always enabled for test files.
- Generated API reference under `docs/api/`, produced from JSDoc by `mdaics` via the `docs` script, with a `docs:check` CI guard.
- Documentation: this changelog, a README, a tutorial, how-to, reference, explanation, generated API pages, and a runnable consumer example.

### Changed

- `plugin.configs.node` reuses the default export array instead of building a separate, structurally identical array. Treat returned configs as immutable.
- Untyped TypeScript configs omit the empty `languageOptions` object; merged rule and parser behavior is unchanged.

### Fixed

These issues were corrected before the first published release:

- `JS_FILES` matches JavaScript files (`js`, `jsx`, `mjs`, `cjs`) instead of pointing at TypeScript files.
- The test-file glob typo was fixed, so `TEST_FILES` matches `*.test.*` and `*.spec.*` files with code extensions (`js`, `jsx`, `mjs`, `cjs`, `ts`, `tsx`, `mts`, `cts`) — not every `*.test.*` filename.
- Vitest rules are genuinely enabled on test files.
- `eslint-plugin-unicorn`, `@stylistic/eslint-plugin`, `eslint-plugin-depend`, and `eslint-plugin-deprecate` are functional, with dependency bans and deprecation checks driven by the `bannedDependencies` and `deprecations` options.
- `@eslint-community/eslint-comments/no-unused-disable` was replaced with ESLint's core `linterOptions.reportUnusedDisableDirectives: true`; the other three eslint-comments rules remain enabled.
- Cumulative targets are deduplicated: `['native', 'expo']` produces a single `expo` chain containing the `react`, `native`, and `expo` blocks rather than overlapping duplicate chains.
- `extraGlobals` and `extraRules` are scoped to `CODE_FILES`, and `extraRules` is applied after Prettier so overrides win without affecting JSON or Markdown linting.
- `unicorn/no-asterisk-prefix-in-documentation-comments` is off to avoid circular autofixes with `jsdoc/check-alignment`.
- A `deprecations` entry no longer crashes when `use` is omitted; a bare `{ name: 'oldApi' }` entry is accepted.
- Shared globals are hoisted during config assembly, making non-node config construction roughly an order of magnitude faster.
- The source was consolidated from 19 to 10 modules without changing the public API or emitted rules.
