#!/usr/bin/env node
/**
 * CLI dispatcher for nextdns-skills-build.
 * Routes subcommands to compiled dist files.
 *
 * Usage: nextdns-skills-build <command> [options]
 *
 * Commands:
 *   build           Build AGENTS.md from rule files
 *   validate        Validate rule files
 *   extract-tests   Extract test cases to JSON
 *   migrate         Create a new rule from template
 *   search          Search rules by keyword, tag, skill, or impact
 *   export          Export all rules to JSON or CSV
 *
 * Options:
 *   --skill=<name>       Target skill (nextdns-api, nextdns-cli, nextdns-ui, integrations, nextdns-frontend)
 *   --all                Build all skills (build command only)
 *   --upgrade-version    Bump metadata version (build command only)
 *   --query=<text>       Search keyword (search command)
 *   --tag=<tag>          Filter by tag (search command)
 *   --impact=<level>     Filter by impact HIGH|MEDIUM|LOW (search command)
 *   --json               JSON output (search command)
 *   --format=json|csv    Output format (export command, default: json)
 *   --out=<file>         Write output to file (export command)
 */

import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

const COMMANDS = {
  build: 'build.js',
  validate: 'validate.js',
  'extract-tests': 'extract-tests.js',
  migrate: 'migrate.js',
  search: 'search.js',
  export: 'export.js',
};

const [, , cmd = '', ...rest] = process.argv;

if (!Object.hasOwn(COMMANDS, cmd)) {
  if (cmd) {
    console.error(`Unknown command: ${cmd}\n`);
  }
  console.error('Usage: nextdns-skills-build <command> [options]');
  console.error('\nCommands:');
  console.error('  build              Build AGENTS.md from rule files');
  console.error('  validate           Validate rule files structure');
  console.error('  extract-tests      Extract test cases to JSON');
  console.error('  migrate            Create a new rule from template');
  console.error('  search             Search rules by keyword, tag, skill, or impact');
  console.error('  export             Export all rules to JSON or CSV');
  console.error('\nOptions:');
  console.error(
    '  --skill=<name>       Target skill (nextdns-api, nextdns-cli, nextdns-ui, integrations, nextdns-frontend)'
  );
  console.error('  --all                Build all skills (build only)');
  console.error('  --upgrade-version    Bump metadata version (build only)');
  console.error('  --query=<text>       Search keyword (search)');
  console.error('  --tag=<tag>          Filter by tag (search)');
  console.error('  --impact=<level>     Filter by impact HIGH|MEDIUM|LOW (search)');
  console.error('  --json               JSON output (search)');
  console.error('  --format=json|csv    Output format (export, default: json)');
  console.error('  --out=<file>         Write to file (export)');
  process.exit(cmd ? 1 : 0);
}

const distFile = join(distDir, COMMANDS[cmd]);

if (!existsSync(distFile)) {
  console.error(`Error: Package not built. Run 'pnpm build' first.`);
  process.exit(1);
}

process.argv = [process.argv[0], distFile, ...rest];

await import(distFile);
