/**
 * nextdns-skills-scripts — public programmatic API
 *
 * Re-exports shared utilities so other packages and tests can import
 * them without going through the dist paths directly.
 */
export { collectRuleFiles, parseFrontmatter, walkDir } from './core/utils.js';
export type { AuditCheck, AuditReport } from './commands/audit.js';
export { formatAuditText, runAudit } from './commands/audit.js';
export {
  AuditCheckSchema,
  AuditReportSchema,
  parseAuditReport,
  parseStatsReport,
  SkillStatsSchema,
  StatsReportSchema,
} from './core/schemas.js';
export type { SkillStats, StatsReport } from './core/schemas.js';
export { getPackageVersion } from './core/version.js';
