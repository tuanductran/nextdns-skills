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
