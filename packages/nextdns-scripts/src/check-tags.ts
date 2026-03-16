#!/usr/bin/env node
/**
 * Validate tag hygiene across all rule files.
 *
 * Checks:
 *   1. Minimum 3 tags per rule.
 *   2. Maximum 10 tags per rule.
 *   3. No single-character tags.
 *   4. No duplicate tags within the same rule.
 *   5. Tags must be lowercase (AGENTS.md convention).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectRuleFiles, parseFrontmatter } from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '../../..');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');

const RED = '\x1b[0;31m';
const YELLOW = '\x1b[0;33m';
const GREEN = '\x1b[0;32m';
const NC = '\x1b[0m';

const MIN_TAGS = 3;
const MAX_TAGS = 10;

interface TagError {
  file: string;
  level: 'error' | 'warn';
  message: string;
}

function validateTags(): boolean {
  const errors: TagError[] = [];

  const skillDirs = fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => path.join(SKILLS_DIR, e.name));

  for (const skillDir of skillDirs) {
    const rulesDir = path.join(skillDir, 'rules');
    if (!fs.existsSync(rulesDir)) continue;

    for (const filePath of collectRuleFiles(rulesDir)) {
      const rel = path.relative(REPO_ROOT, filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      const fm = parseFrontmatter(content);
      const tags = Array.isArray(fm['tags']) ? (fm['tags'] as string[]) : [];

      if (tags.length === 0) {
        errors.push({ file: rel, level: 'error', message: 'No tags defined (minimum 3 required)' });
        continue;
      }

      if (tags.length < MIN_TAGS) {
        errors.push({
          file: rel,
          level: 'error',
          message: `Only ${tags.length} tag(s) — minimum is ${MIN_TAGS}`,
        });
      }

      if (tags.length > MAX_TAGS) {
        errors.push({
          file: rel,
          level: 'warn',
          message: `${tags.length} tags — consider trimming to max ${MAX_TAGS} for signal clarity`,
        });
      }

      // Single-character tags
      const shortTags = tags.filter((t) => t.trim().length <= 1);
      if (shortTags.length > 0) {
        errors.push({
          file: rel,
          level: 'error',
          message: `Single-character tags are not allowed: [${shortTags.join(', ')}]`,
        });
      }

      // Duplicate tags within the same rule
      const seen = new Set<string>();
      const dupes: string[] = [];
      for (const tag of tags) {
        const key = tag.toLowerCase();
        if (seen.has(key)) dupes.push(tag);
        seen.add(key);
      }
      if (dupes.length > 0) {
        errors.push({
          file: rel,
          level: 'error',
          message: `Duplicate tags: [${dupes.join(', ')}]`,
        });
      }

      // Fully ALLCAPS tags that are not recognised acronyms
      // Allows: camelCase (runtimeConfig), proper nouns (Windows), acronyms (CLI, DNS, API, SSE, BFF, TLDs, ECS, DoH, DoT, GUI, NRD, TTL, JFFS, NTP, VPN, MDM, MDM, LAN, WAN, SSH, RAM, CPU, NAS)
      const knownAcronyms = new Set([
        'cli',
        'dns',
        'api',
        'sse',
        'bff',
        'tld',
        'tlds',
        'ecs',
        'doh',
        'dot',
        'gui',
        'nrd',
        'ttl',
        'jffs',
        'ntp',
        'vpn',
        'mdm',
        'lan',
        'wan',
        'ssh',
        'nas',
        'iot',
        'tcp',
        'udp',
        'url',
        'uri',
        'http',
        'https',
        'html',
        'json',
        'yaml',
        'csv',
        'id',
        'ip',
        'ui',
        'ux',
        'ci',
        'cd',
        'pr',
        'os',
        'pc',
        'tv',
        'iot',
        'dga',
        'ddns',
        'csam',
        'crud',
        'dd-wrt',
        'dd',
        'patch',
        'delete',
        'put',
        'post',
        'get',
        'rest',
        'exe',
        'msi',
        'pkg',
        'apk',
        'dmg',
        'iso',
        'idn',
        'isp',
        'asn',
        'mx',
        'ptr',
        'txt',
        'cname',
        'aaaa',
        'spf',
        'dkim',
        'dmarc',
        'dnssec',
        'edns',
      ]);
      // Special-case: allow hyphenated all-caps brand names like DD-WRT, WAN-LAN
      const allcapsTags = tags.filter((t) => {
        if (/^[A-Z][A-Z]+-[A-Z][A-Z]+$/.test(t)) return false; // e.g. DD-WRT
        const stripped = t.replace(/[^a-zA-Z]/g, '');
        if (stripped.length === 0) return false;
        if (stripped === stripped.toUpperCase() && stripped.length > 2) {
          return !knownAcronyms.has(stripped.toLowerCase());
        }
        return false;
      });
      if (allcapsTags.length > 0) {
        errors.push({
          file: rel,
          level: 'warn',
          message: `Unexpected ALLCAPS tags (use lowercase or known acronyms): [${allcapsTags.join(', ')}]`,
        });
      }
    }
  }

  if (errors.length === 0) {
    console.log(`${GREEN}✅ All tags are valid!${NC}`);
    return true;
  }

  const hardErrors = errors.filter((e) => e.level === 'error');
  const warnings = errors.filter((e) => e.level === 'warn');

  for (const e of errors) {
    const icon = e.level === 'error' ? `${RED}❌ ERROR${NC}` : `${YELLOW}⚠️  WARN${NC}`;
    console.log(`${icon}: ${e.file}`);
    console.log(`       ${e.message}`);
  }

  console.log('');
  if (hardErrors.length > 0) {
    console.log(`${RED}${hardErrors.length} error(s), ${warnings.length} warning(s).${NC}`);
    return false;
  }

  console.log(`${YELLOW}${warnings.length} warning(s) — no hard errors.${NC}`);
  return true;
}

const ok = validateTags();
process.exit(ok ? 0 : 1);
