/**
 * nextdns-skills-build — public programmatic API
 *
 * Re-exports types, configuration, parser, and shared utilities so
 * external consumers can import them with full TypeScript types.
 */

export type { SkillConfig } from './core/config.js';
export { BUILD_DIR, DEFAULT_SKILL, SKILLS, SKILLS_DIR } from './core/config.js';
export type { Frontmatter, FrontmatterValue } from './core/markdown.js';
export { collectMarkdownFiles, parseFrontmatter } from './core/markdown.js';
export type { RuleFile } from './core/parser.js';
export { parseRuleFile } from './core/parser.js';
export type {
  CodeExample,
  DocumentReference,
  GuidelinesDocument,
  ImpactLevel,
  Rule,
  RuleType,
  Section,
} from './core/types.js';
export { collectRuleFiles } from './core/utils.js';
export { getPackageVersion } from './core/version.js';
