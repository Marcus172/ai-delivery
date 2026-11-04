import type { Rule } from "../../scripts/denylist";

/**
 * Denylist assertions must be boolean. `expect(text).not.toMatch(rule.pattern)` prints the regex on failure,
 * i.e. the private term, into public CI logs. Assert on this and pass only `rule.label` as the message.
 */
export function matchesRule(rule: Rule, text: string): boolean {
  rule.pattern.lastIndex = 0;
  return rule.pattern.test(text);
}
