# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

NextDNS agent skills repository providing specialized knowledge for AI agents to handle NextDNS API integration, CLI operations, and Web UI configuration.

- **Purpose**: Empowering AI agents with expert DNS management capabilities.
- **Content**: Markdown-based skills and rules with standardized metadata.
- **Package Manager**: PNPM.
- **Tools**: markdownlint-cli, case-police.

## Development Commands

### Linting and Formatting

```bash
pnpm lint           # Runs markdownlint and case-police check
pnpm lint:fix       # Fixes linting and casing issues automatically
```

## Project Architecture

### Skills Structure

The repository is organized by skill directories inside the `skills/` folder:

- `skills/nextdns-api` - Rules for API integration (Auth, Analytics, Logs, Profiles).
- `skills/nextdns-cli` - Rules for CLI installation, daemon control, and advanced routing.
- `skills/nextdns-ui` - Rules for Web Dashboard settings based on best practices and threat modeling.

Each skill directory follows this internal structure:
- `SKILL.md` - Entry point containing skill metadata and a table mapping rules to keywords.
- `rules/` - Individual markdown files defining specific capabilities or efficiencies.

### Rule System

Every file in the `rules/` directory is a standalone piece of knowledge.

**YAML Frontmatter**:
Every rule MUST contain standardized metadata for agent triggering:
- `title`: Human-readable title.
- `impact`: Severity/Importance (`HIGH`, `MEDIUM`, `LOW`).
- `impactDescription`: Explanation of what happens if the rule is (or isn't) applied.
- `type`: Category (`capability` for things AI can't do alone, `efficiency` for best practices).
- `tags`: Comma-separated keywords for triggering.

**Impact Line**:
Immediately following the H1 heading, a bolded summary must exist:
`**Impact: [LEVEL]** - [Brief description]`

## Important Constraints

### Writing Guidelines

- **Language**: All content MUST be in **English**.
- **Indentation**: Use **4-space indentation** for all lists and nested items.
- **Filenames**: Use **kebab-case** for all files in the `rules/` directory (e.g., `security-settings.md`).
- **No Redundancy**: Focus on "why" and practical implementation patterns.
- **Individuality**: One rule per file. Do not combine unrelated technical topics.

### Formatting Requirements

- **Case Police**: Follow case-police rules for technical terms (NextDNS, OpenWrt, PayPal, macOS, etc.).
- **Code Blocks**: Always specify the language for syntax highlighting (e.g., `bash`, `javascript`, `conf`).
- **Headings**: Use hierarchical headings (H1, H2, H3).

## Key Files

- `skills/nextdns-api/SKILL.md` - Schema and mapping for API-related tasks.
- `skills/nextdns-cli/SKILL.md` - Schema and mapping for CLI/Terminal tasks.
- `skills/nextdns-ui/SKILL.md` - Schema and mapping for Web UI/Configuration tasks.
- `package.json` - Defines linting scripts and project metadata.
- `.markdownlint.yml` - Global markdown styling rules.

## Making Changes

### Adding a New Rule

1. Create a new markdown file in the relevant `skills/<name>/rules/` folder using `kebab-case.md`.
2. Add the required YAML frontmatter at the top.
3. Include the H1 title followed by the bolded Impact Line.
4. Add the entry to the Capability or Efficiency table in the parent `SKILL.md`.
5. Run `pnpm lint:fix` to ensure compliance.

### Updating Technical Knowledge

- **API Rules**: Must align with the [Official NextDNS API Spec](https://nextdns.github.io/api/).
- **CLI Rules**: Must align with the [NextDNS CLI Wiki](https://github.com/nextdns/nextdns/wiki).
- **UI Rules**: Must align with [NextDNS-Config](https://github.com/yokoffing/NextDNS-Config) community guidelines.
