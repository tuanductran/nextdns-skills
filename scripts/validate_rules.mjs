#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

/* ========= Colors ========= */
const RED = '\x1b[0;31m';
const GREEN = '\x1b[0;32m';
const NC = '\x1b[0m';

/* ========= Helpers ========= */
function printError(message) {
  console.log(`${RED}❌ ERROR: ${message}${NC}`);
}

function printSuccess(message) {
  console.log(`${GREEN}✓ ${message}${NC}`);
}

function walkDir(dir, matcher) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walkDir(fullPath, matcher));
    } else if (matcher(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

/* ========= Referential Integrity Helpers ========= */
function checkUnregisteredRules(skillFile, rulesDir, skillContent) {
  if (!fs.existsSync(rulesDir) || !fs.statSync(rulesDir).isDirectory()) return false;

  let errorsFound = false;
  const ruleFiles = fs.readdirSync(rulesDir).filter((f) => f.endsWith('.md'));

  for (const ruleFile of ruleFiles) {
    if (!skillContent.includes(`(rules/${ruleFile})`)) {
      printError(`Rule '${ruleFile}' exists but is not registered in ${skillFile}`);
      errorsFound = true;
    } else {
      printSuccess(path.basename(ruleFile, '.md'));
    }
  }
  return errorsFound;
}

function checkMissingReferences(skillFile, rulesDir, skillContent) {
  let errorsFound = false;
  const referencedRules = [...skillContent.matchAll(/\[.*?\]\(rules\/(.*?\.md)\)/g)].map(
    (m) => m[1]
  );

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

/* ========= Frontmatter Helpers ========= */
function validateRequiredFields(file, frontmatter) {
  let errorsFound = false;
  const requiredFields = ['title', 'impact', 'impactDescription', 'type', 'tags'];

  for (const field of requiredFields) {
    if (!new RegExp(`^${field}:`, 'm').test(frontmatter)) {
      printError(`Missing field '${field}' in ${file}`);
      errorsFound = true;
    }
  }
  return errorsFound;
}

function validateFieldValues(file, frontmatter) {
  let errorsFound = false;

  const impactMatch = frontmatter.match(/^impact:\s*(.*)/m);
  if (impactMatch && !['HIGH', 'MEDIUM', 'LOW'].includes(impactMatch[1].trim())) {
    printError(`Invalid impact in ${file}: ${impactMatch[1].trim()}`);
    errorsFound = true;
  }

  const typeMatch = frontmatter.match(/^type:\s*(.*)/m);
  if (typeMatch && !['capability', 'efficiency'].includes(typeMatch[1].trim())) {
    printError(`Invalid type in ${file}: ${typeMatch[1].trim()}`);
    errorsFound = true;
  }

  // Validate tags format - must be array, not string
  const tagsMatch = frontmatter.match(/^tags:\s*'(.*)'/m);
  if (tagsMatch) {
    printError(
      `Invalid tags format in ${file}: tags must be an array (use '- item' format), not a string`
    );
    errorsFound = true;
  }

  return errorsFound;
}

function validateContentStructure(file, content) {
  const h1Match = content.match(/^#\s+.*$/m);
  if (h1Match) {
    const afterH1 = content.slice(h1Match.index + h1Match[0].length).trim();
    if (!afterH1) {
      printError(`Missing description after H1 in ${file}`);
      return true;
    }
  }
  return false;
}

/* ========= Core Logic ========= */
function validateReferentialIntegrity() {
  console.log('🔍 Checking referential integrity...');
  let totalErrors = 0;

  for (const skillFile of walkDir('skills', (n) => n === 'SKILL.md')) {
    const skillDir = path.dirname(skillFile);
    const rulesDir = path.join(skillDir, 'rules');
    const skillContent = fs.readFileSync(skillFile, 'utf8');

    console.log(`\nSkill: ${path.basename(skillDir)}`);
    if (checkUnregisteredRules(skillFile, rulesDir, skillContent)) totalErrors++;
    if (checkMissingReferences(skillFile, rulesDir, skillContent)) totalErrors++;
  }
  return totalErrors === 0;
}

function validateFrontmatter() {
  console.log('\n🔍 Validating rule frontmatter and structure...');
  let totalErrors = 0;

  const rules = walkDir('skills', (n) => n.endsWith('.md')).filter((p) =>
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
      printError(`Invalid format in ${file}`);
      totalErrors++;
      continue;
    }

    if (validateRequiredFields(file, parts[1])) totalErrors++;
    if (validateFieldValues(file, parts[1])) totalErrors++;
    if (validateContentStructure(file, parts[2])) totalErrors++;
  }
  return totalErrors === 0;
}

/* ========= Main ========= */
function main() {
  const integrityOk = validateReferentialIntegrity();
  const frontmatterOk = validateFrontmatter();

  if (integrityOk && frontmatterOk) {
    console.log(`\n${GREEN}✅ All validations passed!${NC}`);
    process.exit(0);
  }
  console.log(`\n${RED}❌ Validations failed.${NC}`);
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
