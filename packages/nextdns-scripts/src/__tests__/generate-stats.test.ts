import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';

import { buildReport } from '../generate-stats.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

let tmpRoot: string;
let skillsDir: string;

function write(rel: string, content: string): void {
  const full = path.join(tmpRoot, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
}

function rule(overrides: Record<string, string> = {}): string {
  const o = {
    impact: 'HIGH',
    type: 'capability',
    tags: '\n  - dns\n  - api\n  - setup',
    ...overrides,
  };
  return `---\ntitle: 'Test'\nimpact: ${o.impact}\nimpactDescription: 'desc'\ntype: ${o.type}\ntags:${o.tags}\n---\n\n# Test\n\nDescription.\n`;
}

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ndns-stats-'));
  skillsDir = path.join(tmpRoot, 'skills');
});

afterEach(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

// ─── buildReport ─────────────────────────────────────────────────────────────

describe('buildReport', () => {
  it('returns zero totals for empty skills dir', () => {
    fs.mkdirSync(skillsDir);
    const report = buildReport(skillsDir, tmpRoot);
    expect(report.totalRules).toBe(0);
    expect(report.skills).toHaveLength(0);
    expect(report.rulesWithNoTags).toHaveLength(0);
  });

  it('counts rules correctly across one skill', () => {
    write('skills/test-skill/rules/rule-a.md', rule({ impact: 'HIGH', type: 'capability' }));
    write('skills/test-skill/rules/rule-b.md', rule({ impact: 'MEDIUM', type: 'efficiency' }));
    const report = buildReport(skillsDir, tmpRoot);
    expect(report.totalRules).toBe(2);
    expect(report.skills[0]?.name).toBe('test-skill');
    expect(report.skills[0]?.total).toBe(2);
    expect(report.skills[0]?.capability).toBe(1);
    expect(report.skills[0]?.efficiency).toBe(1);
  });

  it('tracks impact distribution correctly', () => {
    write('skills/s/rules/r1.md', rule({ impact: 'HIGH' }));
    write('skills/s/rules/r2.md', rule({ impact: 'MEDIUM' }));
    write('skills/s/rules/r3.md', rule({ impact: 'LOW' }));
    const report = buildReport(skillsDir, tmpRoot);
    expect(report.impactDistribution.HIGH).toBe(1);
    expect(report.impactDistribution.MEDIUM).toBe(1);
    expect(report.impactDistribution.LOW).toBe(1);
  });

  it('records rules with no tags', () => {
    write(
      'skills/s/rules/notags.md',
      `---\ntitle: 'No Tags'\nimpact: HIGH\nimpactDescription: 'x'\ntype: capability\ntags:\n---\n\n# No Tags\n\nDesc.\n`
    );
    const report = buildReport(skillsDir, tmpRoot);
    expect(report.rulesWithNoTags.length).toBe(1);
  });

  it('collects and sorts top tags', () => {
    write('skills/s/rules/r1.md', rule({ tags: '\n  - dns\n  - api\n  - setup' }));
    write('skills/s/rules/r2.md', rule({ tags: '\n  - dns\n  - cli\n  - setup' }));
    const report = buildReport(skillsDir, tmpRoot);
    const topTags = report.topTags.map((t) => t.tag);
    // dns and setup appear twice — should be at top
    expect(topTags.indexOf('dns')).toBeLessThan(topTags.indexOf('cli'));
  });

  it('limits topTags to 20', () => {
    const tags = Array.from({ length: 25 }, (_, i) => `tag${i}`).join('\n  - ');
    write('skills/s/rules/r1.md', rule({ tags: `\n  - ${tags}` }));
    const report = buildReport(skillsDir, tmpRoot);
    expect(report.topTags.length).toBeLessThanOrEqual(20);
  });

  it('includes generatedAt ISO timestamp', () => {
    fs.mkdirSync(skillsDir);
    const report = buildReport(skillsDir, tmpRoot);
    expect(() => new Date(report.generatedAt)).not.toThrow();
    expect(report.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
