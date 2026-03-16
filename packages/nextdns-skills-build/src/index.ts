/**
 * nextdns-skills-build — public programmatic API
 *
 * Re-exports types, configuration, parser, and shared utilities so
 * external consumers can import them with full TypeScript types.
 */
export type {
  CodeExample,
  DocumentReference,
  GuidelinesDocument,
  ImpactLevel,
  Rule,
  RuleType,
  Section,
} from './types.js';

export { collectRuleFiles } from './utils.js';

export { parseRuleFile } from './parser.js';
export type { RuleFile } from './parser.js';

export {
  BUILD_DIR,
  DEFAULT_SKILL,
  SKILLS,
  SKILLS_DIR,
} from './config.js';
export type { SkillConfig } from './config.js';
