import type { Linter } from 'eslint';

import { defineConfig } from 'eslint/config';

import type { Options, Target } from './types.js';

import packageJson from '../package.json' with { type: 'json' };
import { base } from './configs/base.js';
import { data, javascript, markdown, typescript } from './configs/languages.js';
import { ignores, prettier, tests } from './configs/misc.js';
import { CODE_FILES } from './constants.js';
import { expo, native } from './targets/mobile.js';
import { react } from './targets/react.js';
import { browser, node } from './targets/runtime.js';

const TARGETS: Record<Target, { build: () => Linter.Config[]; includes: readonly Target[] }> = {
  browser: { build: browser, includes: [] },
  expo: { build: expo, includes: ['native', 'react'] },
  native: { build: native, includes: ['react'] },
  node: { build: node, includes: [] },
  react: { build: react, includes: [] },
};

function normalizeTargets(target: Options['target']): readonly Target[] {
  let list: readonly Target[];
  if (target === undefined) {
    list = ['node'];
  } else if (typeof target === 'string') {
    list = [target];
  } else {
    list = target;
  }

  const selected = new Set<Target>(list.length === 0 ? ['node'] : list);

  // Iterate a snapshot: deleting an explicitly-selected dependency while walking
  // the live set would skip later entries and change insertion order.
  const snapshot = [...selected];
  for (const name of snapshot) {
    const { includes } = TARGETS[name];
    for (const dependency of includes) {
      selected.delete(dependency);
    }
  }

  return [...selected];
}

/**
 * Builds the complete ESLint flat config in the documented composition order.
 * @param options - Targets, ignores, globals, rules and other customisations.
 * @returns {Array} The ordered config blocks consumed by ESLint.
 */
export function createConfig(options: Options = {}): Linter.Config[] {
  const targets = normalizeTargets(options.target);
  const targetConfigs = targets.flatMap((target) => TARGETS[target].build());

  return defineConfig([
    ...ignores(options.extraIgnores),
    base(options),
    javascript(),
    typescript(options),
    tests(),
    data(options),
    markdown(),
    ...targetConfigs,
    ...(options.extraGlobals === undefined
      ? []
      : [{ files: [CODE_FILES], languageOptions: { globals: { ...options.extraGlobals } }, name: 'stackrb/extra-globals' }]),
    // Prettier follows every preset so its rule-disabling wins; only explicit overrides come after.
    prettier(),
    ...(options.extraRules === undefined
      ? []
      : [{ files: [CODE_FILES], name: 'stackrb/overrides', rules: options.extraRules }]),
  ]);
}

const defaultConfig = createConfig();
const presetConfigs: Partial<Record<'recommended' | Target, Linter.Config[]>> = {
  node: defaultConfig,
  recommended: defaultConfig,
};

function preset(name: 'recommended' | Target): Linter.Config[] {
  const cached = presetConfigs[name];
  if (cached !== undefined) {
    return cached;
  }

  const built = createConfig(name === 'recommended' ? {} : { target: name });
  presetConfigs[name] = built;
  return built;
}

/**
 * Plugin-shaped facade exposing lazily built, cached presets for `extends`.
 */
export const plugin = {
  configs: {
    get browser() {
      return preset('browser');
    },
    get expo() {
      return preset('expo');
    },
    get native() {
      return preset('native');
    },
    get node() {
      return preset('node');
    },
    get react() {
      return preset('react');
    },
    get recommended() {
      return preset('recommended');
    },
  },
  meta: { name: '@stackrb/eslint-config', namespace: 'stackrb', version: packageJson.version },
  rules: {},
} as const;

export default defaultConfig;

export { base } from './configs/base.js';
export { data, javascript, markdown, typescript } from './configs/languages.js';
export { ignores, prettier, tests } from './configs/misc.js';
export { expo, native } from './targets/mobile.js';
export { react } from './targets/react.js';
export { browser, node } from './targets/runtime.js';
export type { DeprecationKind, DeprecationRule, GlobalValue, Options, Target } from './types.js';
