#!/usr/bin/env node
/**
 * Sync rule counts in README.md and AGENTS.md.
 *
 * Scans the rules/ directory of each skill and updates any count references
 * found in README.md and AGENTS.md to reflect the actual file count.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { walkDir } from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '../../..');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');

/* ========= Types ========= */

export const CATEGORIES = [
  'nextdns-api',
  'nextdns-cli',
  'nextdns-ui',
  'integrations',
  'nextdns-frontend',
] as const;

export type SkillCategory = (typeof CATEGORIES)[number];

/* ========= Helpers ========= */

export function readFile(filePath: string): string | null {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
}

export function writeFile(filePath: string, content: string): void {
  fs.writeFileSync(filePath, content, 'utf8');
}

export function getRuleCount(cat: SkillCategory, skillsDir: string = SKILLS_DIR): number | null {
  const rulesPath = path.join(skillsDir, cat, 'rules');
  if (!fs.existsSync(rulesPath) || !fs.statSync(rulesPath).isDirectory()) {
    return null;
  }
  return walkDir(rulesPath, (file) => file.endsWith('.md')).length;
}

export function updateDocument(
  filePath: string,
  categories: readonly SkillCategory[],
  patternGenerator: (cat: SkillCategory) => RegExp,
  name: string,
  skillsDir: string = SKILLS_DIR
): void {
  const content = readFile(filePath);
  if (!content) {
    console.log(`${path.basename(filePath)} not found.`);
    return;
  }

  let updatedContent = content;
  const logs: string[] = [];

  for (const cat of categories) {
    const count = getRuleCount(cat, skillsDir);
    if (count === null) continue;

    const pattern = patternGenerator(cat);
    if (pattern.test(updatedContent)) {
      const newContent = updatedContent.replace(pattern, `$1${count}$2`);
      if (newContent !== updatedContent) {
        updatedContent = newContent;
        logs.push(`[${name}] Updated ${cat} count to ${count}`);
      }
    }
  }

  if (updatedContent !== content) {
    for (const log of logs) console.log(log);
    writeFile(filePath, updatedContent);
    console.log(`${path.basename(filePath)} updated successfully.`);
  } else {
    console.log(`No changes needed in ${path.basename(filePath)}.`);
  }
}

/* ========= Main Logic ========= */

export function updateCounts(repoRoot: string = REPO_ROOT, skillsDir: string = SKILLS_DIR): void {
  updateDocument(
    path.join(repoRoot, 'README.md'),
    CATEGORIES,
    (cat) =>
      new RegExp(
        `(\\|\\s+\\[.*?\\]\\(skills/${cat}/SKILL\\.md\\)\\s+\\|\\s+\\*\\*)\\d+(\\*\\*\\s+\\|)`,
        'g'
      ),
    'README',
    skillsDir
  );

  updateDocument(
    path.join(repoRoot, 'AGENTS.md'),
    CATEGORIES,
    (cat) => new RegExp(`(${cat}/.*?# )\\d+( rules)`, 'g'),
    'AGENTS',
    skillsDir
  );
}

/* ========= Entry Point ========= */

export function run(): void {
  updateCounts();
}

if (fileURLToPath(import.meta.url) === process.argv[1]) run();
