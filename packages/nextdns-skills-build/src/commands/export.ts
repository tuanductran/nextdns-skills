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

import { SKILLS } from '../core/config.js';
import { collectMarkdownFiles, parseFrontmatter } from '../core/markdown.js';
import { getRepositoryRoot } from '../core/paths.js';

const REPO_ROOT = getRepositoryRoot(import.meta.url);

export function run(): void {
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
      for (const filePath of collectMarkdownFiles(skillConfig.rulesDir)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const fm = parseFrontmatter(content);
        const tags = Array.isArray(fm['tags']) ? fm['tags'] : [];

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
    const headers: (keyof ExportRow)[] = [
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
      ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
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
    process.stdout.write(`${output}\n`);
  }
}

if (fileURLToPath(import.meta.url) === process.argv[1]) run();
