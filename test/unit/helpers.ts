import type { Linter } from 'eslint';

export function configNamed(configs: readonly Linter.Config[], name: string): Linter.Config {
  const config = configs.find((item) => item.name === name);
  if (config === undefined) {
    throw new Error(`Config "${name}" was not found`);
  }
  return config;
}

export function pluginNames(configs: readonly Linter.Config[]): Set<string> {
  const names = new Set<string>();
  for (const config of configs) {
    for (const name of Object.keys(config.plugins ?? {})) {
      names.add(name);
    }
  }
  return names;
}

export function ruleEntries(
  configs: readonly Linter.Config[],
): Map<string, Linter.RuleEntry<unknown[]> | undefined> {
  const entries = new Map<string, Linter.RuleEntry<unknown[]> | undefined>();
  for (const config of configs) {
    for (const [name, entry] of Object.entries(config.rules ?? {})) {
      if (entry !== undefined) {
        entries.set(name, entry);
      }
    }
  }
  return entries;
}

// Extended configs are generated implementation details; ignores blocks may be renamed.
export function topLevelNames(configs: readonly Linter.Config[]): string[] {
  return configs
    .filter((config) => config.ignores === undefined)
    .map((config) => config.name)
    .filter((name): name is string => name !== undefined && name.startsWith('stackrb/') && !name.includes(' > '));
}
