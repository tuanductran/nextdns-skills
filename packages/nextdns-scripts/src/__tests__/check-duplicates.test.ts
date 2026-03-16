import { describe, expect, it } from 'vitest';

// ─── Normalize helper (same logic as check-duplicates.ts) ─────────────────

function normalize(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Tests ────────────────────────────────────────────────────────────────────

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

  it('treats near-duplicate titles as equal after normalization', () => {
    expect(normalize('Error Handling')).toBe(normalize('Error handling'));
    expect(normalize('DNS Rewrites')).toBe(normalize('DNS rewrites'));
  });

  it('treats truly different titles as different', () => {
    expect(normalize('Authentication')).not.toBe(normalize('Authorization'));
  });
});

describe('duplicate detection logic', () => {
  interface RuleStub {
    skill: string;
    subdir: string;
    title: string;
    normalizedTitle: string;
  }

  function detectDuplicates(
    rules: RuleStub[]
  ): Array<{ group: RuleStub[]; kind: 'error' | 'warn' | 'info' }> {
    const byTitle = new Map<string, RuleStub[]>();
    for (const r of rules) {
      const g = byTitle.get(r.normalizedTitle) ?? [];
      g.push(r);
      byTitle.set(r.normalizedTitle, g);
    }

    const results: Array<{ group: RuleStub[]; kind: 'error' | 'warn' | 'info' }> = [];
    for (const [, group] of byTitle) {
      if (group.length < 2) continue;
      const skills = [...new Set(group.map((r) => r.skill))];
      const isSingleSkill = skills.length === 1;
      const isFrontendFrameworks =
        skills.every((s) => s === 'nextdns-frontend') && group.every((r) => r.subdir !== '');

      if (isFrontendFrameworks) results.push({ group, kind: 'info' });
      else if (isSingleSkill) results.push({ group, kind: 'error' });
      else results.push({ group, kind: 'warn' });
    }
    return results;
  }

  it('returns empty when no duplicates', () => {
    const rules: RuleStub[] = [
      {
        skill: 'nextdns-api',
        subdir: '',
        title: 'Authentication',
        normalizedTitle: 'authentication',
      },
      { skill: 'nextdns-cli', subdir: '', title: 'Installation', normalizedTitle: 'installation' },
    ];
    expect(detectDuplicates(rules)).toHaveLength(0);
  });

  it('flags same title within same skill as ERROR', () => {
    const rules: RuleStub[] = [
      {
        skill: 'nextdns-api',
        subdir: '',
        title: 'Security Settings',
        normalizedTitle: 'security settings',
      },
      {
        skill: 'nextdns-api',
        subdir: '',
        title: 'Security Settings',
        normalizedTitle: 'security settings',
      },
    ];
    const dups = detectDuplicates(rules);
    expect(dups).toHaveLength(1);
    expect(dups[0].kind).toBe('error');
  });

  it('flags same title across different skills as WARN', () => {
    const rules: RuleStub[] = [
      {
        skill: 'nextdns-api',
        subdir: '',
        title: 'Privacy Settings',
        normalizedTitle: 'privacy settings',
      },
      {
        skill: 'nextdns-ui',
        subdir: '',
        title: 'Privacy Settings',
        normalizedTitle: 'privacy settings',
      },
    ];
    const dups = detectDuplicates(rules);
    expect(dups).toHaveLength(1);
    expect(dups[0].kind).toBe('warn');
  });

  it('marks framework variants in nextdns-frontend as INFO (expected)', () => {
    const rules: RuleStub[] = [
      {
        skill: 'nextdns-frontend',
        subdir: 'nuxt',
        title: 'API Key Proxy (BFF Pattern)',
        normalizedTitle: 'api key proxy bff pattern',
      },
      {
        skill: 'nextdns-frontend',
        subdir: 'nextjs',
        title: 'API Key Proxy (BFF Pattern)',
        normalizedTitle: 'api key proxy bff pattern',
      },
      {
        skill: 'nextdns-frontend',
        subdir: 'astro',
        title: 'API Key Proxy (BFF Pattern)',
        normalizedTitle: 'api key proxy bff pattern',
      },
    ];
    const dups = detectDuplicates(rules);
    expect(dups).toHaveLength(1);
    expect(dups[0].kind).toBe('info');
  });

  it('does not confuse near-duplicates that share normalized form', () => {
    const rules: RuleStub[] = [
      {
        skill: 'nextdns-api',
        subdir: '',
        title: 'DNS Rewrites',
        normalizedTitle: normalize('DNS Rewrites'),
      },
      {
        skill: 'nextdns-ui',
        subdir: '',
        title: 'DNS Rewrites',
        normalizedTitle: normalize('DNS Rewrites'),
      },
    ];
    const dups = detectDuplicates(rules);
    expect(dups[0].kind).toBe('warn'); // across skills → warn, not error
  });
});
