/**
 * Shared utilities for nextdns-skills-build package.
 */

import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Recursively collect all .md rule files under a directory.
 * Excludes files starting with '_' and README.md.
 *
 * This function replaces the three identical inline `collectFiles` / `collectRuleFiles`
 * implementations that previously existed in build.ts, validate.ts, and extract-tests.ts.
 */
export async function collectRuleFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectRuleFiles(fullPath)));
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
