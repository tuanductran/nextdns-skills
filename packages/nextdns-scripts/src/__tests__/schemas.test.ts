import { describe, expect, it } from 'vitest';

import { parseAuditReport, parsePackageMetadata, parseStatsReport } from '../core/schemas.js';

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

function validAuditReport(overrides: Record<string, unknown> = {}) {
  return {
    generatedAt: '2026-08-18T00:00:00.000Z',
    passed: true,
    ruleCount: 1,
    checks: validChecks,
    statistics: validStatistics,
    ...overrides,
  };
}

describe('schema parsing', () => {
  it('accepts a complete audit report', () => {
    const report = parseAuditReport(validAuditReport());

    expect(report.statistics.totalRules).toBe(1);
    expect(report.checks).toHaveLength(5);
  });

  it.each([validChecks.slice(0, 4), [...validChecks, ...validChecks.slice(0, 1)]])(
    'rejects an audit report with %s checks',
    (checks) => {
      expect(() => parseAuditReport(validAuditReport({ checks }))).toThrow();
    }
  );

  it('rejects an unknown audit check name', () => {
    expect(() =>
      parseAuditReport(
        validAuditReport({
          passed: false,
          checks: [
            ...validChecks.slice(0, 4),
            { name: 'unknown-check', passed: false, errors: 1, warnings: 0 },
          ],
        })
      )
    ).toThrow();
  });

  it('rejects missing nested statistics', () => {
    const { statistics, ...reportWithoutStatistics } = validAuditReport();

    expect(statistics).toBeDefined();
    expect(() => parseAuditReport(reportWithoutStatistics)).toThrow();
  });

  it('rejects wrong primitive types', () => {
    expect(() => parseAuditReport(validAuditReport({ passed: 'true' }))).toThrow();
    expect(() => parseAuditReport(validAuditReport({ ruleCount: '1' }))).toThrow();
  });

  it('rejects non-integer or negative counters', () => {
    expect(() => parseStatsReport({ ...validStatistics, totalRules: 1.5 })).toThrow();
    expect(() =>
      parseStatsReport({
        ...validStatistics,
        impactDistribution: { HIGH: -1, MEDIUM: 0, LOW: 0 },
      })
    ).toThrow();
  });

  it('rejects incomplete nested skill statistics', () => {
    expect(() =>
      parseStatsReport({
        ...validStatistics,
        skills: [{ name: 'nextdns-api', total: 1 }],
      })
    ).toThrow();
  });

  it('rejects unknown input', () => {
    expect(() => parseAuditReport(null)).toThrow();
    expect(() => parseStatsReport('not-a-report')).toThrow();
  });

  it('returns type-safe stats data for a valid report', () => {
    const report = parseStatsReport(validStatistics);

    expect(report.skills[0]?.name).toBe('nextdns-api');
    expect(report.impactDistribution.HIGH).toBe(1);
  });

  it('accepts package metadata with an optional version', () => {
    expect(parsePackageMetadata({ version: '0.4.0' })).toEqual({ version: '0.4.0' });
    expect(parsePackageMetadata({})).toEqual({});
  });

  it('rejects malformed package metadata', () => {
    expect(() => parsePackageMetadata(null)).toThrow();
    expect(() => parsePackageMetadata({ version: 4 })).toThrow();
  });
});
