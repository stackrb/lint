# Explanation

This document explains why `@stackrb/eslint-config` is built the way it is. It is background reading, not a set of instructions — use the [how-to guide](how-to-integrate.md) for recipes and the [reference](reference.md) for exact API details.

## A shareable config, not a rule plugin

The `plugin` export looks like an ESLint plugin — it has `meta` (`name`, `namespace: 'stackrb'`, and `version` from `package.json`), `configs`, and a `rules` key — but `rules` is deliberately empty. The package does not invent new lint rules. Its value is the *arrangement* of rules that already exist in well-maintained plugins: which presets to enable, which files they apply to, which globals are in scope, and which conflicting rules to switch off.

That distinction matters for how you consume it:

- A rule plugin contributes rules you reference by name in your own config.
- A shareable config contributes a ready-made `Linter.Config[]` array you export directly.

Because this package is the latter, the shortest path is the one-import API, re-exported directly:

```js
export { default } from '@stackrb/eslint-config';
```

The direct re-export is the same single import; it avoids `unicorn/prefer-export-from`, which would otherwise flag an import-then-export pair in `eslint.config.mjs`.

The `plugin` facade exists for tooling and consumers that prefer preset names (`plugin.configs.react` and friends). It points at the very same arrays produced by `createConfig`, so the two styles cannot drift apart.

## Why options replace hardcoded monorepo paths

The original internal config was written for one repository. It assumed that repository's directory layout, its supported Node version, and its list of deprecated or forbidden packages. Those assumptions are exactly what make a config hard to share: a path that is correct in a monorepo is meaningless in a standalone package.

Version 0.1.0 turns those assumptions into explicit options:

- `extraIgnores` and `extraRules` are escape hatches for layout- and policy-specific decisions. The consumer supplies them; the preset does not guess.
- `nodeVersion` sets `settings.node.version` directly instead of inferring it from the consumer's `engines` field. Inference is convenient but surprising when `engines` is broad or absent.
- `deprecations` and `bannedDependencies` are option-driven rather than hardcoded. They are inactive by default, so adopting the config never silently bans a dependency the consumer still needs.
- `target` replaces assumptions about where code runs. A package that ships both a Node server and a browser client can declare both runtimes.

The result is a preset with no knowledge of any particular repository, and therefore one that behaves the same wherever it is installed.

## Why targets are cumulative

`react`, `native`, and `expo` are not independent alternatives. A React Native app is a React app with additional globals and rules; an Expo app is a React Native app with a few more rules. Encoding that relationship once keeps each target small and avoids contradictory settings.

