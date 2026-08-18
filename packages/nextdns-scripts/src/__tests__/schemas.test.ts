import { describe, expect, it } from 'vitest';

import { parseAuditReport, parseStatsReport } from '../core/schemas.js';

const validStatistics = {
  generatedAt: '2026-08-18T00:00:00.000Z',
  totalRules: 1,
  skills: [
    {
      name: 'nextdns-api',
      total: 1,
      capability: 1,
      efficiency: 0,
      high: 1,
      medium: 0,
      low: 0,
    },
  ],
  impactDistribution: { HIGH: 1, MEDIUM: 0, LOW: 0 },
  topTags: [{ tag: 'api', count: 1 }],
  rulesWithNoTags: [],
};

const validChecks = [
  { name: 'referential-integrity', passed: true, errors: 0, warnings: 0 },
  { name: 'frontmatter', passed: true, errors: 0, warnings: 0 },
  { name: 'tags', passed: true, errors: 0, warnings: 0 },
  { name: 'duplicate-titles', passed: true, errors: 0, warnings: 0 },
  { name: 'duplicate-tags', passed: true, errors: 0, warnings: 0 },
];

describe('schema parsing', () => {
  it('accepts a complete audit report', () => {
    const report = parseAuditReport({
      generatedAt: '2026-08-18T00:00:00.000Z',
      passed: true,
      ruleCount: 1,
      checks: validChecks,
      statistics: validStatistics,
    });

    expect(report.statistics.totalRules).toBe(1);
    expect(report.checks).toHaveLength(5);
  });

  it('rejects an unknown audit check name', () => {
    expect(() =>
      parseAuditReport({
        generatedAt: '2026-08-18T00:00:00.000Z',
        passed: false,
        ruleCount: 1,
        checks: [
          ...validChecks.slice(0, 4),
          { name: 'unknown-check', passed: false, errors: 1, warnings: 0 },
        ],
        statistics: validStatistics,
      })
    ).toThrow();
  });

  it('rejects missing nested statistics', () => {
    expect(() =>
      parseAuditReport({
        generatedAt: '2026-08-18T00:00:00.000Z',
        passed: true,
        ruleCount: 1,
        checks: validChecks,
      })
    ).toThrow();
  });

  it('rejects negative counters', () => {
    expect(() =>
      parseStatsReport({
        ...validStatistics,
        totalRules: -1,
      })
    ).toThrow();
  });

  it('returns type-safe stats data for a valid report', () => {
    const report = parseStatsReport(validStatistics);

    expect(report.skills[0]?.name).toBe('nextdns-api');
    expect(report.impactDistribution.HIGH).toBe(1);
  });
});
