import { access, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vite-plus/test';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const distDir = path.join(packageRoot, 'dist');

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

describe('scripts package dist contract', () => {
  it('emits executable cli and public index entrypoints', async () => {
    const cliPath = path.join(distDir, 'cli.mjs');
    const indexPath = path.join(distDir, 'index.mjs');
    const cliStats = await stat(cliPath);

    expect(await exists(cliPath)).toBe(true);
    expect(await exists(indexPath)).toBe(true);
    expect(cliStats.mode & 0o111).not.toBe(0);
  });

  it('does not emit standalone command entrypoints', async () => {
    const commandNames = [
      'audit',
      'check-duplicates',
      'check-tags',
      'generate-stats',
      'update-counts',
      'validate-rules',
    ];

    await Promise.all(
      commandNames.map(async (commandName) => {
        expect(await exists(path.join(distDir, `${commandName}.mjs`))).toBe(false);
      })
    );
  });
});
