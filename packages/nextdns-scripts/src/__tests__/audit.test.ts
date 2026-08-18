import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { formatAuditText, runAudit } from '../commands/audit.js';
import { getPackageVersion } from '../core/version.js';

function createFixture(rule: string, skill = '[Example](rules/example.md)') {
  const root = mkdtempSync(join(tmpdir(), 'nextdns-audit-'));
  const skillsDir = join(root, 'skills');
  const skillDir = join(skillsDir, 'example');
  const rulesDir = join(skillDir, 'rules');
  mkdirSync(rulesDir, { recursive: true });
  writeFileSync(join(skillDir, 'SKILL.md'), `# Example\n\n- ${skill}\n`, 'utf8');
  writeFileSync(join(rulesDir, 'example.md'), rule, 'utf8');
  return {
    root,
    skillsDir,
    cleanup: () => rmSync(root, { recursive: true, force: true }),
  };
}

function findCheck(report: ReturnType<typeof runAudit>, name: string) {
  const result = report.checks.find((item) => item.name === name);
  if (!result) throw new Error(`Missing audit check: ${name}`);
  return result;
}

const validRule = `---
title: 'Example rule'
impact: MEDIUM
impactDescription: 'Keep the example safe'
type: capability
tags:
  - dns
  - api
  - security
---
# Example rule
Use the example safely.
`;

describe('runAudit', () => {
  it('returns a passing structured report for the repository', () => {
    const report = runAudit();

    expect(report.passed).toBe(true);
    expect(report.ruleCount).toBeGreaterThan(0);
    expect(report.checks).toHaveLength(5);
    expect(report.checks.every((auditCheck) => auditCheck.passed)).toBe(true);
    expect(report.statistics.totalRules).toBe(report.ruleCount);
  });

  it('formats a concise human-readable summary', () => {
    const report = runAudit();
    const output = formatAuditText(report);

    expect(output).toContain('NextDNS Skills audit');
    expect(output).toContain('PASS referential-integrity');
    expect(output).toContain('Audit passed.');
  });

  it.each([
    [
      'missing required frontmatter field',
      validRule.replace("impactDescription: 'Keep the example safe'\n", ''),
    ],
    [
      'invalid impact and type values',
      validRule
        .replace('impact: MEDIUM', 'impact: CRITICAL')
        .replace('type: capability', 'type: unknown'),
    ],
    [
      'scalar tags instead of a YAML array',
      validRule.replace('tags:\n  - dns\n  - api\n  - security', 'tags: dns, api, security'),
    ],
    [
      'H1 without a description',
      validRule.replace('# Example rule\nUse the example safely.', '# Example rule\n'),
    ],
  ])('marks %s as a frontmatter failure', (_name, rule) => {
    const fixture = createFixture(rule);
    try {
      const report = runAudit(fixture.skillsDir, fixture.root);
      expect(report.passed).toBe(false);
      expect(findCheck(report, 'frontmatter').passed).toBe(false);
    } finally {
      fixture.cleanup();
    }
  });

  it('marks missing and unregistered rule references as a referential failure', () => {
    const fixture = createFixture(validRule, '[Missing](rules/missing.md)');
    try {
      const report = runAudit(fixture.skillsDir, fixture.root);
      expect(report.passed).toBe(false);
      expect(findCheck(report, 'referential-integrity').passed).toBe(false);
    } finally {
      fixture.cleanup();
    }
  });

  it('reports duplicate titles and tag sets as audit failures or warnings', () => {
    const fixture = createFixture(validRule);
    const secondRule = join(fixture.skillsDir, 'example', 'rules', 'second.md');
    writeFileSync(secondRule, validRule.replace('example.md', 'second.md'), 'utf8');
    writeFileSync(
      join(fixture.skillsDir, 'example', 'SKILL.md'),
      '# Example\n\n- [Example](rules/example.md)\n- [Second](rules/second.md)\n',
      'utf8'
    );
    try {
      const report = runAudit(fixture.skillsDir, fixture.root);
      expect(report.passed).toBe(false);
      expect(findCheck(report, 'duplicate-titles').passed).toBe(false);
      expect(findCheck(report, 'duplicate-titles').errors).toBeGreaterThan(0);
      expect(findCheck(report, 'duplicate-tags').warnings).toBeGreaterThan(0);
    } finally {
      fixture.cleanup();
    }
  });

  it('does not mutate the malformed fixture while auditing', () => {
    const fixture = createFixture(validRule.replace('impact: MEDIUM', 'impact: BROKEN'));
    const rulePath = join(fixture.skillsDir, 'example', 'rules', 'example.md');
    const before = readFileSync(rulePath, 'utf8');
    try {
      runAudit(fixture.skillsDir, fixture.root);
      expect(readFileSync(rulePath, 'utf8')).toBe(before);
    } finally {
      fixture.cleanup();
    }
  });
});

describe('getPackageVersion', () => {
  it('returns a semantic package version', () => {
    expect(getPackageVersion()).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
