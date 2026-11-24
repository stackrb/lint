import type { Linter } from 'eslint';

import { defineConfig } from 'eslint/config';

import type { Options, Target } from './types.js';

import { base } from './configs/base.js';
import { data } from './configs/data.js';
import { ignores } from './configs/ignores.js';
import { javascript } from './configs/javascript.js';
import { markdownConfig } from './configs/markdown.js';
import { prettierConfig } from './configs/prettier.js';
import { tests } from './configs/tests.js';
import { typescriptConfig } from './configs/typescript.js';
import { CODE_FILES } from './constants.js';
import { browserTarget } from './targets/browser.js';
import { expoTarget } from './targets/expo.js';
import { nativeTarget } from './targets/native.js';
import { nodeTarget } from './targets/node.js';
import { reactTarget } from './targets/react.js';

const TARGETS: Record<Target, (options: Options) => Linter.Config[]> = {
  browser: browserTarget,
  expo: expoTarget,
  native: nativeTarget,
  node: nodeTarget,
  react: reactTarget,
};

const TARGET_DEPENDENCIES: Record<Target, readonly Target[]> = {
  browser: [],
  expo: ['native', 'react'],
  native: ['react'],
  node: [],
  react: [],
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

  const names = [...selected];
  const dependencies = names.flatMap((name) => TARGET_DEPENDENCIES[name]);
  for (const dependency of dependencies) {
    selected.delete(dependency);
  }

  return [...selected];
}

export function createConfig(options: Options = {}): Linter.Config[] {
  const targets = normalizeTargets(options.target);
  const targetConfigs = targets.flatMap((target) => TARGETS[target](options));

  return defineConfig([
    ...ignores(options.extraIgnores),
    base(options),
    javascript(),
    typescriptConfig(options),
    tests(),
    data(options),
    markdownConfig(),
    ...targetConfigs,
    ...(options.extraGlobals === undefined
      ? []
      : [{ files: [CODE_FILES], languageOptions: { globals: { ...options.extraGlobals } }, name: 'stackrb/extra-globals' }]),
    prettierConfig(),
    ...(options.extraRules === undefined
      ? []
      : [{ files: [CODE_FILES], name: 'stackrb/overrides', rules: options.extraRules }]),
  ]);
}

const defaultConfig = createConfig();
const presetCache = new Map<string, Linter.Config[]>([['recommended', defaultConfig]]);

function preset(name: string, target?: Target): Linter.Config[] {
  const cached = presetCache.get(name);
  if (cached !== undefined) {
    return cached;
  }

  const built = createConfig(target === undefined ? {} : { target });
  presetCache.set(name, built);
  return built;
}

export const plugin = {
  configs: {
    get browser() {
      return preset('browser', 'browser');
    },
    get expo() {
      return preset('expo', 'expo');
    },
    get native() {
      return preset('native', 'native');
    },
    get node() {
      return preset('node', 'node');
    },
    get react() {
      return preset('react', 'react');
    },
    get recommended() {
      return preset('recommended');
    },
  },
  meta: { name: '@stackrb/eslint-config' },
  rules: {},
} as const;

export default defaultConfig;

export { base } from './configs/base.js';
export { data } from './configs/data.js';
export { ignores } from './configs/ignores.js';
export { javascript } from './configs/javascript.js';
export { markdownConfig as markdown } from './configs/markdown.js';
export { prettierConfig as prettier } from './configs/prettier.js';
export { tests } from './configs/tests.js';
export { typescriptConfig as typescript } from './configs/typescript.js';
export { browserTarget as browser } from './targets/browser.js';
export { expoTarget as expo } from './targets/expo.js';
export { nativeTarget as native } from './targets/native.js';
export { nodeTarget as node } from './targets/node.js';
export { reactTarget as react } from './targets/react.js';
export type { DeprecationKind, DeprecationRule, GlobalValue, Options, Target } from './types.js';
