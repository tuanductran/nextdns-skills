import fs from 'node:fs';
import path from 'node:path';

import { parseFrontmatter as validateFrontmatter, type Frontmatter } from './data-schemas.js';

export type { Frontmatter, FrontmatterValue } from './data-schemas.js';

export function parseFrontmatter(content: string): Frontmatter {
  if (!content.startsWith('---')) return {};
  const end = content.indexOf('\n---', 3);
  if (end === -1) return {};

  const block = content.slice(3, end).trim();
  const result: Frontmatter = {};
  let currentKey = '';
  let inArray = false;
  const arrayValues: string[] = [];

  for (const line of block.split('\n')) {
    const item = line.match(/^\s+-\s+(.+)/);
    if (item) {
      if (inArray) {
        arrayValues.push((item[1] ?? '').trim().replace(/^["']|["']$/g, ''));
      }
      continue;
    }

    if (inArray && currentKey) {
      result[currentKey] = arrayValues.slice();
      inArray = false;
      arrayValues.length = 0;
    }

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    if (!key) continue;

    if (value === '') {
      currentKey = key;
      inArray = true;
    } else {
      result[key] = value.replace(/^["']|["']$/g, '');
    }
  }

  if (inArray && currentKey) result[currentKey] = arrayValues.slice();
  return validateFrontmatter(result);
}

export function collectMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(fullPath));
    } else if (
      entry.name.endsWith('.md') &&
      !entry.name.startsWith('_') &&
      entry.name !== 'README.md'
    ) {
      files.push(fullPath);
    }
  }

  return files.sort();
}
