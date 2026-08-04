import { describe, expect, it } from 'vite-plus/test';

import type { Rule } from '../types.js';

import { validateRule, type ValidationError } from '../validate.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRule(overrides: Partial<Rule> = {}): Rule {
  return {
    id: '1.1',
    title: 'Authentication',
    section: 1,
    impact: 'HIGH',
    impactDescription: 'API key required for all requests',
    explanation: 'Always authenticate requests using the X-Api-Key header.',
    examples: [],
    references: [],
    type: 'capability',
    tags: ['api', 'security', 'authentication'],
    ...overrides,
  };
}

// ─── validateRule ─────────────────────────────────────────────────────────────

describe('validateRule — title', () => {
  it('passes for a valid rule', () => {
    const errors = validateRule(makeRule(), 'auth.md');
    expect(errors).toHaveLength(0);
  });

  it('errors when title is empty', () => {
    const errors = validateRule(makeRule({ title: '' }), 'auth.md');
    expect(errors.some((e: ValidationError) => e.message.includes('title'))).toBe(true);
  });

  it('errors when title is whitespace only', () => {
    const errors = validateRule(makeRule({ title: '   ' }), 'auth.md');
    expect(errors.some((e: ValidationError) => e.message.includes('title'))).toBe(true);
  });
});

describe('validateRule — explanation', () => {
  it('errors when explanation is empty', () => {
    const errors = validateRule(makeRule({ explanation: '' }), 'auth.md');
    expect(errors.some((e: ValidationError) => e.message.includes('explanation'))).toBe(true);
  });

  it('errors when explanation is whitespace only', () => {
    const errors = validateRule(makeRule({ explanation: '   ' }), 'auth.md');
    expect(errors.some((e: ValidationError) => e.message.includes('explanation'))).toBe(true);
  });
});

describe('validateRule — impact', () => {
  it('accepts HIGH impact', () => {
    const errors = validateRule(makeRule({ impact: 'HIGH' }), 'auth.md');
    expect(errors).toHaveLength(0);
  });

  it('accepts MEDIUM impact', () => {
    const errors = validateRule(makeRule({ impact: 'MEDIUM' }), 'auth.md');
    expect(errors).toHaveLength(0);
  });

  it('accepts LOW impact', () => {
    const errors = validateRule(makeRule({ impact: 'LOW' }), 'auth.md');
    expect(errors).toHaveLength(0);
  });

  it('errors on invalid impact', () => {
    const errors = validateRule(makeRule({ impact: 'CRITICAL' as Rule['impact'] }), 'auth.md');
    expect(errors.some((e: ValidationError) => e.message.includes('impact'))).toBe(true);
  });
});

describe('validateRule — type', () => {
  it('accepts capability type', () => {
    const errors = validateRule(makeRule({ type: 'capability' }), 'auth.md');
    expect(errors).toHaveLength(0);
  });

  it('accepts efficiency type', () => {
    const errors = validateRule(makeRule({ type: 'efficiency' }), 'auth.md');
    expect(errors).toHaveLength(0);
  });

  it('accepts missing type (optional)', () => {
    const rule = makeRule();
    // exactOptionalPropertyTypes: remove the property entirely
    const { type: _removed, ...rest } = rule;
    void _removed;
    const errors = validateRule(rest as unknown as Rule, 'auth.md');
    expect(errors).toHaveLength(0);
  });

  it('errors on invalid type', () => {
    const rule = Object.assign(makeRule(), { type: 'unknown' }) as Rule;
    const errors = validateRule(rule, 'auth.md');
    expect(errors.some((e: ValidationError) => e.message.includes('type'))).toBe(true);
  });
});

describe('validateRule — file path propagation', () => {
  it('includes the file path in error', () => {
    const errors = validateRule(makeRule({ title: '' }), 'skills/nextdns-api/rules/auth.md');
    expect(errors[0]?.file).toBe('skills/nextdns-api/rules/auth.md');
  });

  it('includes the ruleId in error when present', () => {
    const errors = validateRule(makeRule({ title: '', id: '2.3' }), 'auth.md');
    expect(errors[0]?.ruleId).toBe('2.3');
  });
});
