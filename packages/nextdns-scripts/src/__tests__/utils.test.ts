import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';

import { collectRuleFiles, parseFrontmatter, walkDir } from '../utils.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

let tmpRoot: string;

function write(rel: string, content = ''): string {
  const full = path.join(tmpRoot, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  return full;
}

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ndns-utils-'));
});

afterEach(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

// ─── walkDir ─────────────────────────────────────────────────────────────────

describe('walkDir', () => {
  it('returns empty array for non-existent directory', () => {
    expect(walkDir(path.join(tmpRoot, 'missing'), () => true)).toEqual([]);
  });

  it('returns empty array for empty directory', () => {
    fs.mkdirSync(path.join(tmpRoot, 'empty'));
    expect(walkDir(path.join(tmpRoot, 'empty'), () => true)).toEqual([]);
  });

  it('collects files matching predicate', () => {
    write('a/one.md');
    write('a/two.md');
    write('a/skip.txt');
    const results = walkDir(path.join(tmpRoot, 'a'), (n) => n.endsWith('.md'));
    expect(results).toHaveLength(2);
    expect(results.every((f) => f.endsWith('.md'))).toBe(true);
  });

  it('recurses into subdirectories', () => {
    write('root/sub1/a.md');
    write('root/sub1/sub2/b.md');
    write('root/c.md');
    const results = walkDir(path.join(tmpRoot, 'root'), (n) => n.endsWith('.md'));
    expect(results).toHaveLength(3);
  });

  it('excludes files that do not match predicate', () => {
    write('dir/keep.ts');
    write('dir/skip.md');
    const results = walkDir(path.join(tmpRoot, 'dir'), (n) => n.endsWith('.ts'));
    expect(results).toHaveLength(1);
    expect(results[0]).toMatch(/keep\.ts$/);
  });
});

// ─── parseFrontmatter ─────────────────────────────────────────────────────────

describe('parseFrontmatter', () => {
  it('returns empty object when no frontmatter', () => {
    expect(parseFrontmatter('# No frontmatter here')).toEqual({});
  });

  it('returns empty object when frontmatter is not closed', () => {
    expect(parseFrontmatter('---\ntitle: Test\n')).toEqual({});
  });

  it('parses simple string fields', () => {
    const fm = parseFrontmatter('---\ntitle: Hello\nimpact: HIGH\n---\n');
    expect(fm['title']).toBe('Hello');
    expect(fm['impact']).toBe('HIGH');
  });

  it('strips surrounding quotes from values', () => {
    const fm = parseFrontmatter("---\ntitle: 'Quoted Title'\n---\n");
    expect(fm['title']).toBe('Quoted Title');
  });

  it('parses YAML array into string[]', () => {
    const fm = parseFrontmatter('---\ntags:\n  - dns\n  - api\n  - setup\n---\n');
    expect(fm['tags']).toEqual(['dns', 'api', 'setup']);
  });

  it('returns empty array for empty YAML array', () => {
    const fm = parseFrontmatter('---\ntags:\n---\n');
    expect(fm['tags']).toEqual([]);
  });

  it('handles multiple fields and arrays', () => {
    const content = [
      '---',
      "title: 'My Rule'",
      'impact: MEDIUM',
      'type: capability',
      'tags:',
      '  - cli',
      '  - dns',
      '---',
      '# Body',
    ].join('\n');
    const fm = parseFrontmatter(content);
    expect(fm['title']).toBe('My Rule');
    expect(fm['impact']).toBe('MEDIUM');
    expect(fm['tags']).toEqual(['cli', 'dns']);
  });

  it('handles multiline impactDescription', () => {
    const content = "---\ntitle: 'Test'\nimpactDescription: 'A long description'\n---\n";
    const fm = parseFrontmatter(content);
    expect(fm['impactDescription']).toBe('A long description');
  });
});

// ─── collectRuleFiles ─────────────────────────────────────────────────────────

describe('collectRuleFiles', () => {
  it('excludes SKILL.md', () => {
    write('rules/SKILL.md');
    write('rules/auth.md');
    const results = collectRuleFiles(path.join(tmpRoot, 'rules'));
    expect(results.every((f) => !f.endsWith('SKILL.md'))).toBe(true);
  });

  it('excludes README.md', () => {
    write('rules/README.md');
    write('rules/setup.md');
    const results = collectRuleFiles(path.join(tmpRoot, 'rules'));
    expect(results.every((f) => !f.endsWith('README.md'))).toBe(true);
  });

  it('excludes files starting with underscore', () => {
    write('rules/_draft.md');
    write('rules/published.md');
    const results = collectRuleFiles(path.join(tmpRoot, 'rules'));
    expect(results.every((f) => !path.basename(f).startsWith('_'))).toBe(true);
  });

  it('includes normal .md files in subdirs', () => {
    write('rules/nuxt/api-proxy.md');
    write('rules/nextjs/error-handling.md');
    const results = collectRuleFiles(path.join(tmpRoot, 'rules'));
    expect(results).toHaveLength(2);
  });

  it('returns empty array for non-existent directory', () => {
    expect(collectRuleFiles(path.join(tmpRoot, 'missing'))).toEqual([]);
  });
});
