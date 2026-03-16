#!/usr/bin/env node
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
import { SKILLS } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '../../..');

/* ---- CLI args ---- */
const argv = process.argv.slice(2);

function getArg(name: string): string | undefined {
  const found = argv.find((a) => a.startsWith(`--${name}=`));
  return found ? found.split('=').slice(1).join('=') : undefined;
}

const query = getArg('query')?.toLowerCase();
const filterTag = getArg('tag')?.toLowerCase();
const filterSkill = getArg('skill')?.toLowerCase();
const filterImpact = getArg('impact')?.toUpperCase();
const jsonOutput = argv.includes('--json');

if (!query && !filterTag && !filterSkill && !filterImpact) {
  console.error(
    'Usage: nextdns-skills-build search [--query=<text>] [--tag=<tag>] [--skill=<name>] [--impact=HIGH|MEDIUM|LOW] [--json]'
  );
  process.exit(1);
}

/* ---- Types ---- */
interface SearchResult {
  skill: string;
  file: string;
  title: string;
  type: string;
  impact: string;
  tags: string[];
  matchedOn: string[];
}

/* ---- Frontmatter parser (inline, no external dep) ---- */
function parseFm(content: string): Record<string, string | string[]> {
  if (!content.startsWith('---')) return {};
  const end = content.indexOf('\n---', 3);
  if (end === -1) return {};
  const block = content.slice(3, end).trim();
  const result: Record<string, string | string[]> = {};
  let curKey = '';
  let inArr = false;
  const arr: string[] = [];

  for (const line of block.split('\n')) {
    const item = line.match(/^\s+-\s+(.+)/);
    if (item) {
      if (inArr) arr.push((item[1] ?? '').trim().replace(/^["']|["']$/g, ''));
      continue;
    }
    if (inArr && curKey) {
      result[curKey] = arr.slice();
      inArr = false;
      arr.length = 0;
    }
    const ci = line.indexOf(':');
    if (ci === -1) continue;
    const k = line.slice(0, ci).trim();
    const v = line.slice(ci + 1).trim();
    if (!k) continue;
    if (v === '') {
      curKey = k;
      inArr = true;
    } else {
      result[k] = v.replace(/^["']|["']$/g, '');
    }
  }
  if (inArr && curKey) result[curKey] = arr.slice();
  return result;
}

/* ---- Search ---- */
function search(): SearchResult[] {
  const results: SearchResult[] = [];

  const targetSkills = filterSkill
    ? Object.entries(SKILLS).filter(([k]) => k === filterSkill)
    : Object.entries(SKILLS);

  if (filterSkill && targetSkills.length === 0) {
    console.error(`Unknown skill: "${filterSkill}". Available: ${Object.keys(SKILLS).join(', ')}`);
    process.exit(1);
  }

  for (const [skillName, skillConfig] of targetSkills) {
    const rulesDir = skillConfig.rulesDir;
    if (!fs.existsSync(rulesDir)) continue;

    const files = collectMd(rulesDir);

    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf8');
      const fm = parseFm(content);

      const title = typeof fm['title'] === 'string' ? fm['title'] : '';
      const type = typeof fm['type'] === 'string' ? fm['type'] : '';
      const impact = typeof fm['impact'] === 'string' ? fm['impact'].toUpperCase() : '';
      const tags = Array.isArray(fm['tags']) ? (fm['tags'] as string[]) : [];
      const impactDescription =
        typeof fm['impactDescription'] === 'string' ? fm['impactDescription'] : '';

      // Extract body (after frontmatter)
      const fmEnd = content.indexOf('\n---', 3);
      const body = fmEnd !== -1 ? content.slice(fmEnd + 4) : content;

      const matchedOn: string[] = [];

      // Filter: impact
      if (filterImpact && impact !== filterImpact) continue;

      // Filter: tag
      if (filterTag) {
        const tagMatch = tags.some((t) => t.toLowerCase().includes(filterTag));
        if (!tagMatch) continue;
        matchedOn.push(`tag:${tags.find((t) => t.toLowerCase().includes(filterTag))}`);
      }

      // Filter: query (title + impactDescription + body)
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

function collectMd(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectMd(full));
    else if (
      entry.name.endsWith('.md') &&
      !entry.name.startsWith('_') &&
      entry.name !== 'README.md'
    ) {
      out.push(full);
    }
  }
  return out;
}

/* ---- Output ---- */
const results = search();

if (jsonOutput) {
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

if (results.length === 0) {
  console.log('No rules matched your search criteria.');
  process.exit(0);
}

const GREEN = '\x1b[0;32m';
const YELLOW = '\x1b[0;33m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const NC = '\x1b[0m';

const impactColor = (i: string) =>
  i === 'HIGH' ? '\x1b[0;31m' : i === 'MEDIUM' ? YELLOW : '\x1b[0;34m';

console.log(`\n${BOLD}Found ${results.length} result(s):${NC}\n`);

for (const r of results) {
  const ic = impactColor(r.impact);
  console.log(`${BOLD}${r.title}${NC}`);
  console.log(`  ${DIM}${r.file}${NC}`);
  console.log(`  Skill: ${GREEN}${r.skill}${NC}  Type: ${r.type}  Impact: ${ic}${r.impact}${NC}`);
  if (r.tags.length > 0)
    console.log(`  Tags: ${r.tags.slice(0, 6).join(', ')}${r.tags.length > 6 ? '…' : ''}`);
  console.log(`  Matched on: ${r.matchedOn.join(', ')}`);
  console.log('');
}
