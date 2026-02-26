# AGENTS.md

This file provides critical guidance to AI coding agents (Claude Code, Cursor, Copilot, etc.) when
working with the `nextdns-skills` repository.

<!-- @case-police-ignore Api -->

## 📖 Repository Overview

NextDNS Skills is a high-fidelity collection of structured knowledge (skills) for AI agents. It
enables agents to perform complex operations across the NextDNS ecosystem by injecting
domain-specific context:

- **NextDNS API**: Programmatic configuration, analytics, and log management.
- **NextDNS CLI**: Deployment, system configuration, and monitoring.
- **NextDNS Web UI**: Strategic configuration and dashboard-based management.
- **Integrations**: Third-party platform connections (OpenWrt, pfSense, Tailscale, etc.).

## 🏗️ Repository Architecture

```text
nextdns-skills/
├── skills/                     # Domain-specific knowledge categories
│   ├── nextdns-api/            # 20 rules (API protocols & endpoints)
│   ├── nextdns-cli/            # 21 rules (Deployment & SysConfig)
│   ├── nextdns-ui/             # 13 rules (Web Dashboard Strategy)
│   ├── integrations/           # 15 rules (Platform Connectivity)
│   └── nextdns-frontend/       # 30 rules (Nuxt + Next.js + Astro Dashboard)
├── scripts/                    # Maintenance & validation scripts
├── templates/                  # Standardized blueprints
└── data/schemas/               # JSON schemas for NextDNS entities
```

## 🛠️ Skill Development Lifecycle

### 1. Folder Structure & Naming

New rules and skills must follow this exact hierarchy:

```text
skills/{category}/
  SKILL.md              # Mandatory: Category manifest with keyword index
  rules/                # Mandatory: Directory for specific rule files
    {rule-name}.md      # kebab-case filename (e.g., parental-control.md)
```

- **Category Name**: `kebab-case` (e.g., `nextdns-api`).
- **Rule Filename**: `kebab-case.md`.

### 2. Skill Manifest (`SKILL.md`) Specifications

All category manifests MUST be created using `templates/skill-template.md`. The `SKILL.md` file acts
as the primary entry point for AI discovery.

- **Frontmatter (YAML)**:
  - `name`: Matches directory name.
  - `description`: 2-4 sentences with trigger keywords. Crucial for AI activation.
  - `metadata`: Include `author` (tuanductran) and `version` (semantic).
- **Keyword Indexing**: Populate the `Keywords` column in rule tables with specific terms from rule
  tags.
- **Rule Registration**: Every rule file MUST be registered in either the **Capability** (core
  knowledge) or **Efficiency** (best practices) table.

### 3. Technical Rule Specifications

All rules MUST be created using `templates/rule-template.md`.

- **YAML Frontmatter**:
  - `title`: Exact match with the H1 heading.
  - `impact`: `HIGH` (critical failure/security), `MEDIUM` (quality/performance), or `LOW`
    (consistency).
  - `impactDescription`: One-sentence consequence of non-compliance.
  - `type`: `capability` (AI needs this to solve the task) or `efficiency` (AI can solve, but this
    optimizes it).
  - `tags`: 3-7 keywords for task-specific triggering (must be YAML array format, not string).
- **Standard Sections**:
  - `H1 Heading`: Immediately followed by a one-line description.
  - `Overview`: Context and scenario.
  - `Correct Usage`: Verified examples marked with ✅.
  - `Do NOT Use`: Anti-patterns marked with ❌.
  - `Troubleshooting`: Step-by-step diagnostic guidance.
  - `Reference`: HTTPS links to official documentation.

## 🛡️ The Protocol System

AI agents MUST strictly adhere to these protocols:

1. **Atomic Rule Workflow**: Adding/modifying a rule file MUST be accompanied by an update to the
   corresponding `SKILL.md` index in the SAME commit.
2. **X-Api-Key Standard**: Use `X-Api-Key` ONLY (lowercase 'i'). Add
   `<!-- @case-police-ignore Api -->` to the top of all Markdown files referencing it. **Remove this
   line from the template if your rule does not reference the API key.**
3. **Terminology Precision**: Use "profile" (not configuration), "blocklist" (not blacklist),
   "allowlist" (not whitelist).
4. **Zero-PII Policy**: Never commit real API keys or Profile IDs. Use placeholders: `YOUR_API_KEY`,
   `abc123`, `example.com`.
5. **Markdown Aesthetics**: Maintain high-fidelity spacing. Always use a blank line between a
   paragraph and a list/code block to ensure clear visual separation.
