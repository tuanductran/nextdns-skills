# AGENTS.md

<!-- @case-police-ignore Api -->

## Repository overview

NextDNS Skills is a structured knowledge collection for AI agents, enabling complex operations
across the NextDNS ecosystem via domain-specific context injection:

- **NextDNS API**: Programmatic configuration, analytics, and log management.
- **NextDNS CLI**: Deployment, system configuration, and monitoring.
- **NextDNS Web UI**: Strategic configuration and dashboard-based management.
- **Integrations**: Third-party platform connections (OpenWrt, pfSense, Tailscale, and more).
- **NextDNS Frontend**: Nuxt 4, Next.js 15, Astro, SvelteKit, and React Router v7 patterns.

## Repository architecture

```text
nextdns-skills/
├── skills/
│   ├── nextdns-api/              # 23 rules — API protocols and endpoints
│   │   ├── SKILL.md
│   │   └── rules/
│   ├── nextdns-cli/              # 24 rules — Deployment and system config
│   │   ├── SKILL.md
│   │   └── rules/
│   ├── nextdns-ui/               # 16 rules — Web dashboard strategy
│   │   ├── SKILL.md
│   │   └── rules/
│   ├── integrations/             # 20 rules — Platform connectivity
│   │   ├── SKILL.md
│   │   └── rules/
│   └── nextdns-frontend/         # 35 rules — Frontend frameworks
│       ├── SKILL.md
│       └── rules/
│           ├── astro/
│           ├── nextjs/
│           ├── nuxt/
│           ├── react-router/
│           └── sveltekit/
├── packages/
│   ├── nextdns-scripts/          # Validation and maintenance scripts
│   │   ├── bin/
│   │   │   └── nextdns-skills-scripts.js   # Static entrypoint (checked into git)
│   │   ├── src/
│   │   │   ├── cli.ts
│   │   │   ├── index.ts
│   │   │   ├── validate-rules.ts
│   │   │   ├── update-counts.ts
│   │   │   ├── check-duplicates.ts
│   │   │   ├── check-tags.ts
│   │   │   ├── generate-stats.ts
│   │   │   └── utils.ts
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── vitest.config.ts
│   └── nextdns-skills-build/     # Build tooling and programmatic API
│       ├── bin/
│       │   └── nextdns-skills-build.js     # Static entrypoint (checked into git)
│       ├── src/
│       │   ├── cli.ts
│       │   ├── index.ts
│       │   ├── build.ts
│       │   ├── validate.ts
│       │   ├── parser.ts
│       │   ├── config.ts
│       │   ├── types.ts
│       │   ├── search.ts
│       │   ├── export.ts
│       │   ├── extract-tests.ts
│       │   ├── migrate.ts
│       │   └── utils.ts
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── vitest.config.ts
├── templates/
│   ├── rule-template.md
│   └── skill-template.md
├── data/schemas/
│   └── profile.json
├── tsconfig.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Package architecture

Both packages use a static `bin/` entrypoint checked into git that imports `dist/cli.mjs` at
runtime. This means pnpm creates the `.bin` symlink during `pnpm install` before `dist/` is built
— the same pattern Vite uses for `bin/vite.js`.

### `nextdns-scripts` (package name: `nextdns-skills-scripts`)

Maintenance scripts: validate rule integrity, sync rule counts, check duplicates and tags, print
statistics.

**Exports:**

```json
{
  "exports": {
    ".": { "import": "./dist/index.mjs" }
  }
}
```

**CLI commands** (`nextdns-skills-scripts <command>`):

| Command | Description |
| :--- | :--- |
| `validate-rules` | Frontmatter and referential integrity |
| `update-counts` | Sync rule counts in README.md |
| `check-duplicates` | Duplicate title detection |
| `check-tags` | Tag hygiene validation |
| `generate-stats` | Statistics report (`--text`) |

**Package scripts:**

| Script | Description |
| :--- | :--- |
| `build` | `vp pack` — compile to `dist/` |
| `validate-rules` | Run validate-rules via bin |
| `update-counts` | Run update-counts via bin |
| `check-duplicates` | Run check-duplicates via bin |
| `check-tags` | Run check-tags via bin |
| `generate-stats` | Run generate-stats via bin |
| `test` | `vitest run` |
| `test:coverage` | `vitest run --coverage` |
| `types:check` | `tsc --noEmit` |

### `nextdns-skills-build`

Build tooling: compile rule files into `AGENTS.md`, validate, scaffold, search, and export rules.
Also exposes a programmatic API.

**Exports:**

```json
{
  "exports": {
    ".":          { "import": "./dist/index.mjs"    },
    "./build":    { "import": "./dist/build.mjs"    },
    "./validate": { "import": "./dist/validate.mjs" },
    "./search":   { "import": "./dist/search.mjs"   },
    "./export":   { "import": "./dist/export.mjs"   }
  }
}
```

**CLI commands** (`nextdns-skills-build <command>`):

| Command | Description |
| :--- | :--- |
| `build` | Build AGENTS.md (`--all` or `--skill=<name>`) |
| `validate` | Validate rule frontmatter and structure |
| `search` | Search rules (`--query=`, `--tag=`, `--skill=`, `--impact=`, `--json`) |
| `export` | Export rules to JSON/CSV (`--format=`, `--out=`, `--skill=`) |
| `extract-tests` | Extract test cases from rules for LLM evaluation |
| `migrate` | Scaffold a new rule file from template |

**Package scripts:**

| Script | Description |
| :--- | :--- |
| `build` | `vp pack` — compile to `dist/` |
| `build-all` | Build AGENTS.md for all skills |
| `build-api` | Build `nextdns-api` only |
| `build-cli` | Build `nextdns-cli` only |
| `build-frontend` | Build `nextdns-frontend` only |
| `build-integrations` | Build `integrations` only |
| `build-ui` | Build `nextdns-ui` only |
| `validate` | Validate rule files |
| `search` | Search rules |
| `export` | Export rules to JSON or CSV |
| `extract-tests` | Extract test cases |
| `migrate` | Scaffold a new rule |
| `test` | `vitest run` |
| `test:coverage` | `vitest run --coverage` |
| `types:check` | `tsc --noEmit` |

### TypeScript conventions

Both packages share one root `tsconfig.json` extended by each package. Enforced settings:

- `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`
- `verbatimModuleSyntax: true` — always use `import type` for type-only imports
- Array/object index access returns `T | undefined` — guard with `?? fallback` or check first
- Omit optional properties instead of assigning `undefined`
- Forbidden: `any`, `object`, `Function`, non-null assertions (`!`) without a type guard, and
  `as T` casts without prior narrowing

Run `pnpm -F <package> types:check` before committing TypeScript changes.

## Skill development lifecycle

### Folder structure

```text
skills/{category}/
  SKILL.md              # Category manifest with keyword index
  rules/
    {rule-name}.md      # kebab-case filename
