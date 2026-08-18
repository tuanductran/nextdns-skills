import { describe, expect, it } from 'vite-plus/test';

import {
  checkDuplicateTags,
  checkDuplicateTitles,
  normalize,
  type RuleEntry,
} from '../commands/check-duplicates.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRule(overrides: Partial<RuleEntry> = {}): RuleEntry {
  const title = overrides.title ?? 'Authentication';
  return {
    file: 'skills/test/rules/auth.md',
    skill: 'nextdns-api',
    subdir: '',
    title,
    normalizedTitle: normalize(title),
    tags: ['api', 'auth', 'security'],
    tagKey: 'api|auth|security',
    ...overrides,
  };
}

// ─── normalize ────────────────────────────────────────────────────────────────

describe('normalize', () => {
  it('lowercases the title', () => {
    expect(normalize('Authentication')).toBe('authentication');
  });

  it('strips punctuation', () => {
    expect(normalize('API Key Proxy (BFF Pattern)')).toBe('api key proxy bff pattern');
  });

  it('collapses multiple spaces', () => {
    expect(normalize('Hello   World')).toBe('hello world');
  });

  it('trims leading/trailing whitespace', () => {
    expect(normalize('  Rule Title  ')).toBe('rule title');
  });

  it('returns empty string for empty input', () => {
    expect(normalize('')).toBe('');
  });

  it('handles special chars only', () => {
    expect(normalize('---')).toBe('');
  });
});

// ─── checkDuplicateTitles ─────────────────────────────────────────────────────

describe('checkDuplicateTitles', () => {
  it('returns zero errors/warnings for unique titles', () => {
    const rules = [
      makeRule({ title: 'Authentication', skill: 'nextdns-api' }),
      makeRule({ title: 'Error Handling', skill: 'nextdns-api' }),
    ];
    const result = checkDuplicateTitles(rules);
    expect(result.errors).toBe(0);
    expect(result.warnings).toBe(0);
  });

  it('counts an error for duplicate title within same skill', () => {
    const rules = [
      makeRule({
        title: 'Authentication',
        skill: 'nextdns-api',
        file: 'skills/nextdns-api/rules/a.md',
      }),
      makeRule({
        title: 'Authentication',
        skill: 'nextdns-api',
        file: 'skills/nextdns-api/rules/b.md',
      }),
    ];
    const result = checkDuplicateTitles(rules);
    expect(result.errors).toBe(1);
    expect(result.warnings).toBe(0);
  });

  it('counts a warning for same title across different skills', () => {
    const rules = [
      makeRule({ title: 'Security Settings', skill: 'nextdns-api' }),
      makeRule({ title: 'Security Settings', skill: 'nextdns-ui' }),
    ];
    const result = checkDuplicateTitles(rules);
    expect(result.errors).toBe(0);
    expect(result.warnings).toBe(1);
  });

  it('treats frontend framework variants as expected (no error/warning)', () => {
    const rules = [
      makeRule({ title: 'Error Handling', skill: 'nextdns-frontend', subdir: 'nuxt' }),
      makeRule({ title: 'Error Handling', skill: 'nextdns-frontend', subdir: 'nextjs' }),
    ];
    const result = checkDuplicateTitles(rules);
    expect(result.errors).toBe(0);
    expect(result.warnings).toBe(0);
  });

  it('handles empty rules list', () => {
    const result = checkDuplicateTitles([]);
    expect(result.errors).toBe(0);
    expect(result.warnings).toBe(0);
  });
});

// ─── checkDuplicateTags ───────────────────────────────────────────────────────

describe('checkDuplicateTags', () => {
  it('returns 0 for unique tag sets', () => {
    const rules = [
      makeRule({ tagKey: 'api|auth|security', tags: ['api', 'auth', 'security'] }),
      makeRule({ tagKey: 'cli|dns|setup', tags: ['cli', 'dns', 'setup'] }),
    ];
    expect(checkDuplicateTags(rules)).toBe(0);
  });

  it('counts identical tag sets across different rules', () => {
    const rules = [
      makeRule({
        skill: 'nextdns-api',
        tagKey: 'api|auth|security',
        tags: ['api', 'auth', 'security'],
        file: 'a.md',
      }),
      makeRule({
        skill: 'nextdns-ui',
        tagKey: 'api|auth|security',
        tags: ['api', 'auth', 'security'],
        file: 'b.md',
      }),
    ];
    expect(checkDuplicateTags(rules)).toBe(1);
  });

  it('skips frontend framework subdirectory duplicates', () => {
    const rules = [
      makeRule({
        skill: 'nextdns-frontend',
        subdir: 'nuxt',
        tagKey: 'api|auth|security',
        tags: ['api', 'auth', 'security'],
      }),
      makeRule({
        skill: 'nextdns-frontend',
        subdir: 'nextjs',
        tagKey: 'api|auth|security',
        tags: ['api', 'auth', 'security'],
      }),
    ];
    expect(checkDuplicateTags(rules)).toBe(0);
  });

  it('handles rules with empty tags', () => {
    const rules = [
      makeRule({ tagKey: '', tags: [], file: 'a.md' }),
      makeRule({ tagKey: '', tags: [], file: 'b.md' }),
    ];
    expect(checkDuplicateTags(rules)).toBe(0);
  });
});
