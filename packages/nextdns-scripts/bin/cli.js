#!/usr/bin/env node
/**
 * CLI dispatcher for nextdns-skills-scripts.
 * Routes subcommands to compiled dist files.
 *
 * Usage: nextdns-skills-scripts <command>
 *
 * Commands:
 *   validate-rules    Validate all skill rule files for integrity and correct frontmatter
 *   update-counts     Sync rule counts in README.md and AGENTS.md
 */

import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

const COMMANDS = {
  'validate-rules': 'validate-rules.js',
  'update-counts': 'update-counts.js',
};

const [, , cmd = '', ...rest] = process.argv;

if (!Object.hasOwn(COMMANDS, cmd)) {
  if (cmd) {
    console.error(`Unknown command: ${cmd}\n`);
  }
  console.error('Usage: nextdns-skills-scripts <command>');
  console.error('\nCommands:');
  console.error(
    '  validate-rules    Validate all skill rule files for integrity and correct frontmatter'
  );
  console.error('  update-counts     Sync rule counts in README.md and AGENTS.md');
  process.exit(cmd ? 1 : 0);
}

const distFile = join(distDir, COMMANDS[cmd]);

if (!existsSync(distFile)) {
  console.error(`Error: Package not built. Run 'pnpm build' first.`);
  process.exit(1);
}

process.argv = [process.argv[0], distFile, ...rest];

await import(distFile);
