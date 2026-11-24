# Tutorial: lint your first TypeScript file

This lesson takes you from an empty folder to a passing ESLint run on a TypeScript file. You will install the package, write the one-line config, see a real error, and fix it.

## What you will need

- Node.js 20.19+, 22.13+, or 24+
- A terminal and a text editor

No prior ESLint flat-config experience is required.

## 1. Create a scratch project

```sh
mkdir my-lint-demo
cd my-lint-demo
npm init -y
```

## 2. Install the tools

```sh
npm install --save-dev eslint @stackrb/eslint-config typescript
```

`eslint` and `@stackrb/eslint-config` are required. `typescript` is an optional peer of this package, but you need it to lint `.ts` files. No extra npm configuration is needed — the bundled plugins are transitive dependencies here, so a normal install succeeds.

## 3. Add the ESLint config

Create `eslint.config.mjs` in the project root:

```js
import config from '@stackrb/eslint-config';

export default config;
```

This is the whole configuration. The default export is `createConfig()` with no options, which means the `node` target with sensible defaults for JavaScript, TypeScript, tests, JSON, and Markdown.

## 4. Write a TypeScript file with a mistake

Create `src/greet.ts`:

```ts
/** Greet a person by name. */
export function greet(name: string): string {
  const unused = 42;
  return `Hello, ${name}!`;
}
```

The `unused` variable is never read. TypeScript-aware linting is not even needed for this rule to fire.

## 5. Lint it

```sh
npx eslint src/greet.ts
```

You should see an error similar to:

```text
src/greet.ts
  3:9  error  'unused' is assigned a value but never used  @typescript-eslint/no-unused-vars

✖ 1 problem (1 error, 0 warnings)
```

The rule comes from the `typescript` part of the config, which applies `typescript-eslint`'s recommended rules to `**/*.{ts,tsx,mts,cts}` files.

## 6. Fix the file and lint again

Remove the unused line:

```ts
/** Greet a person by name. */
export function greet(name: string): string {
  return `Hello, ${name}!`;
}
```

Re-run the command:

```sh
npx eslint src/greet.ts
```

No output means success — ESLint exits with code 0 when there are no problems. You have now gone from an empty folder to clean, linted TypeScript.

## What just happened

When ESLint started, it loaded your array of configs in this order:

1. Global ignores (so `node_modules`, `dist`, and other generated folders were skipped).
2. The base layer (core JavaScript rules, parsing, and shared settings).
3. JavaScript, TypeScript, test, JSON, and Markdown layers, each limited to its own file globs.
4. The `node` target, which added Node.js globals.
5. Prettier compatibility, which switched off rules that fight your formatter.

Because the config is an array, later entries can refine earlier ones. That is what lets a single import cover many file types without rules bleeding into the wrong language.

## Where to go next

- [How-to guide](how-to-integrate.md) — choose a different target, customise rules, enable type-aware linting, or flag deprecated APIs.
- [Reference](reference.md) — every option, export, glob, and rule source.
- [Explanation](explanation.md) — why the package is shaped this way.
