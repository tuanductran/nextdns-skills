#!/usr/bin/env node
/**
 * Validate NextDNS skill rule files for referential integrity and correct frontmatter.
 *
 * Checks:
 *   1. Referential integrity — every rule file is registered in SKILL.md, and every
 *      link in SKILL.md points to an existing rule file.
 *   2. Frontmatter — all required fields present, valid impact/type values, array tags.
 *   3. Content structure — H1 heading is followed by a one-line description.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { walkDir } from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// dist/validate-rules.js → ../../.. = repo root
const REPO_ROOT = path.join(__dirname, '../../..');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');

/* ========= Types ========= */

type ImpactLevel = 'HIGH' | 'MEDIUM' | 'LOW';
type RuleType = 'capability' | 'efficiency';

const VALID_IMPACTS: readonly ImpactLevel[] = ['HIGH', 'MEDIUM', 'LOW'];
const VALID_TYPES: readonly RuleType[] = ['capability', 'efficiency'];
const REQUIRED_FIELDS = ['title', 'impact', 'impactDescription', 'type', 'tags'] as const;

/* ========= Colors ========= */

const RED = '\x1b[0;31m';
const GREEN = '\x1b[0;32m';
const NC = '\x1b[0m';

/* ========= Helpers ========= */

function printError(message: string): void {
  console.log(`${RED}❌ ERROR: ${message}${NC}`);
}

function printSuccess(message: string): void {
  console.log(`${GREEN}✓ ${message}${NC}`);
}

/* ========= Referential Integrity ========= */

function checkUnregisteredRules(
  skillFile: string,
  rulesDir: string,
  skillContent: string
): boolean {
  if (!fs.existsSync(rulesDir) || !fs.statSync(rulesDir).isDirectory()) return false;

  let errorsFound = false;
  const ruleFilePaths = walkDir(rulesDir, (n) => n.endsWith('.md'));

  for (const fullPath of ruleFilePaths) {
    const relPath = path.relative(rulesDir, fullPath).split(path.sep).join('/');
    if (!skillContent.includes(`(rules/${relPath})`)) {
      printError(`Rule '${relPath}' exists but is not registered in ${skillFile}`);
      errorsFound = true;
    } else {
      printSuccess(path.basename(fullPath, '.md'));
    }
  }
  return errorsFound;
}

function checkMissingReferences(
  skillFile: string,
  rulesDir: string,
  skillContent: string
): boolean {
  let errorsFound = false;
  const referencedRules = [...skillContent.matchAll(/\[.*?\]\(rules\/(.*?\.md)\)/g)]
    .map((m) => m[1] ?? '')
    .filter(Boolean);

  for (const ruleRef of referencedRules) {
    const rulePath = path.join(rulesDir, ruleRef);
    if (!fs.existsSync(rulePath)) {
      printError(`Rule referenced in ${skillFile} does not exist: ${rulePath}`);
      errorsFound = true;
    } else {
      printSuccess(ruleRef);
    }
  }
  return errorsFound;
}

/* ========= Frontmatter Validation ========= */

function validateRequiredFields(file: string, frontmatter: string): boolean {
  let errorsFound = false;
  for (const field of REQUIRED_FIELDS) {
    if (!new RegExp(`^${field}:`, 'm').test(frontmatter)) {
      printError(`Missing field '${field}' in ${file}`);
      errorsFound = true;
    }
  }
  return errorsFound;
}

function validateFieldValues(file: string, frontmatter: string): boolean {
  let errorsFound = false;

  const impactMatch = frontmatter.match(/^impact:\s*(.*)/m);
  if (impactMatch) {
    const impact = (impactMatch[1] ?? '').trim();
    if (!VALID_IMPACTS.includes(impact as ImpactLevel)) {
      printError(
        `Invalid impact in ${file}: '${impact}'. Must be one of: ${VALID_IMPACTS.join(', ')}`
      );
      errorsFound = true;
    }
  }

  const typeMatch = frontmatter.match(/^type:\s*(.*)/m);
  if (typeMatch) {
    const type = (typeMatch[1] ?? '').trim();
    if (!VALID_TYPES.includes(type as RuleType)) {
      printError(`Invalid type in ${file}: '${type}'. Must be one of: ${VALID_TYPES.join(', ')}`);
      errorsFound = true;
    }
  }

  // Tags must be YAML array format (- item lines), not a scalar string
  const tagsStringMatch = frontmatter.match(/^tags:\s*'(.*)'/m);
  if (tagsStringMatch) {
    printError(
      `Invalid tags format in ${file}: tags must be a YAML array ('- item' format), not a string`
    );
    errorsFound = true;
  }

  return errorsFound;
}

function validateContentStructure(file: string, content: string): boolean {
  const h1Match = content.match(/^#\s+.*$/m);
  if (h1Match) {
    const afterH1 = content.slice((h1Match.index ?? 0) + h1Match[0].length).trim();
    if (!afterH1) {
      printError(`Missing description after H1 in ${file}`);
      return true;
    }
  }
  return false;
}

/* ========= Core Logic ========= */

function validateReferentialIntegrity(): boolean {
  console.log('🔍 Checking referential integrity...');
  let hasErrors = false;

  for (const skillFile of walkDir(SKILLS_DIR, (n) => n === 'SKILL.md')) {
    const skillDir = path.dirname(skillFile);
    const rulesDir = path.join(skillDir, 'rules');
    const skillContent = fs.readFileSync(skillFile, 'utf8');

    console.log(`\nSkill: ${path.basename(skillDir)}`);
    if (checkUnregisteredRules(skillFile, rulesDir, skillContent)) hasErrors = true;
    if (checkMissingReferences(skillFile, rulesDir, skillContent)) hasErrors = true;
  }
  return !hasErrors;
}

function validateFrontmatter(): boolean {
  console.log('\n🔍 Validating rule frontmatter and structure...');
  let totalErrors = 0;

  const rules = walkDir(SKILLS_DIR, (n) => n.endsWith('.md')).filter((p) =>
    p.includes(`${path.sep}rules${path.sep}`)
  );

  for (const file of rules) {
    const content = fs.readFileSync(file, 'utf8');
    if (!content.startsWith('---')) {
      printError(`No frontmatter in ${file}`);
      totalErrors++;
      continue;
    }

    const parts = content.split('---', 3);
    if (parts.length < 3) {
      printError(`Invalid frontmatter format in ${file}`);
      totalErrors++;
      continue;
    }

    const frontmatter = parts[1] ?? '';
    const body = parts[2] ?? '';
    if (validateRequiredFields(file, frontmatter)) totalErrors++;
    if (validateFieldValues(file, frontmatter)) totalErrors++;
    if (validateContentStructure(file, body)) totalErrors++;
  }
  return totalErrors === 0;
}

/* ========= Main ========= */

const integrityOk = validateReferentialIntegrity();
const frontmatterOk = validateFrontmatter();

if (integrityOk && frontmatterOk) {
  console.log(`\n${GREEN}✅ All validations passed!${NC}`);
  process.exit(0);
}

console.log(`\n${RED}❌ Validations failed.${NC}`);
process.exit(1);
