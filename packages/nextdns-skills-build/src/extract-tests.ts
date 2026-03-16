#!/usr/bin/env node
/**
 * Extract test cases from NextDNS skill rules for LLM evaluation
 */

import { writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { DEFAULT_SKILL, SKILLS, TEST_CASES_FILE } from './config.js';
import { collectRuleFiles } from './utils.js';
import { parseRuleFile } from './parser.js';
import type { Rule, TestCase } from './types.js';

/**
 * Extract test cases from a rule.
 * Correct Usage examples → type: 'good'
 * Do NOT Use examples → type: 'bad'
 */
function extractTestCases(rule: Rule): TestCase[] {
  const testCases: TestCase[] = [];

  rule.examples.forEach((example) => {
    const labelLower = example.label.toLowerCase();
    const isBad =
      labelLower.includes('incorrect') ||
      labelLower.includes('wrong') ||
      labelLower.includes('bad') ||
      labelLower.includes('do not') ||
      labelLower.includes("don't");
    const isGood =
      labelLower.includes('correct') ||
      labelLower.includes('good') ||
      labelLower.includes('usage') ||
      labelLower.includes('example');

    if ((isBad || isGood) && example.code && example.code.trim().length > 0) {
      testCases.push({
        ruleId: rule.id,
        ruleTitle: rule.title,
        type: isBad ? 'bad' : 'good',
        code: example.code,
        language: example.language || 'bash',
        description: example.description || `${example.label} example for ${rule.title}`,
      });
    }
  });

  return testCases;
}

/**
 * Main extraction function
 */
async function extractTests() {
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

    console.log('Extracting test cases from NextDNS skill rules...');
    console.log(`Rules directory: ${skillConfig.rulesDir}`);
    console.log(`Output file: ${TEST_CASES_FILE}`);

    const ruleFilePaths = await collectRuleFiles(skillConfig.rulesDir);
    const allTestCases: TestCase[] = [];

    for (const filePath of ruleFilePaths) {
      const relativePath = relative(skillConfig.rulesDir, filePath).replace(/\\/g, '/');
      try {
        const { rule } = await parseRuleFile(filePath, skillConfig.sectionMap, relativePath);
        const testCases = extractTestCases(rule);
        allTestCases.push(...testCases);
      } catch (error) {
        console.error(`Error processing ${relativePath}:`, error);
      }
    }

    // Write test cases as JSON
    await writeFile(TEST_CASES_FILE, JSON.stringify(allTestCases, null, 2), 'utf-8');

    console.log(`✓ Extracted ${allTestCases.length} test cases to ${TEST_CASES_FILE}`);
    console.log(`  - Bad examples: ${allTestCases.filter((tc) => tc.type === 'bad').length}`);
    console.log(`  - Good examples: ${allTestCases.filter((tc) => tc.type === 'good').length}`);
  } catch (error) {
    console.error('Extraction failed:', error);
    process.exit(1);
  }
}

extractTests();
