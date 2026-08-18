#!/usr/bin/env node
/**
 * Unified CLI entrypoint for nextdns-skills-build.
 *
 * Each subcommand module exports a run() function. The static command
 * registry keeps every supported command in the single dist/cli.mjs bundle,
 * while modules remain importable in tests without executing CLI logic.
 *
 * Usage:
 *   nextdns-skills-build <command> [options]
 */

import { run as runBuild } from './commands/build.js';
import { run as runExport } from './commands/export.js';
import { run as runExtractTests } from './commands/extract-tests.js';
import { run as runMigrate } from './commands/migrate.js';
import { run as runSearch } from './commands/search.js';
import { run as runValidate } from './commands/validate.js';
import { getPackageVersion } from './core/version.js';

const COMMANDS: Record<string, () => void | Promise<void>> = {
  build: runBuild,
  validate: runValidate,
  search: runSearch,
  export: runExport,
  'extract-tests': runExtractTests,
  migrate: runMigrate,
};

const HELP = `Usage: nextdns-skills-build <command> [options]

Commands:
  build             Build AGENTS.md files from rule sources (--all | --skill=<name> | --check)
  validate          Validate rule frontmatter and structure
  search            Search rules (--query=, --tag=, --skill=, --impact=, --json)
  export            Export rules to JSON/CSV (--format=, --out=, --skill=)
  extract-tests     Extract test cases from rules for LLM evaluation
  migrate           Scaffold a new rule file from a template

Options:
  --version         Print the package version
  --help            Show this help message

Run without a command to see this message.`;

async function main(): Promise<void> {
  const [subcommand, ...rest] = process.argv.slice(2);

  if (subcommand === '--version' || subcommand === '-v') {
    console.log(getPackageVersion());
    return;
  }

  if (!subcommand || subcommand === '--help' || subcommand === '-h') {
    console.log(HELP);
    process.exit(subcommand ? 0 : 1);
  }

  const command = COMMANDS[subcommand];
  if (!command) {
    console.error(`Unknown command: ${subcommand}\n`);
    console.log(HELP);
    process.exit(1);
  }

  // Re-slice argv so the selected command sees only its own options.
  process.argv = [process.argv[0] ?? 'node', process.argv[1] ?? 'nextdns-skills-build', ...rest];
  await command();
}

void main();
