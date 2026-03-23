import { describe, expect, it } from 'vitest';

// ─── Tag validation rules (mirrors check-tags.ts logic) ──────────────────────

const MIN_TAGS = 3;
const MAX_TAGS = 10;

const KNOWN_ACRONYMS = new Set([
  'cli',
  'dns',
  'api',
  'sse',
  'bff',
  'tld',
  'tlds',
  'ecs',
  'doh',
  'dot',
  'gui',
  'nrd',
  'ttl',
  'jffs',
  'ntp',
  'vpn',
  'mdm',
  'lan',
  'wan',
  'ssh',
  'nas',
  'iot',
  'tcp',
  'udp',
  'url',
  'uri',
  'http',
  'https',
  'html',
  'json',
  'yaml',
  'csv',
  'id',
  'ip',
  'ui',
  'ux',
  'ci',
  'cd',
  'pr',
  'os',
  'pc',
  'tv',
  'crud',
  'patch',
  'delete',
  'put',
  'post',
  'get',
  'rest',
  'exe',
  'msi',
  'pkg',
  'apk',
  'iso',
]);

interface TagIssue {
  level: 'error' | 'warn';
  message: string;
}

function validateTags(tags: string[]): TagIssue[] {
  const issues: TagIssue[] = [];

  if (tags.length === 0) {
    issues.push({ level: 'error', message: 'No tags defined (minimum 3 required)' });
    return issues;
  }

  if (tags.length < MIN_TAGS) {
    issues.push({ level: 'error', message: `Only ${tags.length} tag(s) — minimum is ${MIN_TAGS}` });
  }

  if (tags.length > MAX_TAGS) {
    issues.push({
      level: 'warn',
      message: `${tags.length} tags — consider trimming to max ${MAX_TAGS}`,
    });
  }

  const shortTags = tags.filter((t) => t.trim().length <= 1);
  if (shortTags.length > 0) {
    issues.push({ level: 'error', message: `Single-character tags: [${shortTags.join(', ')}]` });
  }

  const seen = new Set<string>();
  const dupes: string[] = [];
  for (const tag of tags) {
    const key = tag.toLowerCase();
    if (seen.has(key)) dupes.push(tag);
    seen.add(key);
  }
  if (dupes.length > 0) {
    issues.push({ level: 'error', message: `Duplicate tags: [${dupes.join(', ')}]` });
  }

  const allcapsTags = tags.filter((t) => {
    if (/^[A-Z][A-Z]+-[A-Z][A-Z]+$/.test(t)) return false; // DD-WRT style
    const stripped = t.replace(/[^a-zA-Z]/g, '');
    if (stripped.length === 0) return false;
    if (stripped === stripped.toUpperCase() && stripped.length > 2) {
      return !KNOWN_ACRONYMS.has(stripped.toLowerCase());
    }
    return false;
  });

  if (allcapsTags.length > 0) {
    issues.push({ level: 'warn', message: `Unexpected ALLCAPS tags: [${allcapsTags.join(', ')}]` });
  }

  return issues;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('validateTags — count rules', () => {
  it('passes with exactly 3 tags', () => {
    const issues = validateTags(['docker', 'container', 'deployment']);
    expect(issues.filter((i) => i.level === 'error')).toHaveLength(0);
  });

  it('passes with 10 tags', () => {
    const tags = Array.from({ length: 10 }, (_, i) => `tag-${i}`);
    expect(validateTags(tags).filter((i) => i.level === 'error')).toHaveLength(0);
  });

  it('errors with 0 tags', () => {
    const issues = validateTags([]);
    expect(issues.some((i) => i.level === 'error')).toBe(true);
  });

  it('errors with only 1 tag', () => {
    const issues = validateTags(['docker']);
    expect(issues.some((i) => i.level === 'error' && i.message.includes('minimum'))).toBe(true);
  });

  it('errors with only 2 tags', () => {
    const issues = validateTags(['docker', 'container']);
    expect(issues.some((i) => i.level === 'error')).toBe(true);
  });

  it('warns with 11 tags', () => {
    const tags = Array.from({ length: 11 }, (_, i) => `tag-${i}`);
    expect(
      validateTags(tags).some((i) => i.level === 'warn' && i.message.includes('trimming'))
    ).toBe(true);
  });
});

describe('validateTags — single character tags', () => {
  it('errors on single-character tag', () => {
    const issues = validateTags(['a', 'docker', 'container']);
    expect(issues.some((i) => i.message.includes('Single-character'))).toBe(true);
  });

  it('allows two-character tags', () => {
    const issues = validateTags(['ip', 'ui', 'ux']);
    expect(issues.some((i) => i.message.includes('Single-character'))).toBe(false);
  });
});

describe('validateTags — duplicate detection', () => {
  it('errors on duplicate tags (case-insensitive)', () => {
    const issues = validateTags(['docker', 'Docker', 'container']);
    expect(issues.some((i) => i.message.includes('Duplicate'))).toBe(true);
  });

  it('passes with unique lowercase tags', () => {
    const issues = validateTags(['docker', 'container', 'deployment']);
    expect(issues.some((i) => i.message.includes('Duplicate'))).toBe(false);
  });
});

describe('validateTags — ALLCAPS handling', () => {
  it('allows known acronyms (CLI, DNS, API, etc.)', () => {
    const issues = validateTags(['cli', 'dns', 'api']);
    expect(issues.some((i) => i.message.includes('ALLCAPS'))).toBe(false);
  });

  it('allows HTTP verbs (PATCH, DELETE, POST)', () => {
    const issues = validateTags(['patch', 'delete', 'post']);
    expect(issues.some((i) => i.message.includes('ALLCAPS'))).toBe(false);
  });

  it('allows hyphenated ALLCAPS brand names like DD-WRT', () => {
    const issues = validateTags(['DD-WRT', 'router', 'installation']);
    expect(issues.some((i) => i.message.includes('ALLCAPS'))).toBe(false);
  });

  it('warns on unexpected ALLCAPS (e.g. FOOBAR)', () => {
    const issues = validateTags(['FOOBAR', 'docker', 'container']);
    expect(issues.some((i) => i.level === 'warn' && i.message.includes('ALLCAPS'))).toBe(true);
  });

  it('allows camelCase proper nouns (runtimeConfig, useFetch)', () => {
    // camelCase is not ALLCAPS — should not be flagged
    const issues = validateTags(['runtimeConfig', 'useFetch', 'vue']);
    expect(issues.some((i) => i.message.includes('ALLCAPS'))).toBe(false);
  });
});