The full per-target breakdown is in the [Targets table](reference.md#targets); this document covers only the reasoning.

The practical consequence: `createConfig` deduplicates the target set before building configs. If a selected target is implied by another selected target, it is removed — but the surviving target still emits its complete chain. So `['native', 'expo']` produces a single `expo` chain containing the `react`, `native`, and `expo` blocks (not one lone block), and `['react', 'native']` produces a single `native` chain. Combining genuinely independent targets such as `['node', 'browser']` still applies both.

## Why composition order is deliberate

`createConfig` always builds its array in the same sequence, because later configs can override earlier ones in ESLint flat config:

1. **Global ignores** come first so excluded directories are skipped before any rules are considered.
2. **Base** establishes parsing, shared settings, and the broad plugin presets for all code files.
3. **Language layers** — JavaScript, TypeScript, tests, data, and Markdown — each narrow to their own globs so a rule meant for one language never fires in another.
4. **Target configs** add the runtime-specific globals and rules after overlapping targets are deduplicated.
5. **Extra globals** (when `extraGlobals` is set) add ambient globals for code files.
6. **Prettier compatibility** runs after every rule-producing preset, so it can turn off formatting rules from all of them.
7. **`extraRules`** comes last. If a consumer explicitly overrides a rule, that decision wins over everything the preset chose.

Both `extraGlobals` and `extraRules` are scoped to `CODE_FILES`. That scoping keeps a plugin rule from crashing JSON or Markdown linting, and keeps ambient globals out of non-code files.

This order is the reason a single import can cover many languages without conflicts, and why `extraRules` is the documented way to customise behavior.

## Why type-aware linting is opt-in

Type-aware rules use `typescript-eslint`'s `recommendedTypeChecked` preset and set `parserOptions.projectService: true`. That requires a TypeScript project covering the linted files and costs more to run than syntax-only linting.

Most consumers want a config that works immediately after `npm install`, so `typed` defaults to `false`. Projects that need rules such as no-floating-promises or await-thenable can opt in with `typed: true` once their `tsconfig.json` is in place. TypeScript itself is an optional peer dependency for the same reason: a JavaScript-only project should not have to install it.

## Why file globs are split

A single "all files" glob would apply every plugin to every file. Instead the config uses four code globs plus language-specific ones:

- `JS_FILES` (`**/*.{js,jsx,mjs,cjs}`) carries JSDoc's JavaScript recommended rules.
- `TS_FILES` (`**/*.{ts,tsx,mts,cts}`) carries `typescript-eslint` and JSDoc's TSDoc rules.
- `TEST_FILES` (`**/*.*{test,spec}.{js,jsx,mjs,cjs,ts,tsx,mts,cts}`) carries both Vitest and Playwright recommended rules and globals, so either test framework is covered without extra configuration.
- `CODE_FILES` (`**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}`) carries the shared base rules and all target globals.

JSON, JSONC, JSON5, and Markdown each get their own language config from `@eslint/json` and `@eslint/markdown`; shell scripts (`SHELL_FILES`, `**/*.{sh,bash}`) get `@eslint/shell` with the `shell/bash` language and its `shell/recommended` rules. Shell is a language, not a runtime target, so it is enabled unconditionally for matching files. Splitting the globs is what allows, for example, Node globals on a `.js` file and Vitest globals in a `.test.ts` file without either leaking into the wrong place.

## Compatibility caveats

### Peer ranges and `legacy-peer-deps`

The package requires ESLint 10.4 or newer and Node.js 20.19+, 22.13+, or 24+. TypeScript is an optional peer in the range `>=4.8.4 <6.1.0`.

`eslint-plugin-deprecate@0.9.0` and `eslint-plugin-jsx-a11y` declare stale ESLint peer ranges, while other bundled plugins require ESLint 10. npm enforces those ranges only when the plugins are direct dependencies of the root project. In a consuming package they are transitive, so a plain `npm install` succeeds and the one-import config lints cleanly — no extra npm flag or `.npmrc` is needed.

This repository does set `legacy-peer-deps=true` in its own `.npmrc`, because here ESLint and the stale-peer plugins are all direct dependencies of the development install. That setting is a development-only workaround, not a requirement for consumers and not a change to the rules that run.

### Unicorn and JSDoc autofixes

The exported config disables `unicorn/no-asterisk-prefix-in-documentation-comments`. `jsdoc/check-alignment` re-adds the leading asterisks that the Unicorn rule strips, so leaving both enabled makes ESLint's autofixes loop in downstream projects.

### React and React Native plugin choices

`eslint-plugin-react@7` is not compatible with ESLint 10. React coverage is therefore built on `@eslint-react/eslint-plugin@5` together with `eslint-plugin-react-hooks@7`, and JSX accessibility comes from `eslint-plugin-jsx-a11y`. React Native coverage uses `@react-native/eslint-plugin` for the same reason, which is why the `native` target's rules come from that plugin rather than from a React Native ruleset in `eslint-plugin-react`.

### Known dependency advisories

Snapshot as of the 0.1.0 release (2026-11-24): `npm audit` reports five advisories — three low and two moderate, none high or critical — so the `audit` script (gated at `high`) passes. All five are **transitive**: the vulnerable packages are `katex` and `minimatch`, reached through the direct dependencies `@eslint/markdown` and `eslint-plugin-sonarjs` respectively. `npm audit fix --force` proposes breaking upgrades of those direct dependencies to versions that may not support ESLint 10, so the proposed fix is deliberately not applied. Re-run the audit on each dependency update and adopt upstream fixes when compatible.

### Corrections carried into the initial release

The original internal config had several mistakes that prevented rules from taking effect: the JavaScript file glob did not actually match JavaScript files, the test-file glob contained a typo, and Vitest rules were not actually enabled. The unicorn, stylistic, depend, and deprecate plugins were present but not functional. Version 0.1.0 ships with these corrected; see the [changelog](../CHANGELOG.md) for the list.

## Generated API reference

The hand-written docs follow Diátaxis and explain how to use the package. They are complemented by `docs/api/`, generated from JSDoc by [`mdaics`](https://www.npmjs.com/package/mdaics): one Markdown page per source module, with the resolved parameter types and `src:`/`dist:` line pointers into the built artifact. The generator is configured in `mdaics.config.mjs` to write to `docs/api` rather than `docs`, so it never overwrites the authored guides. `npm run docs` builds first (the `dist:` pointers need a real build and source map) and then normalises an internal TypeScript type name in the output; `npm run docs:check` regenerates and fails if the committed files are stale. The generator is a dev-only tool requiring Node.js 22.17 or newer. The build uses `tsc` with a dedicated `tsconfig.build.json`, so `dist/` mirrors `src/` and `mdaics` can resolve exact `dist:` pointers for each module.

## Future improvements

Ideas under consideration — none are part of the current API or a commitment to implement:

- Lazy/subpath plugin loading so consumers load only the plugins their target needs.
- A composer-style API for assembling configs in explicit phases.
- Runtime validation of option values with clear error messages.
- A `tsconfigRootDir` option for type-aware projects outside the config directory.
- Per-file-type React scoping instead of one broad React glob.
- Replacing `eslint-plugin-jsx-a11y` with `jsx-a11y-x` and `eslint-plugin-deprecate` with `@e18e/deprecate` once compatible.
- npm `overrides` to clear the transitive advisories without breaking upgrades.
- A documented versioning policy for when presets change.
- Node 20 CI coverage alongside the current Node versions.
- SHA-pinned GitHub Actions in CI.
- Stored performance baselines to guard against config-construction regressions.
