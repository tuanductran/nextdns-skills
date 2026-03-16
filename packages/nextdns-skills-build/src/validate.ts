#!/usr/bin/env node
/**
 * Validate NextDNS skill rule files follow the correct structure
 */

import { join, relative } from 'node:path';
import { DEFAULT_SKILL, SKILLS } from './config.js';
import { collectRuleFiles } from './utils.js';
import { parseRuleFile } from './parser.js';
import type { Rule } from './types.js';

interface ValidationError {
  file: string;
  ruleId?: string;
  message: string;
}

/**
 * Validate a rule
 */
function validateRule(rule: Rule, file: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!rule.title || rule.title.trim().length === 0) {
    errors.push({ file, ruleId: rule.id, message: 'Missing or empty title' });
  }

  if (!rule.explanation || rule.explanation.trim().length === 0) {
    errors.push({ file, ruleId: rule.id, message: 'Missing or empty explanation' });
  }

  const validImpacts: Rule['impact'][] = ['HIGH', 'MEDIUM', 'LOW'];
  if (!validImpacts.includes(rule.impact)) {
    errors.push({
      file,
      ruleId: rule.id,
      message: `Invalid impact level: ${rule.impact}. Must be one of: ${validImpacts.join(', ')}`,
    });
  }

  if (rule.type && !['capability', 'efficiency'].includes(rule.type)) {
    errors.push({
      file,
      ruleId: rule.id,
      message: `Invalid type: ${rule.type}. Must be 'capability' or 'efficiency'`,
    });
  }

  return errors;
}

/**
 * Main validation function
 */
async function validate() {
  try {
    // Support --skill= flag (same as build.ts)
    const args = process.argv.slice(2);
    const skillArg = args.find((a) => a.startsWith('--skill='));
    const skillName = skillArg ? skillArg.split('=')[1] : DEFAULT_SKILL;
    const skillConfig = SKILLS[skillName];
    if (!skillConfig) {
      console.error(`Unknown skill: ${skillName}`);
      console.error(`Available skills: ${Object.keys(SKILLS).join(', ')}`);
      process.exit(1);
    }

    console.log('Validating NextDNS skill rule files...');
    console.log(`Rules directory: ${skillConfig.rulesDir}`);

    const ruleFilePaths = await collectRuleFiles(skillConfig.rulesDir);
    const allErrors: ValidationError[] = [];

    for (const filePath of ruleFilePaths) {
      const relPath = relative(skillConfig.rulesDir, filePath).replace(/\\/g, '/');
      try {
        const { rule } = await parseRuleFile(filePath, skillConfig.sectionMap, relPath);
        const errors = validateRule(rule, relPath);
        allErrors.push(...errors);
      } catch (error) {
        allErrors.push({
          file: relPath,
          message: `Failed to parse: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }

    if (allErrors.length > 0) {
      console.error('\n✗ Validation failed:\n');
      allErrors.forEach((error) => {
        console.error(
          `  ${error.file}${error.ruleId ? ` (${error.ruleId})` : ''}: ${error.message}`
        );
      });
      process.exit(1);
    } else {
      console.log(`✓ All ${ruleFilePaths.length} rule files are valid`);
    }
  } catch (error) {
    console.error('Validation failed:', error);
    process.exit(1);
  }
}

validate();
