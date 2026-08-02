#!/usr/bin/env node
/**
 * Unified CLI entrypoint for nextdns-skills-build.
 *
 * Each subcommand module below is a self-invoking script that reads its
 * own arguments from `process.argv.slice(2)`. This wrapper strips the
 * subcommand name off `process.argv` before dynamically importing the
 * target module, so existing module code needs no changes.
 *
 * Usage:
 *   nextdns-skills-build <command> [options]
 */

const COMMANDS: Record<string, string> = {
  build: './build.mjs',
  validate: './validate.mjs',
  search: './search.mjs',
  export: './export.mjs',
  'extract-tests': './extract-tests.mjs',
  migrate: './migrate.mjs',
};

const HELP = `Usage: nextdns-skills-build <command> [options]

Commands:
  build             Build AGENTS.md files from rule sources (--all | --skill=<name>)
  validate          Validate rule frontmatter and structure
  search            Search rules (--query=, --tag=, --skill=, --impact=, --json)
  export            Export rules to JSON/CSV (--format=, --out=, --skill=)
  extract-tests     Extract test cases from rules for LLM evaluation
  migrate           Scaffold a new rule file from a template

Run without a command, or with --help, to see this message.`;

async function main(): Promise<void> {
  const [subcommand, ...rest] = process.argv.slice(2);

  if (!subcommand || subcommand === '--help' || subcommand === '-h') {
    console.log(HELP);
    process.exit(subcommand ? 0 : 1);
  }

  const modulePath = COMMANDS[subcommand];
  if (!modulePath) {
    console.error(`Unknown command: ${subcommand}\n`);
    console.log(HELP);
    process.exit(1);
  }

  // Re-slice argv so the target module's own `process.argv.slice(2)` sees `rest`.
  process.argv = [process.argv[0] ?? 'node', process.argv[1] ?? 'nextdns-skills-build', ...rest];

  await import(modulePath);
}

void main();
