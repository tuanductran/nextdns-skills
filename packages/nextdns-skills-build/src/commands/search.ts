/**
 * Search NextDNS skill rules by keyword, tag, skill, or impact level.
 *
 * Usage:
 *   nextdns-skills-build search --query="rate limit"
 *   nextdns-skills-build search --tag=docker
 *   nextdns-skills-build search --skill=nextdns-api
 *   nextdns-skills-build search --impact=HIGH
 *   nextdns-skills-build search --query=cache --skill=nextdns-cli --impact=MEDIUM
 *   nextdns-skills-build search --query=docker --json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SKILLS } from '../core/config.js';
import { collectMarkdownFiles, parseFrontmatter } from '../core/markdown.js';
import { getRepositoryRoot } from '../core/paths.js';

const REPO_ROOT = getRepositoryRoot(import.meta.url);

export interface SearchResult {
  skill: string;
  file: string;
  title: string;
  type: string;
  impact: string;
  tags: string[];
  matchedOn: string[];
}

export { parseFrontmatter as parseFm };

function getArg(argv: string[], name: string): string | undefined {
  const found = argv.find((arg) => arg.startsWith(`--${name}=`));
  return found ? found.split('=').slice(1).join('=') : undefined;
}

export function search(argv: string[] = process.argv.slice(2)): SearchResult[] {
  const query = getArg(argv, 'query')?.toLowerCase();
  const filterTag = getArg(argv, 'tag')?.toLowerCase();
  const filterSkill = getArg(argv, 'skill')?.toLowerCase();
  const filterImpact = getArg(argv, 'impact')?.toUpperCase();

  if (!query && !filterTag && !filterSkill && !filterImpact) {
    throw new Error(
      'Usage: nextdns-skills-build search [--query=<text>] [--tag=<tag>] [--skill=<name>] [--impact=HIGH|MEDIUM|LOW] [--json]'
    );
  }

  const results: SearchResult[] = [];
  const targetSkills = filterSkill
    ? Object.entries(SKILLS).filter(([name]) => name === filterSkill)
    : Object.entries(SKILLS);

  if (filterSkill && targetSkills.length === 0) {
    throw new Error(
      `Unknown skill: "${filterSkill}". Available: ${Object.keys(SKILLS).join(', ')}`
    );
  }

  for (const [skillName, skillConfig] of targetSkills) {
    const rulesDir = skillConfig.rulesDir;
    if (!fs.existsSync(rulesDir)) continue;

    for (const filePath of collectMarkdownFiles(rulesDir)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const frontmatter = parseFrontmatter(content);
      const title = typeof frontmatter['title'] === 'string' ? frontmatter['title'] : '';
      const type = typeof frontmatter['type'] === 'string' ? frontmatter['type'] : '';
      const impact =
        typeof frontmatter['impact'] === 'string' ? frontmatter['impact'].toUpperCase() : '';
      const tags = Array.isArray(frontmatter['tags']) ? frontmatter['tags'] : [];
      const impactDescription =
        typeof frontmatter['impactDescription'] === 'string'
          ? frontmatter['impactDescription']
          : '';

      const frontmatterEnd = content.indexOf('\n---', 3);
      const body = frontmatterEnd !== -1 ? content.slice(frontmatterEnd + 4) : content;
      const matchedOn: string[] = [];

      if (filterImpact && impact !== filterImpact) continue;

      if (filterTag) {
        const matchingTag = tags.find((tag) => tag.toLowerCase().includes(filterTag));
        if (!matchingTag) continue;
        matchedOn.push(`tag:${matchingTag}`);
      }

      if (query) {
        const searchText = `${title} ${impactDescription} ${body}`.toLowerCase();
        if (!searchText.includes(query)) continue;
        if (title.toLowerCase().includes(query)) matchedOn.push('title');
        else if (impactDescription.toLowerCase().includes(query))
          matchedOn.push('impactDescription');
        else matchedOn.push('body');
      }

      if (matchedOn.length === 0 && !filterImpact) continue;
      if (filterImpact && matchedOn.length === 0) matchedOn.push(`impact:${impact}`);

      results.push({
        skill: skillName,
        file: path.relative(REPO_ROOT, filePath),
        title,
        type,
        impact,
        tags,
        matchedOn,
      });
    }
  }

  return results;
}

export function run(): void {
  const argv = process.argv.slice(2);
  let results: SearchResult[];
  try {
    results = search(argv);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
    return;
  }

  if (argv.includes('--json')) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  if (results.length === 0) {
    console.log('No rules matched your search criteria.');
    return;
  }

  const GREEN = '\x1b[0;32m';
  const YELLOW = '\x1b[0;33m';
  const BOLD = '\x1b[1m';
  const DIM = '\x1b[2m';
  const NC = '\x1b[0m';
  const impactColor = (impact: string) =>
    impact === 'HIGH' ? '\x1b[0;31m' : impact === 'MEDIUM' ? YELLOW : '\x1b[0;34m';

  console.log(`\n${BOLD}Found ${results.length} result(s):${NC}\n`);
  for (const result of results) {
    const color = impactColor(result.impact);
    console.log(`${BOLD}${result.title}${NC}`);
    console.log(`  ${DIM}${result.file}${NC}`);
    console.log(
      `  Skill: ${GREEN}${result.skill}${NC}  Type: ${result.type}  Impact: ${color}${result.impact}${NC}`
    );
    if (result.tags.length > 0) {
      console.log(
        `  Tags: ${result.tags.slice(0, 6).join(', ')}${result.tags.length > 6 ? '…' : ''}`
      );
    }
    console.log(`  Matched on: ${result.matchedOn.join(', ')}`);
    console.log('');
  }
}

if (fileURLToPath(import.meta.url) === process.argv[1]) run();
