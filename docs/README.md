# Project documentation

This directory contains the public documentation for **NextDNS Skills**. It is intended for contributors, reviewers, maintainers, and users who need to understand how the repository is organized and how changes are proposed. It is separate from `AGENTS.md`, which provides repository context, and `.agents/workflows/`, which provides reusable procedures for coding agents.

## Start here

| Need | Document | Audience |
| :--- | :--- | :--- |
| Understand priorities and future work | [ROADMAP.md](ROADMAP.md) | Maintainers, contributors, and users |
| Understand source, generated output, and CI | [ARCHITECTURE.md](ARCHITECTURE.md) | Contributors and reviewers |
| Add a rule or prepare a pull request | [CONTRIBUTING.md](CONTRIBUTING.md) | Contributors |
| Write or review reliable documentation | [DOCUMENTATION.md](DOCUMENTATION.md) | Authors and reviewers |

## Documentation boundaries

The repository has three complementary documentation layers. Public project documents in `docs/` explain the project to humans. Root and skill-level `AGENTS.md` files provide context and constraints to coding agents. The `.agents/workflows/` directory contains repeatable agent procedures; it does not execute automatically and is not a replacement for GitHub Actions.

| Layer | Canonical purpose | Do not use it for |
| :--- | :--- | :--- |
| `docs/` | Project explanation, decisions, roadmap, and contributor guidance | Generated skill rule content |
| `AGENTS.md` | Repository and skill context for agents | Public release notes or user tutorials |
| `.agents/workflows/` | Repeatable agent procedures | Source-of-truth architecture or product requirements |
| `skills/*/rules/` | Domain knowledge injected into agents | Manual edits to generated `skills/*/AGENTS.md` |
| `templates/` and `data/schemas/` | Reusable formats and structural truth | One-off undocumented exceptions |

## Maintenance

Treat `docs/` as versioned project content. Update the relevant document when a workflow, architecture boundary, validation command, or roadmap priority changes. Keep claims grounded in repository evidence or cited official sources, label proposals as proposals, and never place live account data or credentials in any documentation layer.

The [roadmap](ROADMAP.md) is intentionally directional rather than a promise of delivery dates. A completed item should link to the validating commit, pull request, or test evidence when that evidence exists.

_Last reviewed: 2026-08-18._
