import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function getRepositoryRoot(moduleUrl: string): string {
  const moduleDir = dirname(fileURLToPath(moduleUrl));
  const candidates = [resolve(moduleDir, '../../..'), resolve(moduleDir, '../../../..')];
  return candidates.find((candidate) => existsSync(join(candidate, 'skills'))) ?? candidates[0]!;
}
