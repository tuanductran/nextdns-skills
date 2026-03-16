import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { collectRuleFiles, parseFrontmatter, walkDir } from '../utils.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

function tmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ndns-test-'));
}

function write(dir: string, relPath: string, content = ''): string {
  const full = path.join(dir, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  return full;
}

// ─── walkDir ────────────────────────────────────────────────────────────────

describe('walkDir', () => {
  let dir: string;
  beforeEach(() => {
    dir = tmpDir();
  });
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('returns empty array for empty directory', () => {
    expect(walkDir(dir, () => true)).toEqual([]);
  });

  it('returns empty array for non-existent directory', () => {
    expect(walkDir('/does/not/exist', () => true)).toEqual([]);
  });

  it('collects files matching the predicate', () => {
    write(dir, 'a.md');
    write(dir, 'b.ts');
    write(dir, 'c.md');
    const results = walkDir(dir, (n) => n.endsWith('.md'));
    expect(results).toHaveLength(2);
    expect(results.every((f) => f.endsWith('.md'))).toBe(true);
  });

  it('recurses into subdirectories', () => {
    write(dir, 'sub/deep/rule.md');
    write(dir, 'root.md');
    const results = walkDir(dir, (n) => n.endsWith('.md'));
    expect(results).toHaveLength(2);
  });

  it('does not return files that do not match predicate', () => {
    write(dir, 'file.json');
    const results = walkDir(dir, (n) => n.endsWith('.md'));
    expect(results).toHaveLength(0);
  });
});

// ─── parseFrontmatter ───────────────────────────────────────────────────────

describe('parseFrontmatter', () => {
  it('returns empty object when no frontmatter', () => {
    expect(parseFrontmatter('# Hello\nNo frontmatter here.')).toEqual({});
  });

  it('returns empty object when content does not start with ---', () => {
    expect(parseFrontmatter('title: foo\n---')).toEqual({});
  });

  it('parses scalar string fields', () => {
    const md = `---
title: 'Authentication'
impact: HIGH
type: capability
---
# Body`;
    const fm = parseFrontmatter(md);
    expect(fm['title']).toBe('Authentication');
    expect(fm['impact']).toBe('HIGH');
    expect(fm['type']).toBe('capability');
  });

  it('parses YAML array fields', () => {
    const md = `---
tags:
  - api
  - security
  - authentication
---`;
    const fm = parseFrontmatter(md);
    expect(fm['tags']).toEqual(['api', 'security', 'authentication']);
  });

  it('strips surrounding quotes from values', () => {
    const md = `---
title: "Rate Limiting"
impactDescription: 'Some description'
---`;
    const fm = parseFrontmatter(md);
    expect(fm['title']).toBe('Rate Limiting');
    expect(fm['impactDescription']).toBe('Some description');
  });

  it('handles multiple fields including mixed scalar and array', () => {
    const md = `---
title: 'My Rule'
impact: MEDIUM
tags:
  - one
  - two
type: efficiency
---`;
    const fm = parseFrontmatter(md);
    expect(fm['title']).toBe('My Rule');
    expect(fm['impact']).toBe('MEDIUM');
    expect(fm['tags']).toEqual(['one', 'two']);
    expect(fm['type']).toBe('efficiency');
  });

  it('returns empty object when closing --- is missing', () => {
    const md = `---
title: Missing close
`;
    expect(parseFrontmatter(md)).toEqual({});
  });
});

// ─── collectRuleFiles ────────────────────────────────────────────────────────

describe('collectRuleFiles', () => {
  let dir: string;
  beforeEach(() => {
    dir = tmpDir();
  });
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('returns empty array for empty directory', () => {
    expect(collectRuleFiles(dir)).toEqual([]);
  });

  it('collects .md files', () => {
    write(dir, 'rule-one.md');
    write(dir, 'rule-two.md');
    expect(collectRuleFiles(dir)).toHaveLength(2);
  });

  it('excludes files starting with underscore', () => {
    write(dir, '_draft.md');
    write(dir, 'real.md');
    const results = collectRuleFiles(dir);
    expect(results).toHaveLength(1);
    expect(results[0]).toContain('real.md');
  });

  it('excludes README.md', () => {
    write(dir, 'README.md');
    write(dir, 'actual-rule.md');
    const results = collectRuleFiles(dir);
    expect(results).toHaveLength(1);
    expect(results[0]).toContain('actual-rule.md');
  });

  it('excludes SKILL.md', () => {
    write(dir, 'SKILL.md');
    write(dir, 'rule.md');
    const results = collectRuleFiles(dir);
    expect(results).toHaveLength(1);
  });

  it('excludes non-.md files', () => {
    write(dir, 'script.ts');
    write(dir, 'config.json');
    write(dir, 'rule.md');
    expect(collectRuleFiles(dir)).toHaveLength(1);
  });

  it('recurses into subdirectories', () => {
    write(dir, 'nuxt/api-proxy.md');
    write(dir, 'nextjs/api-proxy.md');
    write(dir, 'top-level.md');
    const results = collectRuleFiles(dir);
    expect(results).toHaveLength(3);
  });

  it('returns sorted file paths', () => {
    write(dir, 'zzz.md');
    write(dir, 'aaa.md');
    write(dir, 'mmm.md');
    const results = collectRuleFiles(dir);
    expect(results[0]).toContain('aaa.md');
    expect(results[2]).toContain('zzz.md');
  });
});
