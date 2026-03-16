import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { parseRuleFile } from '../parser.js';

function tmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ndns-parser-'));
}

function write(dir: string, name: string, content: string): string {
  const full = path.join(dir, name);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  return full;
}

const SECTION_MAP = { capability: 1, efficiency: 2 };

// ─── Fixture helpers ─────────────────────────────────────────────────────────

function makeRule(overrides: Record<string, string> = {}, body = ''): string {
  const fm = {
    title: "'Authentication'",
    impact: 'HIGH',
    impactDescription: "'API key required'",
    type: 'capability',
    ...overrides,
  };
  const fmLines = Object.entries(fm)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  return `---\n${fmLines}\ntags:\n  - api\n  - security\n  - authentication\n---\n\n# Authentication\n\nAll requests require authentication.\n${body}`;
}

// ─── parseRuleFile ────────────────────────────────────────────────────────────

describe('parseRuleFile — frontmatter fields', () => {
  let dir: string;
  beforeEach(() => {
    dir = tmpDir();
  });
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('parses title from frontmatter', async () => {
    const file = write(dir, 'auth.md', makeRule());
    const { rule } = await parseRuleFile(file, SECTION_MAP);
    expect(rule.title).toBe('Authentication');
  });

  it('parses HIGH impact', async () => {
    const file = write(dir, 'auth.md', makeRule({ impact: 'HIGH' }));
    const { rule } = await parseRuleFile(file, SECTION_MAP);
    expect(rule.impact).toBe('HIGH');
  });

  it('parses MEDIUM impact', async () => {
    const file = write(dir, 'auth.md', makeRule({ impact: 'MEDIUM' }));
    const { rule } = await parseRuleFile(file, SECTION_MAP);
    expect(rule.impact).toBe('MEDIUM');
  });

  it('parses LOW impact', async () => {
    const file = write(dir, 'auth.md', makeRule({ impact: 'LOW' }));
    const { rule } = await parseRuleFile(file, SECTION_MAP);
    expect(rule.impact).toBe('LOW');
  });

  it('defaults to MEDIUM for invalid impact', async () => {
    const file = write(dir, 'auth.md', makeRule({ impact: 'CRITICAL' }));
    const { rule } = await parseRuleFile(file, SECTION_MAP);
    expect(rule.impact).toBe('MEDIUM');
  });

  it('parses capability type and assigns section 1', async () => {
    const file = write(dir, 'auth.md', makeRule({ type: 'capability' }));
    const { rule, section } = await parseRuleFile(file, SECTION_MAP);
    expect(rule.type).toBe('capability');
    expect(section).toBe(1);
  });

  it('parses efficiency type and assigns section 2', async () => {
    const file = write(dir, 'auth.md', makeRule({ type: 'efficiency' }));
    const { rule, section } = await parseRuleFile(file, SECTION_MAP);
    expect(rule.type).toBe('efficiency');
    expect(section).toBe(2);
  });

  it('parses tags array', async () => {
    const file = write(dir, 'auth.md', makeRule());
    const { rule } = await parseRuleFile(file, SECTION_MAP);
    expect(rule.tags).toEqual(['api', 'security', 'authentication']);
  });

  it('parses impactDescription', async () => {
    const file = write(dir, 'auth.md', makeRule({ impactDescription: "'Breaks everything'" }));
    const { rule } = await parseRuleFile(file, SECTION_MAP);
    expect(rule.impactDescription).toBe('Breaks everything');
  });
});

describe('parseRuleFile — H1 and description', () => {
  let dir: string;
  beforeEach(() => {
    dir = tmpDir();
  });
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('extracts H1 title as fallback when frontmatter title missing', async () => {
    const content = `---
impact: HIGH
impactDescription: 'test'
type: capability
tags:
  - api
  - security
  - key
---

# Extracted From H1

One-line description here.
`;
    const file = write(dir, 'rule.md', content);
    const { rule } = await parseRuleFile(file, SECTION_MAP);
    expect(rule.title).toBe('Extracted From H1');
  });

  it('extracts explanation from body text', async () => {
    const content = makeRule({}, '\n## Overview\n\nThis explains context.\n');
    const file = write(dir, 'rule.md', content);
    const { rule } = await parseRuleFile(file, SECTION_MAP);
    expect(rule.explanation).toContain('All requests require authentication');
  });
});

