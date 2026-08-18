import * as v from 'valibot';

const CountSchema = v.pipe(v.number(), v.integer(), v.minValue(0));

const AuditCheckNameSchema = v.picklist([
  'referential-integrity',
  'frontmatter',
  'tags',
  'duplicate-titles',
  'duplicate-tags',
]);

export const SkillStatsSchema = v.object({
  name: v.string(),
  total: CountSchema,
  capability: CountSchema,
  efficiency: CountSchema,
  high: CountSchema,
  medium: CountSchema,
  low: CountSchema,
});

export const StatsReportSchema = v.object({
  generatedAt: v.string(),
  totalRules: CountSchema,
  skills: v.array(SkillStatsSchema),
  impactDistribution: v.object({
    HIGH: CountSchema,
    MEDIUM: CountSchema,
    LOW: CountSchema,
  }),
  topTags: v.array(
    v.object({
      tag: v.string(),
      count: CountSchema,
    })
  ),
  rulesWithNoTags: v.array(v.string()),
});

export const AuditCheckSchema = v.object({
  name: AuditCheckNameSchema,
  passed: v.boolean(),
  errors: CountSchema,
  warnings: CountSchema,
});

export const AuditReportSchema = v.object({
  generatedAt: v.string(),
  passed: v.boolean(),
  ruleCount: CountSchema,
  checks: v.pipe(v.array(AuditCheckSchema), v.length(5)),
  statistics: StatsReportSchema,
});

export type AuditCheck = v.InferOutput<typeof AuditCheckSchema>;
export type AuditReport = v.InferOutput<typeof AuditReportSchema>;
export type SkillStats = v.InferOutput<typeof SkillStatsSchema>;
export type StatsReport = v.InferOutput<typeof StatsReportSchema>;

export function parseAuditReport(input: unknown): AuditReport {
  return v.parse(AuditReportSchema, input);
}

export function parseStatsReport(input: unknown): StatsReport {
  return v.parse(StatsReportSchema, input);
}
