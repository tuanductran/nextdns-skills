# CLAUDE.md

This file provides critical guidance to AI coding assistants (like Claude) when working with the
`nextdns-skills` repository. It serves as the primary source of truth for implementation standards,
API specifications, and the project's rigorous quality protocols.

## Repository Purpose

NextDNS Skills is a high-fidelity collection of structured knowledge (skills) for AI agents. It
enables agents to perform complex operations across the NextDNS ecosystem by injecting
domain-specific context:

- **NextDNS API**: Programmatic configuration, analytics retrieval, and log management.
- **NextDNS CLI**: Deployment, system configuration, and monitoring.
- **NextDNS Web UI**: Strategic configuration and dashboard-based management.
- **Integrations**: Third-party platform connections (OpenWrt, pfSense, Tailscale, Home Assistant,
  etc.).

---

## 🚀 Development Quick Start

| Task               | Command                              |
| :----------------- | :----------------------------------- |
| **Setup**          | `pnpm install`                       |
| **Format**         | `pnpm run format`                    |
| **Lint (All)**     | `pnpm lint`                          |
| **Fix (All)**      | `pnpm lint:fix`                      |
| **Validate Rules** | `pnpm lint:rules`                    |
| **Check Syntax**   | `pnpm lint:syntax`                   |
| **Check Links**    | `pnpm lint:links`                    |
| **Update Counts**  | `python3 scripts/update_counts.py`   |
| **Requirements**   | `Node >=20`, `Python >=3.10`, `pnpm` |

---

## 🛠️ Repository Architecture

### Core Structure

```text
nextdns-skills/
├── skills/                     # Domain-specific knowledge (Skill Manifests + Rules)
│   ├── nextdns-api/            # 17 rules (API protocols & endpoints)
│   ├── nextdns-cli/            # 14 rules (Deployment & SysConfig)
│   ├── nextdns-ui/             # 10 rules (Web Dashboard Strategy)
│   └── integrations/           # 10 rules (Platform Connectivity)
├── scripts/                    # Maintenance & validation scripts
│   ├── validate_rules.py       # Referential integrity & frontmatter validator
│   └── update_counts.py        # Automated rule counter for README/CLAUDE
├── templates/                  # Standardized blueprints
│   ├── rule-template.md        # For individual rule files in rules/
│   └── skill-template.md       # For SKILL.md manifests
└── .github/workflows/          # CI/CD Validation & Automation
    ├── validate-rules.yml      # CI rule validation
    ├── update-counts.yml       # Automated count updates
    └── autofix.yml             # Automated lint fixing
```

---

## 📡 NextDNS API Specification Summary

AI assistants MUST adhere to these technical specifications when implementing API-related logic:

### 1. Base Logic

- **Endpoint**: `https://api.nextdns.io`
- **Authentication**: Header `X-Api-Key` (REQUIRED for every call).
- **Format**:
  - Success (200): `{ "data": { ... }, "meta": { ... } }`
  - Error (4xx/5xx): `{ "errors": [ { "code": "...", "detail": "..." } ] }`

### 2. Core Entities

- **Profiles**: Managed at `/profiles`. Contains `security`, `privacy`, `parentalControl`,
  `denylist`, `allowlist`, and `settings`.
- **Nested Access**: Supports direct PATCH. Example: `PATCH /profiles/:id/settings/performance`.
- **Arrays**: Managed via `GET`, `PUT`, `POST`. Individual items via `PATCH`, `DELETE` by ID.

### 3. Advanced Features

- **Pagination**: Uses `cursor` strings in `meta`. Max limit: 1000 (logs), 500 (analytics).
- **Date/Time**: ISO 8601, Unix timestamps, or relative (`-6h`, `now`). Use IANA Time Zone names.
- **Analytics**: Append `;series` to endpoints (e.g., `/status;series`) for time-series data.
- **Logs**: Standard `/logs` or streaming `/logs/stream` (SSE). Use `raw=1` for full DNS data.

---

## 🛡️ The 10-Point Protocol System

All contributions MUST strictly follow these protocols to maintain repository integrity:

### 1. Strict Conventional Commits

- **Format**: `type(scope): description` (e.g., `feat(api): add log retention rule`).
- **Scopes**: `api`, `cli`, `ui`, `integrations`, `lint`, `docs`, `chore`.
- **Constraint**: Messages must be lowercase and descriptive.

### 2. Atomic Rule Workflow (MANDATORY)

- **Rule**: Adding/modifying a rule file MUST be accompanied by an update to the corresponding
  `SKILL.md` index in the SAME commit.
- **Validation**: `validate_rules.py` enforces referential integrity between rules and indices.

### 3. Automated Quality Assurance

- **Full Suite**: `pnpm lint` runs Prettier, markdownlint, ESLint (syntax), case-police, and
  `validate_rules.py`.
- **Pre-check**: Always run `pnpm lint:fix` before pushing.
- **CI Enforcement**: GitHub Actions blocks PRs that fail any validation step.

### 4. Terminology Precision

- **Brands**: NextDNS, GitHub, JavaScript, Python, Docker, OpenWrt, Tailscale.
- **Standards**: `profile` (not configuration), `blocklist` (not blacklist), `allowlist` (not
  whitelist), `X-API-Key`.

### 5. Template & Frontmatter Adherence

- Use [rule-template.md](templates/rule-template.md) for all new rules.
- **Required Fields**: `title`, `impact` (HIGH/MEDIUM/LOW), `impactDescription`, `type`
  (capability/efficiency), `tags` (YAML array).
- Titles in frontmatter MUST match the H1 heading exactly.

### 6. Zero-PII & Privacy Security

- **Strict Prohibition**: Never commit real API keys, Profile IDs, or personal data.
- **Placeholders**: Use `abc123` for Profile IDs, `YOUR_API_KEY` for keys, and `example.com` for
  domains.

### 7. Strategic Documentation

- `README.md`: Project overview and usage.
- `SKILL.md`: Entry points for discovery (Keyword-driven indexing).
- `rules/*.md`: Deep technical implementation and code examples.

### 8. Code Block Standardization

- **Mandatory Language Tags**: Bash, javascript, python, json, yaml, http, text.
- **Semantic Markers**: Use ✅ for recommended/correct usage and ❌ for anti-patterns/errors.

### 9. Structural Integrity

- Rules MUST reside in `skills/<category>/rules/*.md`.
- Maintenance scripts reside in `scripts/`.
- Never create ad-hoc root directories or files without consensus.

### 10. Link & Reference Integrity

- Every rule MUST have a `## Reference` section with verified official sources.
- Descriptive labels: `[NextDNS API](https://nextdns.github.io/api/)` instead of `[Link](url)`.

---

## 🔍 AI Skill Triggering Logic

Skills are discovered by agents through a three-tier metadata system:

1. **Skill Level**: `description` in `SKILL.md` (Domain identification).
2. **Rule Level**: `tags` in rule frontmatter (Capability identification).
3. **Keyword Level**: `Keywords` column in `SKILL.md` tables (Specific task matching).

AI assistance quality depends directly on the density and precision of these metadata fields.