```

Category names and rule filenames are always `kebab-case`.

### Skill manifest (`SKILL.md`)

Use `templates/skill-template.md`. Required frontmatter:

- `name`: matches directory name exactly
- `description`: 2–4 sentences with trigger keywords — critical for AI activation
- `metadata`: `author` (`tuanductran`) and `version` (semantic)

Every rule file must be registered in either the **Capability** or **Efficiency** table in the
manifest. Adding a rule without updating `SKILL.md` in the same commit is a protocol violation.

### Rule specifications

Use `templates/rule-template.md`. Required frontmatter:

| Field | Values |
| :--- | :--- |
| `title` | Exact match with H1 heading |
| `impact` | `HIGH`, `MEDIUM`, or `LOW` |
| `impactDescription` | One sentence — consequence of non-compliance |
| `type` | `capability` or `efficiency` |
| `tags` | 3–10 keywords, YAML array format |

Required sections in order: H1 heading (followed by a one-line description), `Overview`,
`Correct usage` (✅), `Do NOT use` (❌), `Troubleshooting`, `Reference`.

## Protocol system

1. **Atomic commits**: a rule change and its `SKILL.md` update must be in the same commit.
2. **Header casing**: use `X-Api-Key` only. Add `<!-- @case-police-ignore Api -->` at the top of
   any Markdown file referencing it.
3. **Terminology**: `profile` (not configuration), `blocklist` (not blacklist), `allowlist` (not
   whitelist).
4. **Zero-PII**: never commit real API keys or profile IDs — use `YOUR_API_KEY`, `abc123`,
   `example.com`.
5. **Conventional commits**: `type(scope): description` — for example,
   `feat(api): add rewrite rule`.
6. **Schema consistency**: sync structural changes with `data/schemas/profile.json`.

## Frontend skill standards

Applies to `skills/nextdns-frontend/` only. Frameworks: Nuxt 4, Next.js 15, Astro, SvelteKit,
React Router v7.

All code examples must compile under:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

**Error handling**: catch values are `unknown` — narrow with `instanceof Error` before accessing
`.message`. Surface errors via the framework's error mechanism (`error()`, `ErrorBoundary`,
`useFormState`). Never swallow errors silently.

**Accessibility**: use semantic HTML, add `aria-label` to interactive elements without visible
text, loading states need `aria-live="polite"` or `role="status"`, never convey state with color
alone.

**Testing**: data-fetching or mutation rules must include a Testing subsection with a mock of the
NextDNS API call, one happy-path assertion, and one error-path assertion.

## Validation and quality assurance

Run before finalising any changes:

| Command | Purpose |
| :--- | :--- |
| `pnpm lint:fix` | Auto-fix formatting (`oxfmt`), code (`oxlint`), markdown, and syntax |
| `pnpm lint:rules` | Validate frontmatter and referential integrity via Turbo |
| `pnpm lint:all` | Full check including external link validation |
| `pnpm check-duplicates` | Detect duplicate titles (ERROR within skill, WARN across) |
| `pnpm check-tags` | Validate tag count (3–10), uniqueness, and casing |
| `pnpm update-counts` | Sync rule counts in README.md |
| `pnpm types:check` | Type-check all packages via Turbo |
| `pnpm test` | Run Vitest across both packages |
| `pnpm test:coverage` | Run tests with v8 coverage report |

## Building AGENTS.md

After modifying rule files, rebuild the compiled output:

```bash
pnpm build:skills           # All skills
pnpm build:api              # nextdns-api only
pnpm build:cli              # nextdns-cli only
pnpm build:ui               # nextdns-ui only
pnpm build:integrations     # integrations only
pnpm build:frontend         # nextdns-frontend only
```

## Content standards

Follow the [Atlassian content guidelines](https://atlassian.design/foundations/content).

- Sentence case for all headings
- Active voice — lead with verbs
- No abbreviations (`for example`, not `e.g.`; `that is`, not `i.e.`)
- No trailing catch-alls (`and more`, not `etc.`)
- Spell out conjunctions (`and`, not `&`)

Fixed terminology:

| Use | Never use |
| :-- | :-------- |
| `profile` | configuration, config |
| `blocklist` | blacklist, denylist |
| `allowlist` | whitelist, passlist |
| `X-Api-Key` | X-API-Key, x-api-key |

## Installation

**Claude Code**: `cp -r skills/{category} ~/.claude/skills/`

**claude.ai**: attach `SKILL.md` and relevant rules to the project context.
