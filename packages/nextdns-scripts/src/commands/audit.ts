#!/usr/bin/env node
/**
 * Run the complete repository maintenance audit.
 *
 * Usage:
 *   nextdns-skills-scripts audit
 *   nextdns-skills-scripts audit --json
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getRepositoryRoot } from '../core/paths.js';
import { checkDuplicateTags, checkDuplicateTitles, loadAllRules } from './check-duplicates.js';
import { validateTags } from './check-tags.js';
import { buildReport, type StatsReport } from './generate-stats.js';
import { validateFrontmatter, validateReferentialIntegrity } from './validate-rules.js';

const REPO_ROOT = getRepositoryRoot(import.meta.url);
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');

export interface AuditCheck {
  name: 'referential-integrity' | 'frontmatter' | 'tags' | 'duplicate-titles' | 'duplicate-tags';
  passed: boolean;
  errors: number;
  warnings: number;
}

export interface AuditReport {
  generatedAt: string;
  passed: boolean;
  ruleCount: number;
  checks: AuditCheck[];
  statistics: StatsReport;
}

function suppressOutput<T>(fn: () => T): T {
  const log = console.log;
  const error = console.error;
  console.log = () => undefined;
  console.error = () => undefined;
  try {
    return fn();
  } finally {
    console.log = log;
    console.error = error;
  }
}

export function runAudit(
  skillsDir: string = SKILLS_DIR,
  repoRoot: string = REPO_ROOT
): AuditReport {
  const rules = suppressOutput(() => loadAllRules(skillsDir));
  const duplicateTitles = suppressOutput(() => checkDuplicateTitles(rules));
  const duplicateTags = suppressOutput(() => checkDuplicateTags(rules));
  const referentialIntegrity = suppressOutput(() => validateReferentialIntegrity(skillsDir));
  const frontmatter = suppressOutput(() => validateFrontmatter(skillsDir));
  const tags = suppressOutput(() => validateTags(skillsDir));

  const checks: AuditCheck[] = [
    {
      name: 'referential-integrity',
      passed: referentialIntegrity,
      errors: referentialIntegrity ? 0 : 1,
      warnings: 0,
    },
    {
      name: 'frontmatter',
      passed: frontmatter,
      errors: frontmatter ? 0 : 1,
      warnings: 0,
    },
    {
      name: 'tags',
      passed: tags,
      errors: tags ? 0 : 1,
      warnings: 0,
    },
    {
      name: 'duplicate-titles',
      passed: duplicateTitles.errors === 0,
      errors: duplicateTitles.errors,
      warnings: duplicateTitles.warnings,
    },
    {
      name: 'duplicate-tags',
      passed: duplicateTags === 0,
      errors: 0,
      warnings: duplicateTags,
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    passed: checks.every((check) => check.passed),
    ruleCount: rules.length,
    checks,
    statistics: buildReport(skillsDir, repoRoot),
  };
}

export function formatAuditText(report: AuditReport): string {
  const lines = [
    `NextDNS Skills audit — ${report.generatedAt}`,
    `Rules checked: ${report.ruleCount}`,
    '',
    ...report.checks.map(
      (check) =>
        `${check.passed ? 'PASS' : 'FAIL'} ${check.name} ` +
        `(errors: ${check.errors}, warnings: ${check.warnings})`
    ),
    '',
    report.passed ? 'Audit passed.' : 'Audit failed.',
  ];
  return lines.join('\n');
}

export function run(): void {
  const args = process.argv.slice(2);
  const report = runAudit();
  if (args.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatAuditText(report));
  }
  process.exitCode = report.passed ? 0 : 1;
}

if (fileURLToPath(import.meta.url) === process.argv[1]) run();
