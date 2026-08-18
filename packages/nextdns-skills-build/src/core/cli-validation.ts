import * as v from 'valibot';

import { DEFAULT_SKILL, SKILLS } from './config.js';

const ImpactSchema = v.picklist(['HIGH', 'MEDIUM', 'LOW']);
const RuleTypeSchema = v.picklist(['capability', 'efficiency']);
const ExportFormatSchema = v.picklist(['json', 'csv']);
const SkillNameSchema = v.pipe(
  v.string(),
  v.check((value) => Object.hasOwn(SKILLS, value), 'Unknown skill name')
);
const NonEmptyStringSchema = v.pipe(v.string(), v.minLength(1));
const RuleNameSchema = v.pipe(
  v.string(),
  v.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Rule name must use kebab-case')
);

interface ParsedFlags {
  booleans: Set<string>;
  values: Map<string, string>;
}

function parseFlags(
  argv: readonly string[],
  booleanOptions: readonly string[],
  valueOptions: readonly string[]
): ParsedFlags {
  const booleanSet = new Set(booleanOptions);
  const valueSet = new Set(valueOptions);
  const booleans = new Set<string>();
  const values = new Map<string, string>();

  for (const token of argv) {
    if (!token.startsWith('--')) {
      throw new Error(`CLI input error: unexpected argument "${token}"`);
    }

    const separator = token.indexOf('=');
    const name = token.slice(2, separator === -1 ? undefined : separator);
    const hasValue = separator !== -1;
    const value = hasValue ? token.slice(separator + 1) : undefined;

    if (!booleanSet.has(name) && !valueSet.has(name)) {
      throw new Error(`CLI input error: unknown option "--${name}"`);
    }
    if (booleanSet.has(name)) {
      if (hasValue) throw new Error(`CLI input error: option "--${name}" does not accept a value`);
      if (booleans.has(name)) throw new Error(`CLI input error: duplicate option "--${name}"`);
      booleans.add(name);
      continue;
    }
    if (value === undefined || value === '') {
      throw new Error(`CLI input error: option "--${name}" requires a value`);
    }
    if (values.has(name)) throw new Error(`CLI input error: duplicate option "--${name}"`);
    values.set(name, value);
  }

  return { booleans, values };
}

export const BuildCliOptionsSchema = v.pipe(
  v.object({
    all: v.boolean(),
    check: v.boolean(),
    upgradeVersion: v.boolean(),
    skill: v.optional(SkillNameSchema),
  }),
  v.check(
    (options) => !(options.all && options.skill !== undefined),
    'Options --all and --skill cannot be used together'
  )
);

export type BuildCliOptions = v.InferOutput<typeof BuildCliOptionsSchema>;

export function parseBuildCliOptions(argv: readonly string[] = []): BuildCliOptions {
  const flags = parseFlags(argv, ['all', 'check', 'upgrade-version'], ['skill']);
  return v.parse(BuildCliOptionsSchema, {
    all: flags.booleans.has('all'),
    check: flags.booleans.has('check'),
    upgradeVersion: flags.booleans.has('upgrade-version'),
    skill: flags.values.get('skill'),
  });
}

export const SearchCliOptionsSchema = v.pipe(
  v.object({
    query: v.optional(NonEmptyStringSchema),
    tag: v.optional(NonEmptyStringSchema),
    skill: v.optional(SkillNameSchema),
    impact: v.optional(ImpactSchema),
    json: v.boolean(),
  }),
  v.check(
    (options) =>
      options.query !== undefined ||
      options.tag !== undefined ||
      options.skill !== undefined ||
      options.impact !== undefined,
    'Search requires at least one filter option'
  )
);

export type SearchCliOptions = v.InferOutput<typeof SearchCliOptionsSchema>;

export function parseSearchCliOptions(argv: readonly string[] = []): SearchCliOptions {
  const flags = parseFlags(argv, ['json'], ['query', 'tag', 'skill', 'impact']);
  return v.parse(SearchCliOptionsSchema, {
    query: flags.values.get('query'),
    tag: flags.values.get('tag'),
    skill: flags.values.get('skill'),
    impact: flags.values.get('impact')?.toUpperCase(),
    json: flags.booleans.has('json'),
  });
}

export const ExportCliOptionsSchema = v.object({
  format: ExportFormatSchema,
  out: v.optional(NonEmptyStringSchema),
  skill: v.optional(SkillNameSchema),
});

export type ExportCliOptions = v.InferOutput<typeof ExportCliOptionsSchema>;

export function parseExportCliOptions(argv: readonly string[] = []): ExportCliOptions {
  const flags = parseFlags(argv, [], ['format', 'out', 'skill']);
  return v.parse(ExportCliOptionsSchema, {
    format: flags.values.get('format') ?? 'json',
    out: flags.values.get('out'),
    skill: flags.values.get('skill'),
  });
}

export const MigrateCliOptionsSchema = v.object({
  skill: SkillNameSchema,
  name: RuleNameSchema,
  type: RuleTypeSchema,
  impact: ImpactSchema,
});

export type MigrateCliOptions = v.InferOutput<typeof MigrateCliOptionsSchema>;

export function parseMigrateCliOptions(argv: readonly string[] = []): MigrateCliOptions {
  const flags = parseFlags(argv, [], ['skill', 'name', 'type', 'impact']);
  return v.parse(MigrateCliOptionsSchema, {
    skill: flags.values.get('skill') ?? DEFAULT_SKILL,
    name: flags.values.get('name'),
    type: flags.values.get('type') ?? 'capability',
    impact: flags.values.get('impact') ?? 'MEDIUM',
  });
}

export const SkillCommandCliOptionsSchema = v.object({
  skill: v.optional(SkillNameSchema),
});

export type SkillCommandCliOptions = v.InferOutput<typeof SkillCommandCliOptionsSchema>;

export function parseSkillCommandCliOptions(argv: readonly string[] = []): SkillCommandCliOptions {
  const flags = parseFlags(argv, [], ['skill']);
  return v.parse(SkillCommandCliOptionsSchema, {
    skill: flags.values.get('skill'),
  });
}
