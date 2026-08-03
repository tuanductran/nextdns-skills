import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';

import { CATEGORIES, getRuleCount, readFile, updateDocument, writeFile } from '../update-counts.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

let tmpRoot: string;
let skillsDir: string;

function write(rel: string, content: string): string {
  const full = path.join(tmpRoot, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  return full;
}

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ndns-counts-'));
  skillsDir = path.join(tmpRoot, 'skills');
});

afterEach(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

describe('CATEGORIES', () => {
  it('contains all 5 known skill categories', () => {
    expect(CATEGORIES).toContain('nextdns-api');
    expect(CATEGORIES).toContain('nextdns-cli');
    expect(CATEGORIES).toContain('nextdns-ui');
    expect(CATEGORIES).toContain('integrations');
    expect(CATEGORIES).toContain('nextdns-frontend');
    expect(CATEGORIES).toHaveLength(5);
  });
});

// ─── readFile / writeFile ─────────────────────────────────────────────────────

describe('readFile', () => {
  it('returns file content when file exists', () => {
    const p = write('test.md', '# Hello');
    expect(readFile(p)).toBe('# Hello');
  });

  it('returns null when file does not exist', () => {
    expect(readFile(path.join(tmpRoot, 'missing.md'))).toBeNull();
  });
});

describe('writeFile', () => {
  it('creates and writes file content', () => {
    const p = path.join(tmpRoot, 'out.md');
    writeFile(p, 'content');
    expect(fs.readFileSync(p, 'utf8')).toBe('content');
  });
});

// ─── getRuleCount ─────────────────────────────────────────────────────────────

describe('getRuleCount', () => {
  it('returns correct count of .md files in rules dir', () => {
    write('skills/nextdns-api/rules/rule-a.md', '');
    write('skills/nextdns-api/rules/rule-b.md', '');
    expect(getRuleCount('nextdns-api', skillsDir)).toBe(2);
  });

  it('returns null when rules dir does not exist', () => {
    fs.mkdirSync(path.join(skillsDir, 'nextdns-api'), { recursive: true });
    expect(getRuleCount('nextdns-api', skillsDir)).toBeNull();
  });

  it('counts rules in subdirectories', () => {
    write('skills/nextdns-frontend/rules/nuxt/rule.md', '');
    write('skills/nextdns-frontend/rules/nextjs/rule.md', '');
    expect(getRuleCount('nextdns-frontend', skillsDir)).toBe(2);
  });
});

// ─── updateDocument ───────────────────────────────────────────────────────────

describe('updateDocument', () => {
  it('updates count in document when pattern matches', () => {
    write('skills/nextdns-api/rules/a.md', '');
    write('skills/nextdns-api/rules/b.md', '');
    const docPath = write('README.md', '| [API](skills/nextdns-api/SKILL.md) | **0** |');

    updateDocument(
      docPath,
      ['nextdns-api'],
      (cat) =>
        new RegExp(
          `(\\|\\s+\\[.*?\\]\\(skills/${cat}/SKILL\\.md\\)\\s+\\|\\s+\\*\\*)\\d+(\\*\\*\\s+\\|)`,
          'g'
        ),
      'README',
      skillsDir
    );

    expect(fs.readFileSync(docPath, 'utf8')).toContain('**2**');
  });

  it('writes "No changes needed" when count already correct', () => {
    write('skills/nextdns-api/rules/a.md', '');
    const docPath = write('README.md', '| [API](skills/nextdns-api/SKILL.md) | **1** |');
    // Capture console output
    const logs: string[] = [];
    const orig = console.log;
    console.log = (...args) => logs.push(args.join(' '));

    updateDocument(
      docPath,
      ['nextdns-api'],
      (cat) =>
        new RegExp(
          `(\\|\\s+\\[.*?\\]\\(skills/${cat}/SKILL\\.md\\)\\s+\\|\\s+\\*\\*)\\d+(\\*\\*\\s+\\|)`,
          'g'
        ),
      'README',
      skillsDir
    );

    console.log = orig;
    expect(logs.some((l) => l.includes('No changes needed'))).toBe(true);
  });

  it('logs "not found" when document does not exist', () => {
    const logs: string[] = [];
    const orig = console.log;
    console.log = (...args) => logs.push(args.join(' '));

    updateDocument(
      path.join(tmpRoot, 'missing.md'),
      ['nextdns-api'],
      () => /x/g,
      'README',
      skillsDir
    );

    console.log = orig;
    expect(logs.some((l) => l.includes('not found'))).toBe(true);
  });
});
