# Changelog

All notable changes to `@stackrb/eslint-config` are recorded in this file. The format follows Keep a Changelog conventions and the project adheres to Semantic Versioning.

## Unreleased

A behavior-preserving source refactor. The public API — default export, `createConfig(options)`, `plugin.configs.*`, all 13 partials, and the types — is unchanged.

### Added

- `plugin.meta` now exposes `namespace: 'stackrb'` and `version` (read from `package.json`) alongside `name`.
- The global-ignores config block is named `stackrb/ignores` instead of a generated `globalIgnores N` name.
- Generated API reference under `docs/api/`, produced from JSDoc by `mdaics` via the `docs` script, with a `docs:check` CI guard.

### Changed

- `plugin.configs.node` now reuses the default export array instead of building a separate, structurally identical array. Mutating a returned config now affects both entry points; treat configs as immutable.
- Untyped TypeScript configs omit the empty `languageOptions` object; merged rule and parser behavior is unchanged.

### Fixed

- A `deprecations` entry no longer crashes when `use` is omitted: a bare `{ name: 'oldApi' }` entry is accepted, and the deprecate rule reports the symbol without suggesting a replacement.
- Shared globals are hoisted during config assembly; behavior is unchanged.

## 0.1.0 - 2026-11-24

Initial release.

### Added

- `createConfig(options)` for building a complete `Linter.Config[]` from options.
- A default export equal to `createConfig()` — the one-import API: `export { default } from '@stackrb/eslint-config';`.
- A `plugin` facade with `configs.recommended`, `configs.node`, `configs.browser`, `configs.react`, `configs.native`, and `configs.expo`.
- Five targets: `node`, `browser`, `react`, `native`, and `expo`, with `native` building on `react` and `expo` building on `native`.
- Options: `target`, `extraIgnores`, `nodeVersion`, `typed`, `deprecations`, `bannedDependencies`, `extraGlobals`, and `extraRules`.
- Named partial exports for composition: `ignores`, `base`, `javascript`, `typescript`, `tests`, `data`, `markdown`, `prettier`, `node`, `browser`, `react`, `native`, and `expo`.
- Exported types: `Options`, `Target`, `DeprecationRule`, `DeprecationKind`, and `GlobalValue`.
- Coverage for JavaScript, TypeScript, test files, JSON/JSONC/JSON5, and Markdown, plus type-aware linting via `parserOptions.projectService`.
- Documentation: this changelog, a README, and a tutorial, how-to, reference, and explanation under `docs/`.

### Fixed

These issues were corrected in the original internal config before this first published release, so 0.1.0 ships with them resolved:

- `JS_FILES` now actually matches JavaScript files (`js`, `jsx`, `mjs`, `cjs`) instead of pointing at TypeScript files.
- The test-file glob typo was fixed, so `TEST_FILES` matches `*.test.*` and `*.spec.*` files with code extensions (`js`, `jsx`, `mjs`, `cjs`, `ts`, `tsx`, `mts`, `cts`) — not every `*.test.*` filename.
- Vitest rules are now genuinely enabled on test files.
- `eslint-plugin-unicorn`, `@stylistic/eslint-plugin`, `eslint-plugin-depend`, and `eslint-plugin-deprecate` are now functional, with dependency bans and deprecation checks driven by the `bannedDependencies` and `deprecations` options.
- Replaced `@eslint-community/eslint-comments/no-unused-disable` with ESLint's core `linterOptions.reportUnusedDisableDirectives: true`; the other three eslint-comments rules remain enabled.
- Cumulative targets are deduplicated: `['native', 'expo']` produces a single `expo` chain containing the `react`, `native`, and `expo` blocks rather than overlapping duplicate chains.
- `extraGlobals` and `extraRules` are scoped to `CODE_FILES`, and `extraRules` is applied after Prettier so overrides win without affecting JSON or Markdown linting.
- `unicorn/no-asterisk-prefix-in-documentation-comments` is off to avoid circular autofixes with `jsdoc/check-alignment`.
