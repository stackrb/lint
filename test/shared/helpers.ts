import type { Linter } from 'eslint';

export function ruleIsEnabled(entry: Linter.RuleEntry | undefined): boolean {
  if (entry === undefined) {
    return false;
  }
  const level = Array.isArray(entry) ? entry[0] : entry;
  return level === 1 || level === 2 || level === 'warn' || level === 'error';
}

export function messageRuleIds(messages: readonly Linter.LintMessage[]): string[] {
  return messages.flatMap((message) => (message.ruleId === null ? [] : [message.ruleId]));
}
