# AGENTS.md

This file provides critical guidance to AI coding agents (Claude Code, Cursor, Copilot, and more)
when working with the `nextdns-skills` repository.

<!-- @case-police-ignore Api -->

## 📖 Repository overview

NextDNS Skills is a high-fidelity collection of structured knowledge (skills) for AI agents. It
enables agents to perform complex operations across the NextDNS ecosystem by injecting
domain-specific context:

- **NextDNS API**: Programmatic configuration, analytics, and log management.
- **NextDNS CLI**: Deployment, system configuration, and monitoring.
- **NextDNS Web UI**: Strategic configuration and dashboard-based management.
- **Integrations**: Third-party platform connections (OpenWrt, pfSense, Tailscale, and more).

## 🏗️ Repository architecture

```text
nextdns-skills/
├── skills/                      # Domain-specific knowledge categories
│   ├── nextdns-api/             # 23 rules (API protocols and endpoints)
│   ├── nextdns-cli/             # 24 rules (Deployment and SysConfig)
│   ├── nextdns-ui/              # 16 rules (Web Dashboard Strategy)
│   ├── integrations/            # 20 rules (Platform Connectivity)
│   └── nextdns-frontend/        # 35 rules (Nuxt, Next.js, Astro, SvelteKit, React Router)
├── packages/
│   ├── nextdns-skills-build/    # Compiles rule files into AGENTS.md
│   │   ├── src/
│   │   │   ├── index.ts         # Public programmatic API (re-exports types, parser, config)
│   │   │   ├── build.ts         # Core build script
│   │   │   ├── validate.ts      # Rule validation
│   │   │   ├── parser.ts        # Markdown → Rule parser
│   │   │   ├── config.ts        # Skill registry (SKILLS, SKILLS_DIR, DEFAULT_SKILL)
│   │   │   ├── types.ts         # Shared TypeScript types
│   │   │   ├── search.ts        # Rule search CLI
│   │   │   ├── export.ts        # Export rules to JSON or CSV
│   │   │   ├── extract-tests.ts # Extract test cases to JSON
│   │   │   └── migrate.ts       # Scaffold new rule from template
│   │   ├── dist/                # Compiled output (ESM)
│   │   └── tsconfig.json        # NodeNext, strict, esModuleInterop
│   └── nextdns-scripts/         # Validation and maintenance scripts
│       ├── src/
│       │   ├── index.ts         # Public programmatic API (re-exports utils)
│       │   ├── validate-rules.ts
│       │   ├── update-counts.ts
│       │   ├── check-duplicates.ts
│       │   ├── check-tags.ts
│       │   └── generate-stats.ts
│       ├── dist/                # Compiled output (ESM)
│       └── tsconfig.json        # NodeNext, strict, esModuleInterop
├── templates/                   # Standardized blueprints
└── data/schemas/                # JSON schemas for NextDNS entities
```

## 📦 Package architecture (no bin/)

Both packages follow the same pattern — no `bin/` dispatcher, scripts call `dist/` directly:

```json
{
  "exports": {
    ".": { "import": "./dist/index.js" }
  },
  "files": ["dist"],
  "scripts": {
    "validate-rules": "node dist/validate-rules.js"
  }
}
```

**Programmatic API** — import types and utilities directly in TypeScript:

```typescript
// From nextdns-skills-build
import { parseRuleFile, SKILLS, DEFAULT_SKILL } from 'nextdns-skills-build';
import type { Rule, ImpactLevel, DocumentReference } from 'nextdns-skills-build';

// From nextdns-skills-scripts
import { parseFrontmatter, collectRuleFiles, walkDir } from 'nextdns-skills-scripts';
```

Root scripts use `pnpm -F <package> <script>` — never bin-style invocation:

```jsonc
// root package.json — correct pattern
"lint:rules": "pnpm -F nextdns-skills-scripts validate-rules"

// WRONG — do not use
"lint:rules": "nextdns-skills-scripts validate-rules"
```

## 🛠️ Skill development lifecycle

### 1. Folder structure and naming

New rules and skills must follow this exact hierarchy:

```text
skills/{category}/
  SKILL.md              # Mandatory: Category manifest with keyword index
  rules/                # Mandatory: Directory for specific rule files
    {rule-name}.md      # kebab-case filename (for example, parental-control.md)
```

