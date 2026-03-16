import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function tmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ndns-validate-'));
}

function write(dir: string, name: string, content: string): string {
  const full = path.join(dir, name);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  return full;
}

// ─── Frontmatter field validation (unit-tested inline) ───────────────────────
// We test the validation logic directly without importing the CLI script
// (which would trigger process.exit). Instead we replicate the relevant rules.

const REQUIRED_FIELDS = ['title', 'impact', 'impactDescription', 'type', 'tags'] as const;
const VALID_IMPACTS = ['HIGH', 'MEDIUM', 'LOW'] as const;
const VALID_TYPES = ['capability', 'efficiency'] as const;

function hasFrontmatter(content: string): boolean {
  return content.startsWith('---') && content.indexOf('\n---', 3) !== -1;
}

function extractFrontmatter(content: string): string | null {
  if (!hasFrontmatter(content)) return null;
  const end = content.indexOf('\n---', 3);
  return content.slice(3, end).trim();
}

function missingFields(fm: string): string[] {
  return REQUIRED_FIELDS.filter((f) => !new RegExp(`^${f}:`, 'm').test(fm));
}

function invalidImpact(fm: string): string | null {
  const m = fm.match(/^impact:\s*(.*)/m);
  if (!m) return null;
  const v = m[1].trim() as (typeof VALID_IMPACTS)[number];
  return VALID_IMPACTS.includes(v) ? null : v;
}

function invalidType(fm: string): string | null {
  const m = fm.match(/^type:\s*(.*)/m);
  if (!m) return null;
  const v = m[1].trim() as (typeof VALID_TYPES)[number];
  return VALID_TYPES.includes(v) ? null : v;
}

function hasStringTags(fm: string): boolean {
  return /^tags:\s*'(.*)'/m.test(fm);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('frontmatter detection', () => {
  it('detects valid frontmatter delimiters', () => {
    expect(hasFrontmatter('---\ntitle: foo\n---\n# Body')).toBe(true);
  });

  it('rejects missing opening delimiter', () => {
    expect(hasFrontmatter('title: foo\n---\n# Body')).toBe(false);
  });

  it('rejects missing closing delimiter', () => {
    expect(hasFrontmatter('---\ntitle: foo\n')).toBe(false);
  });
});

describe('required field validation', () => {
  const validFm = `
title: 'Test Rule'
impact: HIGH
impactDescription: 'Something breaks'
type: capability
tags:
  - test
`;

  it('passes when all required fields are present', () => {
    expect(missingFields(validFm)).toHaveLength(0);
  });

  it('detects missing title', () => {
    const fm = validFm.replace("title: 'Test Rule'\n", '');
    expect(missingFields(fm)).toContain('title');
  });

  it('detects missing impact', () => {
    const fm = validFm.replace('impact: HIGH\n', '');
    expect(missingFields(fm)).toContain('impact');
  });

  it('detects missing impactDescription', () => {
    const fm = validFm.replace("impactDescription: 'Something breaks'\n", '');
    expect(missingFields(fm)).toContain('impactDescription');
  });

  it('detects missing type', () => {
    const fm = validFm.replace('type: capability\n', '');
    expect(missingFields(fm)).toContain('type');
  });

  it('detects missing tags', () => {
    const fm = validFm.replace('tags:\n  - test\n', '');
    expect(missingFields(fm)).toContain('tags');
  });

  it('detects multiple missing fields at once', () => {
    const missing = missingFields('');
    expect(missing).toHaveLength(5);
  });
});

describe('impact level validation', () => {
  it('accepts HIGH', () => expect(invalidImpact('impact: HIGH')).toBeNull());
  it('accepts MEDIUM', () => expect(invalidImpact('impact: MEDIUM')).toBeNull());
  it('accepts LOW', () => expect(invalidImpact('impact: LOW')).toBeNull());
  it('rejects lowercase high', () => expect(invalidImpact('impact: high')).toBe('high'));
  it('rejects invalid value', () => expect(invalidImpact('impact: CRITICAL')).toBe('CRITICAL'));
  it('returns null when impact field is absent', () => expect(invalidImpact('')).toBeNull());
});

describe('type validation', () => {
  it('accepts capability', () => expect(invalidType('type: capability')).toBeNull());
  it('accepts efficiency', () => expect(invalidType('type: efficiency')).toBeNull());
  it('rejects unknown type', () => expect(invalidType('type: reference')).toBe('reference'));
  it('rejects capitalized type', () => expect(invalidType('type: Capability')).toBe('Capability'));
  it('returns null when type field is absent', () => expect(invalidType('')).toBeNull());
});

describe('tags format validation', () => {
  it('passes YAML array format', () => {
    expect(hasStringTags('tags:\n  - one\n  - two\n')).toBe(false);
  });

  it('detects string format', () => {
    expect(hasStringTags("tags: 'one, two, three'")).toBe(true);
  });
});

describe('content structure validation', () => {
  it('detects H1 followed by description', () => {
    const body = '# My Rule\n\nBrief description here.\n\n## Overview';
    const h1Match = body.match(/^#\s+.*$/m);
    expect(h1Match).not.toBeNull();
    const afterH1 = body.slice((h1Match!.index ?? 0) + h1Match![0].length).trim();
    expect(afterH1.length).toBeGreaterThan(0);
  });

  it('detects H1 with no following content', () => {
    const body = '# My Rule\n';
    const h1Match = body.match(/^#\s+.*$/m);
    const afterH1 = body.slice((h1Match!.index ?? 0) + h1Match![0].length).trim();
    expect(afterH1.length).toBe(0);
  });
});

describe('full rule file fixture', () => {
  let dir: string;
  beforeEach(() => {
    dir = tmpDir();
  });
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('validates a well-formed rule file', () => {
    const content = `---
title: 'Authentication'
impact: HIGH
impactDescription: 'Unauthenticated requests fail with 401'
type: capability
tags:
  - authentication
  - api-key
  - x-api-key
---

# Authentication

All NextDNS API requests require authentication via API key.

## Correct Usage

\`\`\`bash
curl -H "X-Api-Key: YOUR_API_KEY" https://api.nextdns.io/profiles
\`\`\`
`;
    const file = write(dir, 'authentication.md', content);
    const text = fs.readFileSync(file, 'utf8');

    expect(hasFrontmatter(text)).toBe(true);

    const fm = extractFrontmatter(text)!;
    expect(missingFields(fm)).toHaveLength(0);
    expect(invalidImpact(fm)).toBeNull();
    expect(invalidType(fm)).toBeNull();
    expect(hasStringTags(fm)).toBe(false);
  });
});
