#!/usr/bin/env node

/**
 * Scaffolding tool to create a new NextDNS skill rule file from a template.
 * Usage: node bin/cli.js migrate --skill=nextdns-api --name=my-rule [--type=capability] [--impact=HIGH]
 */

import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DEFAULT_SKILL, SKILLS } from './config.js';

// Parse CLI args
const args = process.argv.slice(2);
function getArg(name: string): string | undefined {
  const arg = args.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : undefined;
}

const skillName = getArg('skill') ?? DEFAULT_SKILL;
const ruleName = getArg('name');
const ruleType = getArg('type') ?? 'capability';
const ruleImpact = getArg('impact') ?? 'MEDIUM';

async function migrate() {
  try {
    const skill = SKILLS[skillName];
    if (!skill) {
      console.error(`Unknown skill: ${skillName}`);
      console.error(`Available skills: ${Object.keys(SKILLS).join(', ')}`);
      process.exit(1);
    }

    if (!ruleName) {
      console.error(
        'Usage: node bin/cli.js migrate --skill=<skill> --name=<rule-name> [--type=capability|efficiency] [--impact=HIGH|MEDIUM|LOW]'
      );
      console.error('\nAvailable skills:', Object.keys(SKILLS).join(', '));
      process.exit(1);
    }

    // Ensure rules directory exists
    if (!existsSync(skill.rulesDir)) {
      await mkdir(skill.rulesDir, { recursive: true });
    }

    const ruleFile = join(skill.rulesDir, `${ruleName}.md`);
    if (existsSync(ruleFile)) {
      console.error(`Rule file already exists: ${ruleFile}`);
      process.exit(1);
    }

    const titleCased = ruleName
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const template = `---
title: '${titleCased}'
impact: ${ruleImpact}
impactDescription: 'TODO: describe the impact of non-compliance'
type: ${ruleType}
tags:
  - TODO
  - add
  - relevant
  - tags
---

# ${titleCased}

TODO: one-line description of this rule

## Overview

TODO: provide context and the scenario where this rule applies.

## Correct Usage

TODO: describe when and how to use this correctly.

\`\`\`bash
# ✅ Correct example
\`\`\`

## Do NOT Use

TODO: describe the anti-pattern to avoid.

\`\`\`bash
# ❌ Incorrect example
\`\`\`

## Troubleshooting

TODO: step-by-step diagnostic guidance.

## Reference

- [NextDNS Documentation](https://nextdns.io/docs)
`;

    await writeFile(ruleFile, template, 'utf-8');
    console.log(`✓ Created rule file: ${ruleFile}`);
    console.log(`\nNext steps:`);
    console.log(`  1. Edit ${ruleFile} with actual content`);
    console.log(`  2. Register the rule in ${skill.skillDir}/SKILL.md`);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
