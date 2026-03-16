#!/usr/bin/env node
/**
 * Export all NextDNS skill rules to a structured JSON or CSV file.
 *
 * Usage:
 *   nextdns-skills-build export                        → JSON to stdout
 *   nextdns-skills-build export --format=json          → JSON to stdout
 *   nextdns-skills-build export --format=csv           → CSV to stdout
 *   nextdns-skills-build export --format=json --out=rules.json
 *   nextdns-skills-build export --format=csv  --out=rules.csv
 *   nextdns-skills-build export --skill=nextdns-api    → single skill only
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_SKILL, SKILLS } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '../../..');

/* ---- CLI args ---- */
const argv = process.argv.slice(2);
function getArg(name: string): string | undefined {
  const a = argv.find((x) => x.startsWith(`--${name}=`));
  return a ? a.split('=').slice(1).join('=') : undefined;
}

const format: 'json' | 'csv' = getArg('format') === 'csv' ? 'csv' : 'json';
const outFile = getArg('out');
const skillArg = getArg('skill');
const buildAll = !skillArg;

/* ---- Types ---- */
interface ExportRow {
  skill: string;
  file: string;
  title: string;
  type: string;
  impact: string;
  impactDescription: string;
  tags: string; // comma-separated in CSV, array in JSON
  tagCount: number;
}

/* ---- Inline frontmatter parser ---- */
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
      if (inArr) arr.push(item[1].trim().replace(/^["']|["']$/g, ''));
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

function collectMd(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
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
  return out.sort();
}

/* ---- Export ---- */
function exportRules(): ExportRow[] {
  const rows: ExportRow[] = [];

  const targetSkills = buildAll
    ? Object.entries(SKILLS)
    : skillArg && SKILLS[skillArg]
      ? [[skillArg, SKILLS[skillArg]] as [string, (typeof SKILLS)[string]]]
      : null;

  if (!targetSkills) {
    console.error(`Unknown skill: "${skillArg}". Available: ${Object.keys(SKILLS).join(', ')}`);
    process.exit(1);
  }

  for (const [skillName, skillConfig] of targetSkills) {
    for (const filePath of collectMd(skillConfig.rulesDir)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const fm = parseFm(content);
      const tags = Array.isArray(fm['tags']) ? (fm['tags'] as string[]) : [];

      rows.push({
        skill: skillName,
        file: path.relative(REPO_ROOT, filePath),
        title: typeof fm['title'] === 'string' ? fm['title'] : '',
        type: typeof fm['type'] === 'string' ? fm['type'] : '',
        impact: typeof fm['impact'] === 'string' ? fm['impact'].toUpperCase() : '',
        impactDescription:
          typeof fm['impactDescription'] === 'string' ? fm['impactDescription'] : '',
        tags: tags.join(', '),
        tagCount: tags.length,
      });
    }
  }

  return rows;
}

function toJson(rows: ExportRow[]): string {
  // In JSON output, tags as array is more useful
  const jsonRows = rows.map((r) => ({
    ...r,
    tags: r.tags ? r.tags.split(', ').filter(Boolean) : [],
  }));
  return JSON.stringify(
    { exportedAt: new Date().toISOString(), total: rows.length, rules: jsonRows },
    null,
    2
  );
}

function toCsv(rows: ExportRow[]): string {
  const headers = [
    'skill',
    'file',
    'title',
    'type',
    'impact',
    'impactDescription',
    'tags',
    'tagCount',
  ];
  const escape = (v: string | number) => {
    const s = String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const lines = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape(r[h as keyof ExportRow])).join(',')),
  ];
  return lines.join('\n');
}

/* ---- Run ---- */
const rows = exportRules();
const output = format === 'csv' ? toCsv(rows) : toJson(rows);

if (outFile) {
  fs.writeFileSync(path.resolve(outFile), output, 'utf8');
  console.error(`✓ Exported ${rows.length} rules to ${outFile} (${format.toUpperCase()})`);
} else {
  process.stdout.write(output + '\n');
}
