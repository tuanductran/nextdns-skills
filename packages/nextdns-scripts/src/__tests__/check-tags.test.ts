import { describe, expect, it } from 'vite-plus/test';

import { KNOWN_ACRONYMS, MAX_TAGS, MIN_TAGS, validateFileTags } from '../check-tags.js';

describe('validateFileTags — tag count', () => {
  it('errors when no tags', () => {
    const errs = validateFileTags([], 'test.md');
    expect(errs).toHaveLength(1);
    expect(errs[0]?.level).toBe('error');
    expect(errs[0]?.message).toMatch(/minimum 3/);
  });

  it('errors when below MIN_TAGS', () => {
    const errs = validateFileTags(['dns', 'api'], 'test.md');
    expect(errs.some((e) => e.message.includes(`minimum is ${MIN_TAGS}`))).toBe(true);
  });

  it('warns when above MAX_TAGS', () => {
    const tags = Array.from({ length: MAX_TAGS + 1 }, (_, i) => `tag${i}`);
    const errs = validateFileTags(tags, 'test.md');
    expect(errs.some((e) => e.level === 'warn' && e.message.includes('consider trimming'))).toBe(
      true
    );
  });

  it('passes with exactly MIN_TAGS tags', () => {
    const errs = validateFileTags(['dns', 'api', 'setup'], 'test.md');
    expect(errs).toHaveLength(0);
  });
});

describe('validateFileTags — single-character tags', () => {
  it('errors on single-character tag', () => {
    const errs = validateFileTags(['a', 'dns', 'api'], 'test.md');
    expect(errs.some((e) => e.message.includes('Single-character'))).toBe(true);
  });

  it('does not error on two-character tag', () => {
    const errs = validateFileTags(['ip', 'dns', 'api'], 'test.md');
    expect(errs.every((e) => !e.message.includes('Single-character'))).toBe(true);
  });
});

describe('validateFileTags — duplicate tags', () => {
  it('errors on duplicate tag (case-insensitive)', () => {
    const errs = validateFileTags(['dns', 'DNS', 'api'], 'test.md');
    expect(errs.some((e) => e.message.includes('Duplicate tags'))).toBe(true);
  });

  it('passes with no duplicates', () => {
    const errs = validateFileTags(['dns', 'api', 'setup'], 'test.md');
    expect(errs).toHaveLength(0);
  });
});

describe('validateFileTags — ALLCAPS tags', () => {
  it('warns on unknown ALLCAPS tag', () => {
    const errs = validateFileTags(['UNKNOWN', 'dns', 'api'], 'test.md');
    expect(errs.some((e) => e.message.includes('ALLCAPS'))).toBe(true);
  });

  it('allows known acronym in any casing (stored lowercase)', () => {
    // Known acronyms in set are lowercase: 'cli', 'dns', 'api'
    // When tags are already lowercase they should not trigger ALLCAPS check
    const errs = validateFileTags(['cli', 'dns', 'api'], 'test.md');
    expect(errs).toHaveLength(0);
  });

  it('allows hyphenated all-caps brand names like DD-WRT', () => {
    const errs = validateFileTags(['DD-WRT', 'dns', 'api'], 'test.md');
    expect(errs.some((e) => e.message.includes('ALLCAPS'))).toBe(false);
  });
});

describe('validateFileTags — title-case tags', () => {
  it('warns on title-case word', () => {
    const errs = validateFileTags(['Windows', 'dns', 'api'], 'test.md');
    expect(errs.some((e) => e.message.includes('Title-case'))).toBe(true);
  });

  it('allows camelCase API identifiers', () => {
    const errs = validateFileTags(['useFetch', 'runtimeConfig', 'api'], 'test.md');
    expect(errs.every((e) => !e.message.includes('Title-case'))).toBe(true);
  });

  it('warns on title-case within hyphenated tag', () => {
    const errs = validateFileTags(['App-Store', 'dns', 'api'], 'test.md');
    expect(errs.some((e) => e.message.includes('Title-case'))).toBe(true);
  });
});

describe('KNOWN_ACRONYMS', () => {
  it('includes common networking acronyms', () => {
    expect(KNOWN_ACRONYMS.has('dns')).toBe(true);
    expect(KNOWN_ACRONYMS.has('api')).toBe(true);
    expect(KNOWN_ACRONYMS.has('cli')).toBe(true);
    expect(KNOWN_ACRONYMS.has('ssh')).toBe(true);
  });

  it('does not include arbitrary words', () => {
    expect(KNOWN_ACRONYMS.has('windows')).toBe(false);
    expect(KNOWN_ACRONYMS.has('homebrew')).toBe(false);
  });
});
