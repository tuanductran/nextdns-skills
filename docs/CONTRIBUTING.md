# Contributing

**Last reviewed:** 2026-08-18

Thank you for improving **NextDNS Skills**. The repository is a source-grounded knowledge collection, so a useful contribution must be correct, discoverable, privacy-safe, and reproducible. Read the root [AGENTS.md](../AGENTS.md) first, then read the nearest generated skill context and the matching procedure in [.agents/workflows/](../.agents/workflows/).

## Choose the change type

| Change | Canonical files | Required follow-up |
| :--- | :--- | :--- |
| Add or revise domain guidance | `skills/{skill}/rules/*.md` | Update `skills/{skill}/SKILL.md`, rebuild generated `AGENTS.md`, and run rule validation |
| Change skill metadata or routing | `skills/{skill}/SKILL.md` | Check rule registration, counts, tags, and generated output |
| Change agent procedure | `.agents/workflows/*.md` and root `AGENTS.md` | Keep the procedure reusable, explicit, and free of account data |
| Change public project guidance | `docs/*.md` or `README.md` | Check links and Markdown; update the documentation index when adding a document |
| Change build or validation behavior | `packages/`, root scripts, or CI | Add or update tests, document the command, and run the full relevant quality gate |

Within a TypeScript package, keep reusable code under `src/core/`, one responsibility per CLI module under `src/commands/`, and dispatch only from `src/cli.ts`. Vite may flatten compiled entry names under `dist/`; update the package's Vite entries, CLI registry, and public exports together when moving a module. Build-package CLI inputs must pass through [`core/cli-validation.ts`](../packages/nextdns-skills-build/src/core/cli-validation.ts) so runtime parsing remains consistent for direct commands and programmatic consumers.

## Add or revise a rule

Start with [templates/rule-template.md](../templates/rule-template.md). Use a kebab-case filename, a frontmatter `title` that exactly matches the H1 heading, an impact level, one-sentence impact description, a rule type, and three to ten unique tags. Keep the required sections in the order specified by [AGENTS.md](../AGENTS.md).

Place the rule in the category that owns the behavior. Register it in that category's `SKILL.md` in the same commit. Do not edit `skills/*/AGENTS.md` by hand: those files are generated from source rules. Rebuild them with `pnpm build:skills` after source changes.

A good rule explains the decision it helps an agent make, gives a safe correct example, identifies unsafe or unsupported behavior, and includes a troubleshooting path. Use placeholders such as `YOUR_API_KEY`, `abc123`, `example.com`, and `192.0.2.10`. Never paste a live profile ID, API key, email address, public IP address, DNS log, cookie, browser session, or account screenshot.

## Research and references

Prefer official NextDNS API, CLI, Help Center, and dashboard documentation. Use secondary sources only when they add implementation context that an official source does not provide. Distinguish the status of each statement:

| Status | Meaning | How to write it |
| :--- | :--- | :--- |
| Official fact | Directly stated by an authoritative source | Link the source and avoid extending its claim |
| Repository fact | Verified from this repository or its tests | Link the owning file or command |
| Observation | Seen in a browser or dashboard at a specific time | Record only generalized behavior and observation date |
| Inference | A reasoned conclusion from facts | Label it as an inference and explain the uncertainty |
| Proposal | Future behavior or design choice | Label it as proposed; do not present it as supported behavior |

If a source is protected, rate-limited, a file download, or an API endpoint that needs credentials, record that limitation rather than replacing it with a guessed URL. Follow [DOCUMENTATION.md](DOCUMENTATION.md) for link and source handling.

## Local development sequence

Install the locked dependencies and inspect the repository status before editing:

```bash
pnpm install --frozen-lockfile
git status --short
```

After editing, run the smallest useful checks first. For rule or manifest changes, rebuild the generated output and run the complete gate:

```bash
pnpm build:skills
pnpm build:check
pnpm run audit
pnpm lint:duplicates
pnpm lint:fix
pnpm lint:all
pnpm check-duplicates
pnpm check-tags
pnpm update-counts
pnpm test
git diff --check
```

