import { describe, expect, it } from 'vitest';

import { formatAuditText, runAudit } from '../audit.js';
import { getPackageVersion } from '../version.js';

describe('runAudit', () => {
  it('returns a passing structured report for the repository', () => {
    const report = runAudit();

    expect(report.passed).toBe(true);
    expect(report.ruleCount).toBeGreaterThan(0);
    expect(report.checks).toHaveLength(5);
    expect(report.checks.every((check) => check.passed)).toBe(true);
    expect(report.statistics.totalRules).toBe(report.ruleCount);
  });

  it('formats a concise human-readable summary', () => {
    const report = runAudit();
    const output = formatAuditText(report);

    expect(output).toContain('NextDNS Skills audit');
    expect(output).toContain('PASS referential-integrity');
    expect(output).toContain('Audit passed.');
  });
});

describe('getPackageVersion', () => {
  it('returns a semantic package version', () => {
    expect(getPackageVersion()).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
