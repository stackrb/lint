import type { Linter } from 'eslint';

export function bannedDependenciesRule(modules: readonly string[]): Linter.RulesRecord {
  return { 'depend/ban-dependencies': ['error', { modules: [...modules] }] };
}