For documentation-only changes, `pnpm lint:md`, `pnpm lint:links`, and `git diff --check` are the minimum checks. For package or generated-output changes, also run `pnpm run audit`, `pnpm lint:duplicates`, and `pnpm build:check`. Add `pnpm lint:all` when the change touches referenced URLs or CI. If a remote service returns 403, 429, 5xx, or a download response, record the exception and do not treat the response as proof that the documentation is invalid without further review.

### Run the combined audit

`pnpm run audit` invokes the `audit` command from [`nextdns-skills-scripts`](../packages/nextdns-scripts/src/commands/audit.ts). It aggregates five repository checks: referential integrity, frontmatter validity, tag hygiene, duplicate titles, and duplicate tag sets. Duplicate-title findings are split into errors and warnings; only errors make that check fail. Duplicate tag sets are counted as warnings in the report, but any duplicate makes the `duplicate-tags` check fail. The command exits with status `0` only when every check passes and exits with status `1` when any check fails.

Use `pnpm run audit -- --json` when CI, scripts, or a reviewer needs a machine-readable [`AuditReport`](../packages/nextdns-scripts/src/commands/audit.ts). The report includes the generation timestamp, current rule count, per-check pass/error/warning counts, and aggregate statistics. Treat `generatedAt` and `ruleCount` as run-time values rather than stable documentation facts. The public [`schemas.ts`](../packages/nextdns-scripts/src/core/schemas.ts) exports Valibot schemas and `parseAuditReport`/`parseStatsReport` helpers for consumers that receive report JSON from an external process. The combined audit complements, but does not replace, `pnpm build:check`, Markdown and link linting, duplicate-code scanning, rule validation, or the test suite.

### Validate CLI input

The build package validates raw CLI arguments at runtime with Valibot before reading rules or mutating files. The shared parser rejects unknown and duplicate options, missing option values, unknown skill names, invalid impact/type/format values, non-kebab-case migration names, and incompatible `build --all` plus `--skill` combinations. Search requires at least one filter, while `export` and skill-scoped commands preserve their documented defaults. Consumers that invoke commands programmatically should use the public parser exports from [`src/index.ts`](../packages/nextdns-skills-build/src/index.ts), not duplicate `process.argv` parsing.

### Run the duplicate-code check

`pnpm lint:duplicates` runs jscpd v5 using the committed [`.jscpd.json`](../.jscpd.json) policy. The scan covers maintained production TypeScript, requires at least eight lines and 80 tokens for a candidate clone, ignores tests and generated artifacts, and fails when duplicated lines exceed five percent. Review a reported clone before raising the threshold; prefer extracting shared logic into `src/core/` when the duplication represents the same behavior. See the [official jscpd configuration guide](https://jscpd.dev/getting-started/configuration) for the underlying option semantics.

## Pull request expectations

A pull request should explain the user or maintenance problem, summarize the change, identify the canonical files, and include validation evidence. For a rule change, mention the source used, the manifest update, the generated output rebuild, and any known external-link exceptions. For an account-backed observation, state that the content was generalized and contains no account data.

| Review question | Required answer |
| :--- | :--- |
| What problem does this solve? | A concise user or maintenance outcome |
| Where is the source of truth? | Exact rule, manifest, package, schema, or docs path |
| What was generated? | Generated `AGENTS.md` files, if any |
| How was it tested? | Commands and meaningful results; for package or validation changes include `pnpm run audit -- --json`, `pnpm lint:duplicates`, and the relevant tests |
| Are any links exceptional? | Protected, rate-limited, download, redirect, or unresolved links |
| Could the diff contain PII or secrets? | Explicitly reviewed; use safe placeholders only |

## Commit and release hygiene

Use a conventional commit such as `feat(cli): add platform guidance`, `docs: explain contributor workflow`, or `fix(ui): refresh stale reference`. Keep unrelated changes in separate commits. Before pushing, follow [.agents/workflows/release-check.md](../.agents/workflows/release-check.md), confirm the working tree is clean except for the intended commit, and never push a change that contains credentials or live account data.

## Code of conduct and security

Be precise, respectful, and transparent about uncertainty. Do not use an issue or pull request to disclose credentials, private logs, or account identifiers. Report a suspected security issue privately through the repository's configured security channel rather than publishing exploit details in a rule or documentation example.

