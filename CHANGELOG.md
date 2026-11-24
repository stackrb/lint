# Changelog

All notable changes to `@stackrb/eslint-config` are recorded in this file. The format follows Keep a Changelog conventions and the project adheres to Semantic Versioning.

## 0.1.0 - 2026-11-24

Initial release.

### Added

- `createConfig(options)` for building a complete `Linter.Config[]` from options.
- A default export equal to `createConfig()` — the one-import API: `import config from '@stackrb/eslint-config'; export default config;`.
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
- The test-file glob typo was fixed, so `TEST_FILES` matches `*.test.*` and `*.spec.*` files.
- Vitest rules are now genuinely enabled on test files.
- `eslint-plugin-unicorn`, `@stylistic/eslint-plugin`, `eslint-plugin-depend`, and `eslint-plugin-deprecate` are now functional, with dependency bans and deprecation checks driven by the `bannedDependencies` and `deprecations` options.
