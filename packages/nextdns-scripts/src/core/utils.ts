import fs from 'node:fs';
import path from 'node:path';

/**
 * Recursively walk a directory and collect files matching the given predicate.
 */
export function walkDir(dir: string, matcher: (name: string) => boolean): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walkDir(fullPath, matcher));
    } else if (matcher(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Parse YAML frontmatter from raw markdown content.
 * Returns a plain key→value (or key→string[]) object.
 */
export function parseFrontmatter(content: string): Record<string, string | string[]> {
  if (!content.startsWith('---')) return {};
  const end = content.indexOf('\n---', 3);
  if (end === -1) return {};

  const block = content.slice(3, end).trim();
  const result: Record<string, string | string[]> = {};
  let currentKey = '';
  let inArray = false;
  const arrayValues: string[] = [];

  for (const line of block.split('\n')) {
    const arrayItem = line.match(/^\s+-\s+(.+)/);
    if (arrayItem) {
      if (inArray) arrayValues.push((arrayItem[1] ?? '').trim().replace(/^["']|["']$/g, ''));
      continue;
    }
    if (inArray && currentKey) {
      result[currentKey] = arrayValues.slice();
      inArray = false;
      arrayValues.length = 0;
    }
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    if (!key) continue;
    if (value === '') {
      currentKey = key;
      inArray = true;
    } else {
      result[key] = value.replace(/^["']|["']$/g, '');
    }
  }
  if (inArray && currentKey) result[currentKey] = arrayValues.slice();
  return result;
}

/**
 * Collect all .md rule files under a directory recursively,
 * excluding SKILL.md, README.md, and files starting with '_'.
 */
export function collectRuleFiles(dir: string): string[] {
  return walkDir(
    dir,
    (name) =>
      name.endsWith('.md') && !name.startsWith('_') && name !== 'README.md' && name !== 'SKILL.md'
  );
}