- **Category Name**: `kebab-case` (for example, `nextdns-api`).
- **Rule Filename**: `kebab-case.md`.

### 2. Skill manifest (`SKILL.md`) specifications

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

### 3. Technical rule specifications

All rules MUST be created using `templates/rule-template.md`.

- **YAML Frontmatter**:
  - `title`: Exact match with the H1 heading.
  - `impact`: `HIGH` (critical failure/security), `MEDIUM` (quality/performance), or `LOW`
    (consistency).
  - `impactDescription`: One-sentence consequence of non-compliance.
  - `type`: `capability` (AI needs this to solve the task) or `efficiency` (AI can solve, but this
    optimizes it).
  - `tags`: 3-10 keywords for task-specific triggering (must be YAML array format, not string).
- **Standard Sections**:
  - `H1 Heading`: Immediately followed by a one-line description.
  - `Overview`: Context and scenario.
  - `Correct Usage`: Verified examples marked with ✅.
  - `Do NOT Use`: Anti-patterns marked with ❌.
  - `Troubleshooting`: Step-by-step diagnostic guidance.
  - `Reference`: HTTPS links to official documentation.

## 🛡️ The protocol system

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
6. **Code Block Standards**: Specify language tags (bash, python, and so on). Use markers ✅/❌.
7. **Conventional Commits**: `type(scope): description` (for example, `feat(api): add rewrite rule`).
8. **Schema Consistency**: Sync any structural changes with `data/schemas/profile.json`.
9. **TypeScript Type Safety**: All TypeScript code examples in frontend rules MUST use explicit,
   precise types. The following are strictly forbidden:
   - `any` — use `unknown` (and narrow with type guards), or a concrete interface/type alias.
   - `object` — use a specific interface or `Record<string, unknown>`.
   - `Function` — use a typed signature (for example, `() => void`).
   - Non-null assertions (`!`) without a preceding type guard — document the guard instead.
   - Type casting (`as SomeType`) without a prior type-narrowing check.

   Use framework-generated types where available (for example, `Route.LoaderArgs`, `PageServerLoad`,
   `RequestEvent`) rather than manually re-typing them.

## 🌐 Frontend skill standards

These standards apply exclusively to `skills/nextdns-frontend/` and all subdirectories.

### TypeScript configuration

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

### Error handling in frontend examples

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

### Testing guidelines

When a rule demonstrates a data-fetching or mutation pattern, include a brief **Testing** subsection
after the main example showing:

- How to mock the NextDNS API call (for example, `vi.mock`, `jest.mock`, or an MSW handler).
- One happy-path assertion and one error-path assertion.
- Use `@testing-library/svelte`, `@testing-library/react`, or the framework's own test utilities.

## 🤝 Contributing and code review

### Contribution workflow

