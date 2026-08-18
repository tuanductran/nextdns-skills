import { describe, expect, it } from 'vitest';

import {
  parseBuildCliOptions,
  parseExportCliOptions,
  parseMigrateCliOptions,
  parseSearchCliOptions,
  parseSkillCommandCliOptions,
} from '../index.js';

describe('build CLI options', () => {
  it('uses the default build behavior without arguments', () => {
    expect(parseBuildCliOptions()).toEqual({
      all: false,
      check: false,
      upgradeVersion: false,
    });
  });

  it('accepts a known skill and check flags', () => {
    expect(parseBuildCliOptions(['--skill=nextdns-api', '--check'])).toEqual({
      all: false,
      check: true,
      upgradeVersion: false,
      skill: 'nextdns-api',
    });
  });

  it('rejects conflicting all and skill options', () => {
    expect(() => parseBuildCliOptions(['--all', '--skill=nextdns-api'])).toThrow(
      'Options --all and --skill cannot be used together'
    );
  });
});

describe('search CLI options', () => {
  it('normalizes impact and accepts JSON output', () => {
    expect(parseSearchCliOptions(['--impact=medium', '--json'])).toEqual({
      impact: 'MEDIUM',
      json: true,
    });
  });

  it('requires at least one search filter', () => {
    expect(() => parseSearchCliOptions(['--json'])).toThrow(
      'Search requires at least one filter option'
    );
  });

  it('rejects unknown skills and unknown options', () => {
    expect(() => parseSearchCliOptions(['--skill=missing'])).toThrow('Unknown skill name');
    expect(() => parseSearchCliOptions(['--query=dns', '--unsupported=value'])).toThrow(
      'unknown option "--unsupported"'
    );
  });
});

describe('export CLI options', () => {
  it('defaults to JSON output for all skills', () => {
    expect(parseExportCliOptions()).toEqual({ format: 'json' });
  });

  it('accepts CSV output, a target skill and an output path', () => {
    expect(
      parseExportCliOptions(['--format=csv', '--skill=nextdns-cli', '--out=rules.csv'])
    ).toEqual({ format: 'csv', skill: 'nextdns-cli', out: 'rules.csv' });
  });

  it('rejects an unsupported format and empty output path', () => {
    expect(() => parseExportCliOptions(['--format=xml'])).toThrow();
    expect(() => parseExportCliOptions(['--out='])).toThrow('requires a value');
  });
});

describe('migrate CLI options', () => {
  it('applies defaults and accepts valid rule metadata', () => {
    expect(parseMigrateCliOptions(['--name=rate-limiting'])).toEqual({
      skill: 'nextdns-api',
      name: 'rate-limiting',
      type: 'capability',
      impact: 'MEDIUM',
    });
  });

  it('rejects invalid rule names, types and impacts', () => {
    expect(() => parseMigrateCliOptions(['--name=Rate Limiting'])).toThrow(
      'Rule name must use kebab-case'
    );
    expect(() => parseMigrateCliOptions(['--name=valid-name', '--type=unknown'])).toThrow();
    expect(() => parseMigrateCliOptions(['--name=valid-name', '--impact=CRITICAL'])).toThrow();
  });
});

describe('skill-only CLI options', () => {
  it('accepts an optional known skill', () => {
    expect(parseSkillCommandCliOptions(['--skill=integrations'])).toEqual({
      skill: 'integrations',
    });
    expect(parseSkillCommandCliOptions()).toEqual({});
  });

  it('rejects duplicate and missing-value options', () => {
    expect(() =>
      parseSkillCommandCliOptions(['--skill=nextdns-api', '--skill=nextdns-cli'])
    ).toThrow('duplicate option "--skill"');
    expect(() => parseSkillCommandCliOptions(['--skill'])).toThrow('requires a value');
  });
});
