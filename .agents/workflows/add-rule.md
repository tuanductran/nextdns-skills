# Add a NextDNS rule

Use this workflow when adding one new capability or efficiency rule to an existing skill. Keep the
change atomic: the source rule and its parent `SKILL.md` registration belong in the same change.

## Inputs

| Input | Requirement |
| :--- | :--- |
| Target skill | One existing directory under `skills/` |
| Rule intent | A concrete capability or efficiency gap, not a duplicate of an existing rule |
| Evidence | Official NextDNS documentation or a clearly labeled repository convention |
| Safe examples | Placeholders only; never live account data |

## Procedure

1. Read the root `AGENTS.md`, the target skill's nearest `AGENTS.md`, and
   `templates/rule-template.md`. Inspect the target skill manifest and search existing rules for
   overlapping titles, tags, and concepts.
2. If the rule depends on current NextDNS behavior, follow `research-and-update.md` first. Prefer
   official API documentation, the NextDNS CLI wiki, the Help Center, or the authenticated dashboard
   only when the user has explicitly authorized read-only inspection.
3. Define the rule's `title`, `impact`, `impactDescription`, `type`, and 3–10 unique tags. Use
   kebab-case for the filename and sentence case for headings. Use the repository terms `profile`,
   `allowlist`, and `blocklist`.
4. Write the rule in the required section order: H1 and one-line description, `Overview`, `Correct
   usage`, `Do NOT use`, `Troubleshooting`, and `Reference`. Include safe examples, failure modes,
   and official HTTPS references. Add a Testing subsection when the rule describes API fetching or
   mutations.
5. Register the exact rule filename in the parent skill's Capability or Efficiency table. Do not
   edit generated `skills/*/AGENTS.md` files by hand.
6. Run focused checks:

   ```bash
   pnpm lint:rules
   pnpm check-duplicates
   pnpm check-tags
   pnpm build:<skill>
   ```

7. Run `pnpm lint:fix`, inspect the diff, and confirm that the new rule contains no secrets, live
   profile identifiers, personal data, or unsupported product claims.
8. Use `release-check.md` before committing. Use a conventional commit such as
   `feat(api): add profile export rule` or `docs(ui): clarify retention settings`.

## Completion criteria

The rule is complete only when its source file, parent manifest, generated output, references, and
validation evidence are consistent. If the scope is unclear or the source claims conflict, stop and
ask the user rather than inventing behavior.
