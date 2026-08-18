/**
 * Detect duplicate rule titles and heavily-overlapping tag sets across all skill categories.
 *
 * Severity levels:
 *   ERROR  — same title within the same skill (unintentional duplicate)
 *   WARN   — same title across different top-level skills (e.g. nextdns-api vs nextdns-ui)
 *   INFO   — same title across framework subdirectories of nextdns-frontend (expected pattern)
 *
 * Also detects identical tag sets across any two rules (WARN).
 */

import fs from 'node:fs';
import path from 'node:path';

import { getRepositoryRoot } from '../core/paths.js';
import { collectRuleFiles, parseFrontmatter } from '../core/utils.js';

const REPO_ROOT = getRepositoryRoot(import.meta.url);
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');

const RED = '\x1b[0;31m';
const YELLOW = '\x1b[0;33m';
const BLUE = '\x1b[0;34m';
const GREEN = '\x1b[0;32m';
const NC = '\x1b[0m';

export interface RuleEntry {
  file: string;
  skill: string;
  subdir: string;
  title: string;
  normalizedTitle: string;
  tags: string[];
  tagKey: string;
}

export interface DuplicateTitleResult {
  errors: number;
  warnings: number;
}

export function normalize(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function loadAllRules(skillsDir: string = SKILLS_DIR): RuleEntry[] {
  const entries: RuleEntry[] = [];

  const skillDirs = fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => ({ name: e.name, dir: path.join(skillsDir, e.name) }));

  for (const { name: skill, dir } of skillDirs) {
    const rulesDir = path.join(dir, 'rules');
    if (!fs.existsSync(rulesDir)) continue;

    for (const filePath of collectRuleFiles(rulesDir)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const fm = parseFrontmatter(content);
      const title = typeof fm['title'] === 'string' ? fm['title'] : '';
      const tags = Array.isArray(fm['tags']) ? fm['tags'] : [];

      const rel = path.relative(path.join(dir, 'rules'), filePath);
      const parts = rel.split(path.sep);
      const subdir = parts.length > 1 ? (parts[0] ?? '') : '';

      entries.push({
        file: path.relative(path.resolve(skillsDir, '../..'), filePath),
        skill,
        subdir,
        title,
        normalizedTitle: normalize(title),
        tags,
        tagKey: [...tags].sort().join('|'),
      });
    }
  }

  return entries;
}

export function checkDuplicateTitles(rules: RuleEntry[]): DuplicateTitleResult {
  console.log('🔍 Checking for duplicate titles...');
  let errors = 0;
  let warnings = 0;

  const byTitle = new Map<string, RuleEntry[]>();
  for (const rule of rules) {
    if (!rule.normalizedTitle) continue;
    const g = byTitle.get(rule.normalizedTitle) ?? [];
    g.push(rule);
    byTitle.set(rule.normalizedTitle, g);
  }

  for (const [, group] of byTitle) {
    if (group.length < 2) continue;
    const first = group[0];
    if (!first) continue;

    const skills = [...new Set(group.map((r) => r.skill))];
    const isSingleSkill = skills.length === 1;
    const isFrontendFrameworks =
      skills.every((s) => s === 'nextdns-frontend') && group.every((r) => r.subdir !== '');

    if (isFrontendFrameworks) {
      console.log(`\n${BLUE}ℹ️  Framework variants (expected): "${first.title}"${NC}`);
      for (const r of group) console.log(`  → ${r.file} [${r.subdir}]`);
      continue;
    }

    if (isSingleSkill) {
      console.log(
        `\n${RED}❌ ERROR — duplicate within skill "${first.skill}": "${first.title}"${NC}`
      );
      for (const r of group) console.log(`  → ${r.file}`);
      errors++;
    } else {
      console.log(
        `\n${YELLOW}⚠️  WARN — same title across skills [${skills.join(', ')}]: "${first.title}"${NC}`
      );
      for (const r of group) console.log(`  → ${r.file}`);
      warnings++;
    }
  }

  if (errors === 0 && warnings === 0)
    console.log(`${GREEN}✓ No problematic duplicate titles found${NC}`);
  return { errors, warnings };
}

export function checkDuplicateTags(rules: RuleEntry[]): number {
  console.log('\n🔍 Checking for identical tag sets...');
  let issues = 0;

  const byTagKey = new Map<string, RuleEntry[]>();
  for (const rule of rules) {
    if (!rule.tagKey || rule.tags.length === 0) continue;
    const g = byTagKey.get(rule.tagKey) ?? [];
    g.push(rule);
    byTagKey.set(rule.tagKey, g);
  }

  for (const [tagKey, group] of byTagKey) {
    if (group.length < 2) continue;
    if (group.every((r) => r.skill === 'nextdns-frontend' && r.subdir !== '')) continue;
    console.log(`\n${YELLOW}⚠️  Identical tag set: [${tagKey.replace(/\|/g, ', ')}]${NC}`);
    for (const r of group) console.log(`  → ${r.file} ("${r.title}")`);
    issues++;
  }

  if (issues === 0) console.log(`${GREEN}✓ No problematic identical tag sets found${NC}`);
  return issues;
}

export function run(): void {
  const rules = loadAllRules();
  console.log(`Loaded ${rules.length} rules\n`);

  const { errors, warnings } = checkDuplicateTitles(rules);
  const tagIssues = checkDuplicateTags(rules);

  console.log('\n──────────────────────────────');
  if (errors > 0) {
    console.log(
      `${RED}${errors} hard error(s), ${warnings} warning(s), ${tagIssues} tag issue(s).${NC}`
    );
    process.exit(1);
  }
  if (warnings + tagIssues > 0) {
    console.log(
      `${YELLOW}0 errors, ${warnings} warning(s), ${tagIssues} tag issue(s). No blocking issues.${NC}`
    );
  } else {
    console.log(`${GREEN}✅ All clear!${NC}`);
  }
  process.exit(0);
}

// Run only when executed directly (not imported as a module in tests)
