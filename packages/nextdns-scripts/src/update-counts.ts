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
// dist/update-counts.js → ../../.. = repo root
const REPO_ROOT = path.join(__dirname, '../../..');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');

/* ========= Types ========= */

const CATEGORIES = [
  'nextdns-api',
  'nextdns-cli',
  'nextdns-ui',
  'integrations',
  'nextdns-frontend',
] as const;

type SkillCategory = (typeof CATEGORIES)[number];

/* ========= Helpers ========= */

function readFile(filePath: string): string | null {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
}

function writeFile(filePath: string, content: string): void {
  fs.writeFileSync(filePath, content, 'utf8');
}

function getRuleCount(cat: SkillCategory): number | null {
  const rulesPath = path.join(SKILLS_DIR, cat, 'rules');
  if (!fs.existsSync(rulesPath) || !fs.statSync(rulesPath).isDirectory()) {
    return null;
  }
  return walkDir(rulesPath, (file) => file.endsWith('.md')).length;
}

function updateDocument(
  filePath: string,
  categories: readonly SkillCategory[],
  patternGenerator: (cat: SkillCategory) => RegExp,
  name: string
): void {
  const content = readFile(filePath);
  if (!content) {
    console.log(`${path.basename(filePath)} not found.`);
    return;
  }

  let updatedContent = content;
  const logs: string[] = [];

  for (const cat of categories) {
    const count = getRuleCount(cat);
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

function updateCounts(): void {
  // Update README.md — matches: | [Skill Name](skills/cat/SKILL.md) | **N** |
  updateDocument(
    path.join(REPO_ROOT, 'README.md'),
    CATEGORIES,
    (cat) =>
      new RegExp(
        `(\\|\\s+\\[.*?\\]\\(skills/${cat}/SKILL\\.md\\)\\s+\\|\\s+\\*\\*)\\d+(\\*\\*\\s+\\|)`,
        'g'
      ),
    'README'
  );

  // Update AGENTS.md — matches: nextdns-api/... # N rules
  updateDocument(
    path.join(REPO_ROOT, 'AGENTS.md'),
    CATEGORIES,
    (cat) => new RegExp(`(${cat}/.*?# )\\d+( rules)`, 'g'),
    'AGENTS'
  );
}

updateCounts();
