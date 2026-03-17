#!/usr/bin/env node
/**
 * Generate a comprehensive statistics report for all NextDNS skill rules.
 *
 * Output (stdout JSON):
 *   - total rule count
 *   - per-skill breakdown (total, capability, efficiency)
 *   - impact level distribution (HIGH / MEDIUM / LOW)
 *   - top 20 most-used tags
 *   - rules with no tags (hygiene check)
 *
 * Usage:
 *   nextdns-skills-scripts generate-stats
 *   nextdns-skills-scripts generate-stats --json   (pretty JSON, default)
 *   nextdns-skills-scripts generate-stats --text   (human-readable summary)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { collectRuleFiles, parseFrontmatter } from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '../../..');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');

const args = process.argv.slice(2);
const outputMode: 'json' | 'text' = args.includes('--text') ? 'text' : 'json';

interface SkillStats {
  name: string;
  total: number;
  capability: number;
  efficiency: number;
  high: number;
  medium: number;
  low: number;
}

interface StatsReport {
  generatedAt: string;
  totalRules: number;
  skills: SkillStats[];
  impactDistribution: { HIGH: number; MEDIUM: number; LOW: number };
  topTags: Array<{ tag: string; count: number }>;
  rulesWithNoTags: string[];
}

function buildReport(): StatsReport {
  const skillDirs = fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => ({ name: e.name, dir: path.join(SKILLS_DIR, e.name) }));

  const tagCounts = new Map<string, number>();
  const rulesWithNoTags: string[] = [];
  const impactDistribution = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  const skills: SkillStats[] = [];
  let totalRules = 0;

  for (const { name, dir } of skillDirs) {
    const rulesDir = path.join(dir, 'rules');
    if (!fs.existsSync(rulesDir)) continue;

    const files = collectRuleFiles(rulesDir);
    const stat: SkillStats = {
      name,
      total: 0,
      capability: 0,
      efficiency: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf8');
      const fm = parseFrontmatter(content);
      stat.total++;
      totalRules++;

      const type = typeof fm['type'] === 'string' ? fm['type'] : '';
      if (type === 'capability') stat.capability++;
      else if (type === 'efficiency') stat.efficiency++;

      const impact = typeof fm['impact'] === 'string' ? fm['impact'].toUpperCase() : 'MEDIUM';
      if (impact === 'HIGH') {
        stat.high++;
        impactDistribution.HIGH++;
      } else if (impact === 'LOW') {
        stat.low++;
        impactDistribution.LOW++;
      } else {
        stat.medium++;
        impactDistribution.MEDIUM++;
      }

      const tags = Array.isArray(fm['tags']) ? (fm['tags'] as string[]) : [];
      if (tags.length === 0) {
        rulesWithNoTags.push(path.relative(REPO_ROOT, filePath));
      }
      for (const tag of tags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }

    skills.push(stat);
  }

  const topTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([tag, count]) => ({ tag, count }));

  return {
    generatedAt: new Date().toISOString(),
    totalRules,
    skills,
    impactDistribution,
    topTags,
    rulesWithNoTags,
  };
}

function printText(report: StatsReport): void {
  const GREEN = '\x1b[0;32m';
  const BOLD = '\x1b[1m';
  const NC = '\x1b[0m';

  console.log(`${BOLD}NextDNS Skills Statistics${NC} — ${report.generatedAt}\n`);
  console.log(`${GREEN}Total rules:${NC} ${report.totalRules}\n`);

  console.log(`${BOLD}Per-skill breakdown:${NC}`);
  for (const s of report.skills) {
    console.log(
      `  ${s.name.padEnd(22)} ${String(s.total).padStart(3)} rules  ` +
        `(${s.capability} capability, ${s.efficiency} efficiency)  ` +
        `HIGH:${s.high} MED:${s.medium} LOW:${s.low}`
    );
  }

  console.log(`\n${BOLD}Impact distribution:${NC}`);
  console.log(`  HIGH:   ${report.impactDistribution.HIGH}`);
  console.log(`  MEDIUM: ${report.impactDistribution.MEDIUM}`);
  console.log(`  LOW:    ${report.impactDistribution.LOW}`);

  console.log(`\n${BOLD}Top 10 tags:${NC}`);
  for (const { tag, count } of report.topTags.slice(0, 10)) {
    console.log(`  ${tag.padEnd(30)} ${count}`);
  }

  if (report.rulesWithNoTags.length > 0) {
    console.log(`\n${BOLD}Rules with no tags (${report.rulesWithNoTags.length}):${NC}`);
    for (const f of report.rulesWithNoTags) console.log(`  ${f}`);
  }
}

const report = buildReport();

if (outputMode === 'text') {
  printText(report);
} else {
  console.log(JSON.stringify(report, null, 2));
}