1. **Branch**: create a feature branch — `feat/add-{framework}-{rule}`.
2. **Implement**: follow the Skill Development Lifecycle above.
3. **Validate**: run the full validation suite before opening a PR.
4. **PR title**: use Conventional Commits format — `feat(frontend): add SvelteKit logs rule`.
5. **Review checklist**: Rule registered in `SKILL.md` (same commit) · No forbidden TypeScript
   patterns (Protocol #9) · Example compiles under strict TS · a11y requirements met · Placeholder
   values only · `pnpm run lint` passes locally.

### Code review standards

Reviewers MUST reject PRs that:

- Introduce `any`, `object`, or `Function` types in TypeScript examples.
- Commit real API keys, profile IDs, or domain names.
- Add a rule file without updating `SKILL.md`.
- Leave unlabeled code fences (triggers `MD040`).
- Use deprecated framework APIs that conflict with official documentation.
- Add or restore a `bin/` dispatcher — use `pnpm -F <package> <script>` instead.

## 🚀 Efficiency and validation

### Context optimization

- **Trigger Density**: Use precise keywords in `SKILL.md` and rule tags to ensure the agent
  activates the correct skill without bloating the context.
- **Progressive Disclosure**: Keep rule files focused. Reference external files only when the agent
  specifically needs them.

### Quality assurance (MANDATORY)

Before finalizing any changes, always execute the full validation suite:

| Command | Purpose |
| :--- | :--- |
| `pnpm lint:fix` | Auto-fix formatting, terms, markdown, syntax, and TypeScript type-checking |
| `pnpm lint:rules` | Verify referential integrity and frontmatter schema |
| `pnpm lint:all` | Full check — formatting, rules, syntax, and links |
| `pnpm check-duplicates` | Detect duplicate titles across and within skills |
| `pnpm check-tags` | Validate tag count (3–10), uniqueness, and casing |
| `pnpm update-counts` | Synchronize rule counts in README.md |
| `pnpm stats` | Print per-skill rule count and impact distribution |
| `pnpm test` | Run Vitest across both packages (113 tests) |
| `pnpm test:coverage` | Run Vitest with v8 coverage report |

### Building skill AGENTS.md files

After modifying rule files, rebuild the compiled output:

| Command | Purpose |
| :--- | :--- |
| `pnpm build:skills` | Build all skills at once |
| `pnpm build:api` | Build nextdns-api only |
| `pnpm build:cli` | Build nextdns-cli only |
| `pnpm build:ui` | Build nextdns-ui only |
| `pnpm build:integrations` | Build integrations only |
| `pnpm build:frontend` | Build nextdns-frontend only |

### Searching and exporting rules

```bash
# Search rules by keyword, tag, skill, or impact level
pnpm rule-search -- --query=authentication
pnpm rule-search -- --query=docker --skill=integrations
pnpm rule-search -- --tag=dns --impact=HIGH --json

# Export all rules
pnpm rule-export -- --format=json --out=rules.json
pnpm rule-export -- --format=csv  --out=rules.csv
```

### Package scripts

Both packages expose their scripts via `pnpm -F`:

```bash
# nextdns-scripts scripts
pnpm -F nextdns-skills-scripts validate-rules
pnpm -F nextdns-skills-scripts update-counts
pnpm -F nextdns-skills-scripts check-duplicates
pnpm -F nextdns-skills-scripts check-tags
pnpm -F nextdns-skills-scripts generate-stats --text

# nextdns-skills-build scripts
pnpm -F nextdns-skills-build build-all
pnpm -F nextdns-skills-build build-agents --skill=nextdns-api
pnpm -F nextdns-skills-build validate
pnpm -F nextdns-skills-build search -- --query=authentication
pnpm -F nextdns-skills-build export -- --format=json
pnpm -F nextdns-skills-build migrate -- --skill=nextdns-api
```

## ✍️ Content standards

All documentation — rule files, `SKILL.md` manifests, templates, and `README.md` — must follow the
[Atlassian content guidelines](https://atlassian.design/foundations/content). These apply to every
AI agent generating or editing content in this repository.

### Writing principles

- **Clear**: Write for the reader's goal, not the writer's knowledge. Every sentence should help the
  agent or developer complete a task.
- **Concise**: Remove words that don't add meaning. Prefer short sentences over long ones.
- **Conversational**: Write as if speaking directly to the reader. Use contractions ("can't",
  "won't") to keep the tone natural.
- **Actionable**: Lead with verbs. Tell the reader what to do, not what exists.

### Voice and tone

- **Bold**: Give accurate, assertive guidance. Don't hedge unnecessarily.
- **Optimistic**: Frame content around what works, not just what to avoid.
- **Practical**: Be direct and factual. Keep examples realistic and immediately usable.

### Grammar and style rules

| Rule | Correct | Incorrect |
| :--- | :------ | :-------- |
| Sentence case for all headings | `## Contribution workflow` | `## Contribution Workflow` |
| No abbreviations | `for example` | `e.g.` |
| No abbreviations | `that is` | `i.e.` |
| No trailing catch-alls | `OpenWrt, pfSense, and more` | `OpenWrt, pfSense, etc.` |
| Spell out conjunctions | `Contributing and code review` | `Contributing & Code Review` |
| Active voice | `Run the validation suite` | `The validation suite should be run` |

### Terminology

These terms are fixed across the entire project. AI agents must never substitute alternatives:

| Use | Never use |
| :-- | :-------- |
| `profile` | configuration, config |
| `blocklist` | blacklist, denylist |
| `allowlist` | whitelist, passlist |
| `X-Api-Key` | X-API-Key, x-api-key |

## 📥 Installation

**Claude Code**: `cp -r skills/{category} ~/.claude/skills/`

**claude.ai**: Attach `SKILL.md` and relevant rules to the project context or paste them directly
into the prompt.
