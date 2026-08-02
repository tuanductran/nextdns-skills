#!/usr/bin/env node
/**
 * Unified CLI entrypoint for nextdns-skills-scripts.
 *
 * Each subcommand module below is a self-invoking script that reads its
 * own arguments from `process.argv.slice(2)`. This wrapper strips the
 * subcommand name off `process.argv` before dynamically importing the
 * target module, so existing module code needs no changes.
 *
 * Usage:
 *   nextdns-skills-scripts <command> [options]
 */

const COMMANDS: Record<string, string> = {
  'validate-rules': './validate-rules.mjs',
  'update-counts': './update-counts.mjs',
  'check-duplicates': './check-duplicates.mjs',
  'check-tags': './check-tags.mjs',
  'generate-stats': './generate-stats.mjs',
};

const HELP = `Usage: nextdns-skills-scripts <command> [options]

Commands:
  validate-rules      Validate rule frontmatter and structure
  update-counts       Sync rule counts into README.md / AGENTS.md
  check-duplicates    Check for duplicate/identical tag sets across rules
  check-tags          Check tag hygiene across rules
  generate-stats      Print repository-wide rule statistics (--text)

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
  process.argv = [process.argv[0] ?? 'node', process.argv[1] ?? 'nextdns-skills-scripts', ...rest];

  await import(modulePath);
}

void main();
