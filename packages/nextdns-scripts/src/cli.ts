#!/usr/bin/env node
/**
 * Unified CLI entrypoint for nextdns-skills-scripts.
 *
 * Each subcommand module exports a run() function. The static command
 * registry bundles every supported command into the single dist/cli.mjs
 * executable, while command modules remain importable in tests without
 * executing CLI logic.
 *
 * Usage:
 *   nextdns-skills-scripts <command> [options]
 */

import { run as runAudit } from './commands/audit.js';
import { run as runCheckDuplicates } from './commands/check-duplicates.js';
import { run as runCheckTags } from './commands/check-tags.js';
import { run as runGenerateStats } from './commands/generate-stats.js';
import { run as runUpdateCounts } from './commands/update-counts.js';
import { run as runValidateRules } from './commands/validate-rules.js';
import { getPackageVersion } from './core/version.js';

const COMMANDS: Record<string, () => void | Promise<void>> = {
  'validate-rules': runValidateRules,
  'update-counts': runUpdateCounts,
  'check-duplicates': runCheckDuplicates,
  'check-tags': runCheckTags,
  'generate-stats': runGenerateStats,
  audit: runAudit,
};

const HELP = `Usage: nextdns-skills-scripts <command> [options]

Commands:
  validate-rules      Validate rule frontmatter and structure
  update-counts       Sync rule counts into README.md / AGENTS.md
  check-duplicates    Check for duplicate/identical tag sets across rules
  check-tags          Check tag hygiene across rules
  generate-stats      Print repository-wide rule statistics (--text)
  audit               Run the complete maintenance audit (--json)

Options:
  --version           Print the package version
  --help              Show this help message

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
  process.argv = [process.argv[0] ?? 'node', process.argv[1] ?? 'nextdns-skills-scripts', ...rest];
  await command();
}

void main();
