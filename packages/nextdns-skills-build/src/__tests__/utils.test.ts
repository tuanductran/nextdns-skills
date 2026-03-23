import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { collectRuleFiles } from '../utils.js';

function tmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ndns-build-utils-'));
}

function write(dir: string, relPath: string, content = ''): string {
  const full = path.join(dir, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  return full;
}

describe('collectRuleFiles', () => {
  let dir: string;
  beforeEach(() => {
    dir = tmpDir();
  });
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('returns empty array for non-existent directory', async () => {
    await expect(collectRuleFiles('/does/not/exist')).rejects.toThrow();
  });

  it('returns empty array for empty directory', async () => {
    const results = await collectRuleFiles(dir);
    expect(results).toEqual([]);
  });

  it('collects .md files', async () => {
    write(dir, 'rule-one.md');
    write(dir, 'rule-two.md');
    const results = await collectRuleFiles(dir);
    expect(results).toHaveLength(2);
  });

  it('excludes files starting with underscore', async () => {
    write(dir, '_draft.md');
    write(dir, 'real-rule.md');
    const results = await collectRuleFiles(dir);
    expect(results).toHaveLength(1);
    expect(results[0]).toContain('real-rule.md');
  });

  it('excludes README.md', async () => {
    write(dir, 'README.md');
    write(dir, 'auth.md');
    const results = await collectRuleFiles(dir);
    expect(results).toHaveLength(1);
    expect(results[0]).not.toContain('README.md');
  });

  it('excludes non-md files', async () => {
    write(dir, 'config.json');
    write(dir, 'script.ts');
    write(dir, 'actual.md');
    const results = await collectRuleFiles(dir);
    expect(results).toHaveLength(1);
  });

  it('recurses into subdirectories (nextdns-frontend pattern)', async () => {
    write(dir, 'nuxt/api-proxy.md');
    write(dir, 'nextjs/api-proxy.md');
    write(dir, 'astro/api-proxy.md');
    write(dir, 'top-level.md');
    const results = await collectRuleFiles(dir);
    expect(results).toHaveLength(4);
  });

  it('returns sorted paths', async () => {
    write(dir, 'zzz.md');
    write(dir, 'aaa.md');
    write(dir, 'mmm.md');
    const results = await collectRuleFiles(dir);
    expect(path.basename(results[0])).toBe('aaa.md');
    expect(path.basename(results[2])).toBe('zzz.md');
  });

  it('handles deeply nested subdirectories', async () => {
    write(dir, 'a/b/c/deep.md');
    write(dir, 'shallow.md');
    const results = await collectRuleFiles(dir);
    expect(results).toHaveLength(2);
    expect(results.some((f) => f.includes('deep.md'))).toBe(true);
  });
});
