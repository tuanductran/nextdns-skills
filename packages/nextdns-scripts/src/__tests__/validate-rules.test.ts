import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';

import {
  REQUIRED_FIELDS,
  VALID_IMPACTS,
  VALID_TYPES,
  checkMissingReferences,
  checkUnregisteredRules,
  validateContentStructure,
  validateFieldValues,
  validateRequiredFields,
} from '../commands/validate-rules.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

let tmpRoot: string;

function write(rel: string, content: string): string {
  const full = path.join(tmpRoot, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  return full;
}

function validFrontmatter(overrides: Record<string, string> = {}): string {
  const base: Record<string, string> = {
    title: "'Test Rule'",
    impact: 'HIGH',
    impactDescription: "'Some description'",
    type: 'capability',
    tags: '\n  - dns\n  - api\n  - setup',
  };
  return Object.entries({ ...base, ...overrides })
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
}

function validRule(overrides: Record<string, string> = {}): string {
  return `---\n${validFrontmatter(overrides)}\n---\n\n# Rule heading\n\nDescription line.\n`;
}

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ndns-test-'));
});

afterEach(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

// ─── Constants ───────────────────────────────────────────────────────────────

describe('constants', () => {
  it('REQUIRED_FIELDS contains all mandatory keys', () => {
    expect(REQUIRED_FIELDS).toContain('title');
    expect(REQUIRED_FIELDS).toContain('impact');
    expect(REQUIRED_FIELDS).toContain('impactDescription');
    expect(REQUIRED_FIELDS).toContain('type');
    expect(REQUIRED_FIELDS).toContain('tags');
  });

  it('VALID_IMPACTS has three levels', () => {
    expect(VALID_IMPACTS).toEqual(['HIGH', 'MEDIUM', 'LOW']);
  });

  it('VALID_TYPES has two types', () => {
    expect(VALID_TYPES).toEqual(['capability', 'efficiency']);
  });
});

// ─── validateRequiredFields ───────────────────────────────────────────────────

describe('validateRequiredFields', () => {
  it('returns false (no errors) when all fields present', () => {
    expect(validateRequiredFields('f.md', validFrontmatter())).toBe(false);
  });

  it('returns true (errors) when title is missing', () => {
    const fm = validFrontmatter({ title: '' }).replace('title: ', '');
    expect(validateRequiredFields('f.md', fm)).toBe(true);
  });

  it('returns true when impact is missing', () => {
    const fm = validFrontmatter().replace(/^impact:.*\n/m, '');
    expect(validateRequiredFields('f.md', fm)).toBe(true);
  });

  it('returns true when tags is missing', () => {
    const fm = validFrontmatter().replace(/^tags:.*\n/m, '');
    expect(validateRequiredFields('f.md', fm)).toBe(true);
  });
});

// ─── validateFieldValues ──────────────────────────────────────────────────────

describe('validateFieldValues', () => {
  it('accepts valid impact HIGH', () => {
    expect(validateFieldValues('f.md', validFrontmatter({ impact: 'HIGH' }))).toBe(false);
  });

  it('rejects unknown impact', () => {
    expect(validateFieldValues('f.md', validFrontmatter({ impact: 'CRITICAL' }))).toBe(true);
  });

  it('accepts valid type capability', () => {
    expect(validateFieldValues('f.md', validFrontmatter({ type: 'capability' }))).toBe(false);
  });

  it('rejects unknown type', () => {
    expect(validateFieldValues('f.md', validFrontmatter({ type: 'unknown' }))).toBe(true);
  });

  it('rejects tags as a string (not YAML array)', () => {
    expect(validateFieldValues('f.md', "tags: 'dns, api'")).toBe(true);
  });
});

// ─── validateContentStructure ─────────────────────────────────────────────────

describe('validateContentStructure', () => {
  it('passes when H1 is followed by content', () => {
    expect(validateContentStructure('f.md', '\n# Title\n\nSome description.')).toBe(false);
  });

  it('errors when H1 is the last content', () => {
    expect(validateContentStructure('f.md', '\n# Title\n')).toBe(true);
  });

  it('passes when there is no H1 at all', () => {
    expect(validateContentStructure('f.md', 'Just prose, no heading.')).toBe(false);
  });
});

// ─── checkUnregisteredRules ──────────────────────────────────────────────────

describe('checkUnregisteredRules', () => {
  it('returns false when all rules are registered', () => {
    const skillFile = write('skills/test/SKILL.md', '| [auth](rules/auth.md) |');
    write('skills/test/rules/auth.md', validRule());
    const rulesDir = path.join(tmpRoot, 'skills/test/rules');
    const content = fs.readFileSync(skillFile, 'utf8');
    expect(checkUnregisteredRules(skillFile, rulesDir, content)).toBe(false);
  });

  it('returns true when a rule file is not registered', () => {
    const skillFile = write('skills/test/SKILL.md', '# No rules linked');
    write('skills/test/rules/auth.md', validRule());
    const rulesDir = path.join(tmpRoot, 'skills/test/rules');
    const content = fs.readFileSync(skillFile, 'utf8');
    expect(checkUnregisteredRules(skillFile, rulesDir, content)).toBe(true);
  });

  it('returns false when rules directory does not exist', () => {
    const skillFile = write('skills/test/SKILL.md', '# empty');
    const missingDir = path.join(tmpRoot, 'skills/test/rules');
    expect(checkUnregisteredRules(skillFile, missingDir, '# empty')).toBe(false);
  });
});

// ─── checkMissingReferences ──────────────────────────────────────────────────

describe('checkMissingReferences', () => {
  it('returns false when all referenced files exist', () => {
    const skillFile = write('skills/test/SKILL.md', '| [auth](rules/auth.md) |');
    write('skills/test/rules/auth.md', validRule());
    const rulesDir = path.join(tmpRoot, 'skills/test/rules');
    const content = fs.readFileSync(skillFile, 'utf8');
    expect(checkMissingReferences(skillFile, rulesDir, content)).toBe(false);
  });

  it('returns true when a referenced file is missing', () => {
    const skillFile = write('skills/test/SKILL.md', '| [missing](rules/missing.md) |');
    const rulesDir = path.join(tmpRoot, 'skills/test/rules');
    fs.mkdirSync(rulesDir, { recursive: true });
    const content = fs.readFileSync(skillFile, 'utf8');
    expect(checkMissingReferences(skillFile, rulesDir, content)).toBe(true);
  });

  it('returns false when SKILL.md has no rule links', () => {
    const skillFile = write('skills/test/SKILL.md', '# No links here');
    const rulesDir = path.join(tmpRoot, 'skills/test/rules');
    fs.mkdirSync(rulesDir, { recursive: true });
    expect(checkMissingReferences(skillFile, rulesDir, '# No links here')).toBe(false);
  });
});
