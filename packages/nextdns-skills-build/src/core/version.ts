import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { parsePackageMetadata } from './data-schemas.js';

export function getPackageVersion(): string {
  const packagePaths = [
    fileURLToPath(new URL('../package.json', import.meta.url)),
    fileURLToPath(new URL('../../package.json', import.meta.url)),
  ];
  const packagePath = packagePaths.find((candidate) => existsSync(candidate));
  if (!packagePath) return '0.0.0';

  try {
    const metadata = parsePackageMetadata(JSON.parse(readFileSync(packagePath, 'utf8')));
    return metadata.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}
