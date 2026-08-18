import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

interface PackageMetadata {
  version?: unknown;
}

export function getPackageVersion(): string {
  const packagePath = fileURLToPath(new URL('../package.json', import.meta.url));
  const metadata = JSON.parse(readFileSync(packagePath, 'utf8')) as PackageMetadata;
  return typeof metadata.version === 'string' ? metadata.version : '0.0.0';
}
