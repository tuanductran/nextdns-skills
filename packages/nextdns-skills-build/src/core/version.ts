import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

interface PackageMetadata {
  version?: unknown;
}

export function getPackageVersion(): string {
  const packagePaths = [
    fileURLToPath(new URL('../package.json', import.meta.url)),
    fileURLToPath(new URL('../../package.json', import.meta.url)),
  ];
  const packagePath = packagePaths.find((candidate) => existsSync(candidate));
  if (!packagePath) return '0.0.0';

  const metadata = JSON.parse(readFileSync(packagePath, 'utf8')) as PackageMetadata;
  return typeof metadata.version === 'string' ? metadata.version : '0.0.0';
}
