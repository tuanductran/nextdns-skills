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
│   ├── nextdns-api/            # 17 rules (API protocols & endpoints)
│   ├── nextdns-cli/            # 19 rules (Deployment & SysConfig)
│   ├── nextdns-ui/             # 12 rules (Web Dashboard Strategy)
│   └── integrations/           # 14 rules (Platform Connectivity)
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
  - `tags`: 3-7 keywords for task-specific triggering.
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
   `<!-- @case-police-ignore Api -->` to the top of all Markdown files referencing it. **Remove
   this line from the template if your rule does not reference the API key.**
3. **Terminology Precision**: Use "profile" (not configuration), "blocklist" (not blacklist),
   "allowlist" (not whitelist).
4. **Zero-PII Policy**: Never commit real API keys or Profile IDs. Use placeholders: `YOUR_API_KEY`,
   `abc123`, `example.com`.
5. **Markdown Aesthetics**: Maintain high-fidelity spacing. Always use a blank line between a
   paragraph and a list/code block to ensure clear visual separation.
6. **Code Block Standards**: Specify language tags (bash, python, etc.). Use markers ✅/❌.
7. **Conventional Commits**: `type(scope): description` (e.g., `feat(api): add rewrite rule`).
8. **Schema Consistency**: Sync any structural changes with `data/schemas/profile.json`.

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