6. **Code Block Standards**: Specify language tags (bash, python, etc.). Use markers ✅/❌.
7. **Conventional Commits**: `type(scope): description` (e.g., `feat(api): add rewrite rule`).
8. **Schema Consistency**: Sync any structural changes with `data/schemas/profile.json`.
9. **TypeScript Type Safety**: All TypeScript code examples in frontend rules MUST use explicit,
   precise types. The following are strictly forbidden:
   - `any` — use `unknown` (and narrow with type guards), or a concrete interface/type alias.
   - `object` — use a specific interface or `Record<string, unknown>`.
   - `Function` — use a typed signature (e.g., `() => void`).
   - Non-null assertions (`!`) without a preceding type guard — document the guard instead.
   - Type casting (`as SomeType`) without a prior type-narrowing check.

   Use framework-generated types where available (e.g., `Route.LoaderArgs`, `PageServerLoad`,
   `RequestEvent`) rather than manually re-typing them.

## 🌐 Frontend Skill Standards

These standards apply exclusively to `skills/nextdns-frontend/` and all subdirectories.

### TypeScript Configuration

All code examples in frontend rules MUST assume the following `tsconfig.json` baseline:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

Every rule's code example MUST compile cleanly under these settings. If a workaround is necessary,
document WHY explicitly in a code comment.

### Error Handling in Frontend Examples

- Always handle both network failures and API-level errors (non-2xx HTTP status codes) separately.
- In `try/catch`, the caught value is `unknown` — narrow it with `instanceof Error` before accessing
  `.message`.
- Surface errors to the user via the framework's error mechanism (`error()`, `ErrorBoundary`,
  `useFormState`) rather than `console.error` alone.
- Never swallow errors silently.

### Accessibility (a11y)

All UI component examples in frontend rules MUST follow these a11y requirements:

- Use semantic HTML (`<button>`, `<nav>`, `<main>`, `<section>`, `<h1>`–`<h6>`).
- Add `aria-label` or `aria-labelledby` to interactive elements that lack visible text.
- Loading states must include an `aria-live="polite"` region or a `role="status"` element.
- Color alone must not convey state — pair with text or an icon.

### Testing Guidelines

When a rule demonstrates a data-fetching or mutation pattern, include a brief **Testing** subsection
after the main example showing:

- How to mock the NextDNS API call (e.g., `vi.mock`, `jest.mock`, MSW handler).
- One happy-path assertion and one error-path assertion.
- Use `@testing-library/svelte`, `@testing-library/react`, or the framework's own test utilities.

## 🤝 Contributing & Code Review

### Contribution Workflow

1. **Branch**: create a feature branch — `feat/add-{framework}-{rule}`.
2. **Implement**: follow the Skill Development Lifecycle above.
3. **Validate**: run the full validation suite before opening a PR.
4. **PR title**: use Conventional Commits format — `feat(frontend): add SvelteKit logs rule`.
5. **Review checklist**: Rule registered in `SKILL.md` (same commit) · No forbidden TypeScript
   patterns (Protocol #9) · Example compiles under strict TS · a11y requirements met · Placeholder
   values only · `pnpm run lint` passes locally.

### Code Review Standards

Reviewers MUST reject PRs that:

- Introduce `any`, `object`, or `Function` types in TypeScript examples.
- Commit real API keys, profile IDs, or domain names.
- Add a rule file without updating `SKILL.md`.
- Leave unlabeled code fences (triggers `MD040`).
- Use deprecated framework APIs that conflict with official documentation.

## 🚀 Efficiency & Validation

### Context Optimization

- **Trigger Density**: Use precise keywords in `SKILL.md` and rule tags to ensure the agent
  activates the correct skill without bloating the context.
- **Progressive Disclosure**: Keep rule files focused. Reference external files only when the agent
  specifically needs them.

### Quality Assurance (MANDATORY)

Before finalizing any changes, always execute the full validation suite:

- `pnpm run lint:all` - Comprehensive check (formatting, rules, syntax, and links).
- `pnpm lint:fix` - Auto-fix formatting, terms, and syntax.
- `pnpm lint:rules` - Verify referential integrity and frontmatter schema.
- `pnpm update-counts` - Synchronize rule counts across documentation.

## 📥 Installation

**Claude Code**: `cp -r skills/{category} ~/.claude/skills/`

**claude.ai**: Attach `SKILL.md` and relevant rules to the project context or paste them directly
into the prompt.