describe('parseRuleFile — examples', () => {
  let dir: string;
  beforeEach(() => {
    dir = tmpDir();
  });
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('extracts correct usage examples', async () => {
    const content = makeRule(
      {},
      `
## Correct Usage

\`\`\`bash
# ✅ Correct
curl -H "X-Api-Key: KEY" https://api.nextdns.io/profiles
\`\`\`
`
    );
    const file = write(dir, 'rule.md', content);
    const { rule } = await parseRuleFile(file, SECTION_MAP);
    expect(rule.examples.some((e) => e.label === 'Correct')).toBe(true);
  });

  it('extracts do-not-use examples', async () => {
    const content = makeRule(
      {},
      `
## Do NOT Use

\`\`\`bash
# ❌ Wrong
curl https://api.nextdns.io/profiles
\`\`\`
`
    );
    const file = write(dir, 'rule.md', content);
    const { rule } = await parseRuleFile(file, SECTION_MAP);
    expect(rule.examples.some((e) => e.label === 'Incorrect')).toBe(true);
  });

  it('sets correct code language from fence', async () => {
    const content = makeRule(
      {},
      `
## Correct Usage

\`\`\`typescript
const x: string = "hello";
\`\`\`
`
    );
    const file = write(dir, 'rule.md', content);
    const { rule } = await parseRuleFile(file, SECTION_MAP);
    const ex = rule.examples.find((e) => e.label === 'Correct');
    expect(ex?.language).toBe('typescript');
  });

  it('handles file with no examples', async () => {
    const file = write(dir, 'rule.md', makeRule());
    const { rule } = await parseRuleFile(file, SECTION_MAP);
    expect(rule.examples).toHaveLength(0);
  });
});

describe('parseRuleFile — section mapping', () => {
  let dir: string;
  beforeEach(() => {
    dir = tmpDir();
  });
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('maps nuxt subdirectory to section 1 with frontend sectionMap', async () => {
    const frontendMap = { nuxt: 1, nextjs: 2, astro: 3, sveltekit: 4, 'react-router': 5 };
    const content = makeRule({ type: 'capability' });
    const file = write(dir, 'api-proxy.md', content);
    const relativePath = 'nuxt/api-proxy.md';
    const { section } = await parseRuleFile(file, frontendMap, relativePath);
    expect(section).toBe(1);
  });

  it('maps nextjs subdirectory to section 2', async () => {
    const frontendMap = { nuxt: 1, nextjs: 2, astro: 3, sveltekit: 4, 'react-router': 5 };
    const file = write(dir, 'api-proxy.md', makeRule({ type: 'capability' }));
    const { section } = await parseRuleFile(file, frontendMap, 'nextjs/api-proxy.md');
    expect(section).toBe(2);
  });

  it('returns section 0 when no sectionMap matches', async () => {
    const file = write(dir, 'orphan.md', makeRule({ type: 'unknown-type' }));
    const { section } = await parseRuleFile(file, {});
    expect(section).toBe(0);
  });
});

describe('parseRuleFile — references', () => {
  let dir: string;
  beforeEach(() => {
    dir = tmpDir();
  });
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('extracts reference URLs', async () => {
    const content = makeRule(
      {},
      `\n## Reference\n\nReference: [NextDNS API](https://nextdns.github.io/api/)\n`
    );
    const file = write(dir, 'rule.md', content);
    const { rule } = await parseRuleFile(file, SECTION_MAP);
    expect(
      rule.references?.some((r) => {
        try {
          return new URL(r).hostname === 'nextdns.github.io';
        } catch {
          return false;
        }
      })
    ).toBe(true);
  });
});

describe('parseRuleFile — CRLF handling', () => {
  let dir: string;
  beforeEach(() => {
    dir = tmpDir();
  });
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('handles CRLF line endings', async () => {
    const content = makeRule().replace(/\n/g, '\r\n');
    const file = write(dir, 'crlf.md', content);
    const { rule } = await parseRuleFile(file, SECTION_MAP);
    expect(rule.title).toBe('Authentication');
    expect(rule.impact).toBe('HIGH');
  });
});
