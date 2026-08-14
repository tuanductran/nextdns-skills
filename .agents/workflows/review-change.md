# Review an agent or skill change

Use this workflow before committing a rule, manifest, generated `AGENTS.md`, or `.agents` workflow
change. Review the smallest relevant scope first, then run repository-wide checks when the change is
ready.

## Review matrix

| Area | Questions |
| :--- | :--- |
| Scope | Does the change solve a concrete gap without duplicating an existing rule or canonical documentation? |
| Structure | Does every rule have valid frontmatter, required sections, a registered manifest entry, and a kebab-case filename? |
| Accuracy | Are product claims supported by official references, with facts separated from advice and observations? |
| Terminology | Are `profile`, `allowlist`, `blocklist`, and `X-Api-Key` used consistently? |
| Safety | Are secrets, live profile IDs, emails, IPs, logs, cookies, and account-specific data absent? Are destructive actions explicit? |
| Agent behavior | Does the workflow define inputs, ordered steps, stop conditions, outputs, and the required human approval boundary? |
| Generated state | Were affected `skills/*/AGENTS.md` files rebuilt from source rather than edited manually? |
| Quality | Do formatting, case-police, link, duplicate, tag, type, and test checks pass? |

## Procedure

1. Inspect `git diff --check`, `git status`, and the complete diff. Confirm that the change is limited
   to the intended files and that temporary research notes are outside the repository or removed.
2. Search the complete diff for sensitive patterns, including API key-like strings, real profile IDs,
   email addresses, public IPs, DNS log domains, cookies, and environment values. Treat any hit as a
   blocker until it is replaced with a safe placeholder or removed.
3. Validate rule structure and registrations:

   ```bash
   pnpm lint:rules
   pnpm check-duplicates
   pnpm check-tags
   ```

4. Rebuild the affected skill output. For a broad source change, use `pnpm build:skills`; otherwise,
   use the specific `pnpm build:<skill>` command recorded in root `AGENTS.md`.
5. Run the smallest relevant tests first, then the complete suite before delivery:

   ```bash
   pnpm lint:fix
   pnpm lint:all
   pnpm test
   ```

6. Compare generated output against source rules, inspect external references, and record any known
   warnings separately from failures. Do not hide failures by weakening validation.
7. If the change modifies an effectful workflow, account operation, GitHub write, or destructive
   command, require explicit user confirmation at the point of execution.

## Review outcome

Report one of three outcomes: **ready**, **ready with documented warnings**, or **blocked**. A blocked
review must name the failed check or unresolved claim and the smallest action required to continue.
