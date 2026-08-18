/**
 * nextdns-skills-build — public programmatic API
 *
 * Re-exports types, configuration, parser, and shared utilities so
 * external consumers can import them with full TypeScript types.
 */

export type { SkillConfig } from './core/config.js';
export { BUILD_DIR, DEFAULT_SKILL, SKILLS, SKILLS_DIR } from './core/config.js';
export {
  BuildCliOptionsSchema,
  ExportCliOptionsSchema,
  MigrateCliOptionsSchema,
  SearchCliOptionsSchema,
  SkillCommandCliOptionsSchema,
  parseBuildCliOptions,
  parseExportCliOptions,
  parseMigrateCliOptions,
  parseSearchCliOptions,
  parseSkillCommandCliOptions,
} from './core/cli-validation.js';
export type {
  BuildCliOptions,
  ExportCliOptions,
  MigrateCliOptions,
  SearchCliOptions,
  SkillCommandCliOptions,
} from './core/cli-validation.js';
export {
  BuildMetadataSchema,
  FrontmatterSchema,
  FrontmatterValueSchema,
  PackageMetadataSchema,
  parseBuildMetadata,
  parseFrontmatter,
  parsePackageMetadata,
} from './core/data-schemas.js';
export type {
  BuildMetadata,
  Frontmatter,
  FrontmatterValue,
  PackageMetadata,
} from './core/data-schemas.js';
export type {
  Frontmatter as MarkdownFrontmatter,
  FrontmatterValue as MarkdownFrontmatterValue,
  MarkdownCodeBlock,
  MarkdownLink,
} from './core/markdown.js';
export {
  collectCodeBlocks,
  collectLinks,
  collectMarkdownFiles,
  findFirstHeading,
  findHeadings,
  getDocumentNodes,
  getText,
  parseFrontmatterNode,
  parseMarkdown,
  parseMarkdownFrontmatter,
} from './core/markdown.js';
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
