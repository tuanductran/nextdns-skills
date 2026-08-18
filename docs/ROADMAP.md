# Project roadmap

**Status:** Proposed and maintained with the repository  
**Scope:** NextDNS Skills rules, agent context, contributor experience, validation, and distribution  
**Last reviewed:** 2026-08-18

## Purpose

This roadmap describes the order in which the project should improve its knowledge coverage, maintenance workflow, and distribution quality. It is a planning document, not a promise of delivery dates or subscription features. Each item becomes actionable only when it has an owner, a clear acceptance condition, and a validation path.

The project should preserve its central contract: provide concise, source-grounded context that helps an AI agent work with NextDNS API, CLI, Web UI, integrations, and frontend patterns. Rules remain the domain source of truth; generated `skills/*/AGENTS.md` files remain build artefacts; public project guidance belongs in `docs/`.[1] [2] [3]

## Current baseline

The repository currently publishes five skill categories covering API, CLI, Web UI, integrations, and frontend patterns. The rule counts and category descriptions are maintained in the root README and should be treated as the public inventory.[1] The repository also has build tooling, rule validation, the combined `audit` command, duplicate-title checks, tag checks, Markdown linting, link validation, tests, and agent workflows for repeatable changes.[2] [3] [4] The audit is a repository-content aggregator with human-readable and JSON output; its stable checks are referential integrity, frontmatter, tags, duplicate titles, and duplicate tag sets.

| Area | Current state | Planning implication |
| :--- | :--- | :--- |
| Domain coverage | Five skill categories with source rules and generated context | Prioritize freshness and cross-category consistency before adding large new categories |
| Source discipline | Rules contain references and use official NextDNS sources where available | Make source status, observation date, and stale-link handling more explicit |
| Agent workflow | `.agents/workflows/` covers adding rules, research, review, and release checks | Keep agent procedures separate from public contributor documentation |
| Build pipeline | Generated output is rebuilt from source rules; validation, the combined audit, and tests run through pnpm/Turbo | Treat generated drift and failed audit checks as release blockers |
| Privacy and safety | Root guidance prohibits credentials, live profile data, logs, cookies, and session data | Add automated and reviewer checks to preserve zero-PII content |
| Public documentation | README and `docs/` explain installation, development commands, audit usage, architecture, and maintenance standards | Keep the audit contract documented without hardcoding volatile counts or report timestamps |

## Priorities

The priority levels describe sequencing, not importance in isolation. P0 work establishes a dependable foundation. P1 protects the quality and freshness of user-facing knowledge. P2 improves contributor productivity and evaluation. P3 improves distribution and release transparency after the earlier layers are stable.

| Priority | Theme | Desired outcome | Acceptance condition |
| :--- | :--- | :--- | :--- |
| **P0** | Documentation foundation | Contributors can discover the roadmap, architecture, contribution process, and documentation standards | `docs/` index links to maintained documents; CI validates Markdown and links; generated-output rules are documented |
| **P1** | Coverage and trust | High-impact NextDNS guidance stays accurate, referenced, privacy-safe, and internally consistent | High-risk rules have current official references, explicit caveats, representative tests, and no unresolved known stale links |
| **P2** | Developer experience and evaluation | Contributors can create, search, export, review, and evaluate rules with less manual work | Templates, schemas, examples, extracted tests, and reproducible audits cover the main maintenance paths |
| **P3** | Distribution and release transparency | Users can understand compatibility, changes, and how the published skill set is versioned | A documented release policy, changelog convention, compatibility matrix, and release verification checklist exist |

## Workstreams

### P0 — Establish the public documentation foundation

The first slice creates a stable human-facing entry point without duplicating agent-only instructions. It includes this roadmap, an architecture guide, contribution guidance, and documentation standards. It also keeps the README focused on installation, inventory, and quick commands while linking readers to deeper material.

| Deliverable | Owner outcome | Definition of done |
| :--- | :--- | :--- |
| Documentation index | A contributor can find the right document in one step | `docs/README.md` links to every maintained public document |
| Architecture guide | A reviewer can distinguish source rules, manifests, generated output, packages, and CI | `docs/ARCHITECTURE.md` includes the canonical-source flow and generated-output boundary |
| Contributor guide | A first-time contributor can add and validate a rule | `docs/CONTRIBUTING.md` covers templates, manifests, build, checks, commit format, and pull-request evidence |
| Documentation standard | Authors know how to cite, label observations, verify links, and remove PII | `docs/DOCUMENTATION.md` defines source hierarchy and stale-link policy |

### P1 — Improve coverage and trust

P1 should favor maintenance of high-impact rules over indiscriminate expansion. The API and CLI areas require careful handling of authentication, profile identifiers, analytics, logs, installation, and platform behavior. Web UI and integration rules should identify whether a statement comes from public documentation, an observed dashboard state, or an inference. Frontend rules should use framework documentation that is reachable and current.

| Work item | Priority signal | Validation path |
| :--- | :--- | :--- |
| High-risk rule review | Authentication, profile mutation, logs, installer commands, and account-linked behavior | Source review, zero-PII scan, link check, and a positive/negative test case |
| Source freshness pass | Official pages move, rate-limit, or remove deep links | Browser or HTTP verification with an exception note for protected, download, or rate-limited URLs |
| Cross-skill terminology pass | The same concept appears in API, CLI, UI, and integration rules | Search for profile, blocklist, allowlist, transport, and setup terminology; review conflicting guidance |
| Dashboard observation protocol | Account-backed observations can be useful without exposing account data | Record only generalized behavior and observation date; never commit identifiers, logs, cookies, or screenshots with PII |
| Compatibility matrix | Platform-specific guidance is discoverable and honest about support boundaries | Each supported platform links to an official source or states the limitation explicitly |

### P2 — Improve developer experience and evaluation

P2 should turn recurring maintenance work into discoverable, reproducible operations. The project already has rule search, export, statistics, test extraction, templates, schemas, and a combined audit with JSON output; the next step is to document their expected inputs and outputs and add representative fixtures where behavior is easy to regress. The audit baseline was implemented in commit [`17c759b`](https://github.com/tuanductran/nextdns-skills/commit/17c759b), which also added malformed-frontmatter coverage to the maintenance package tests.

| Work item | Expected improvement | Exit evidence |
| :--- | :--- | :--- |
| Rule authoring examples | Fewer malformed frontmatter and unregistered rules | Example-driven template guidance plus a passing validation fixture; malformed-frontmatter audit coverage is now present in [`audit.test.ts`](../packages/nextdns-scripts/src/__tests__/audit.test.ts) |
| Schema and export guide | Consumers can use `data/schemas/profile.json` and exported JSON/CSV safely | Documented field ownership, placeholder policy, and a sample generated artifact |
| Browser link audit | Link failures are classified instead of treated as one undifferentiated error | Reproducible command or script with categories for 200/304, redirects, protected pages, downloads, rate limits, and real failures |
| Evaluation fixtures | Changes to rule content can be judged against representative prompts | Extracted tests include expected coverage and at least one negative case for high-risk rules |
| Combined audit and contributor diagnostics | One command summarizes repository integrity and provides machine-readable evidence for CI and reviews | `pnpm run audit -- --json` reports five stable checks; package exports and tests cover `AuditReport`; failed checks still link back to the owning validator and repair path |

### P3 — Improve distribution and release transparency

P3 should begin only after the source/generated boundary and quality gates are stable. It should make releases legible without inventing a promise about external marketplaces. The repository should document what is versioned here, what is generated, what is published by external tooling, and which checks are required before a release commit.

| Work item | Expected improvement | Exit evidence |
| :--- | :--- | :--- |
| Versioning policy | Maintainers know when a skill manifest, rule set, or tooling change requires a version increment | A versioning document with examples for patch, minor, and major changes |
| Changelog convention | Users can see meaningful content and tooling changes | A maintained changelog format or release-note template exists |
| Compatibility matrix | Users can distinguish NextDNS service, CLI, browser, and framework assumptions | Matrix links each assumption to a source and review date |
| Release checklist | Release commits are reproducible and PII-free | Release workflow, CI evidence, generated-output diff, and clean-tree check are required |
| Distribution verification | Published artifacts match the repository source | A documented post-publish smoke check covers install, skill discovery, and representative rule retrieval |

## Suggested sequencing

The recommended sequence is **P0 foundation**, followed by a focused P1 review of high-impact API, CLI, UI, and installer guidance. The project can then add P2 fixtures and diagnostics while P1 maintenance continues. P3 versioning and release transparency should be introduced after at least one complete release has been validated through the documented process.

This sequence deliberately avoids a calendar commitment. External documentation, NextDNS behavior, framework versions, and distribution services can change independently of this repository. A maintainer may reorder work when a security issue, a breaking upstream change, or a user-facing distribution failure requires earlier attention.

## Definition of done for roadmap items

A roadmap item is complete only when its implementation is present in the canonical location, its public documentation explains the behavior, generated outputs are rebuilt where applicable, and the relevant checks pass. For audit-related work, the evidence must include the command mode used, the stable check contract, relevant package tests, and a clean distinction between audit results and generated-output or link checks. Changes that affect domain guidance must include a source or an explicit statement that the content is an inference or proposal. Changes that touch account-backed observations must include a privacy review and must not include live identifiers or session artifacts.

A completed item should be linked from the relevant section of this file to a commit, pull request, issue, or test artifact. If no such evidence exists, the item should remain marked as planned rather than completed.

## Risks and responses

| Risk | Consequence | Response |
| :--- | :--- | :--- |
| Upstream docs move or become rate-limited | Link checks produce false positives or stale guidance persists | Prefer stable canonical roots, record exceptions, and recheck high-impact links in a browser when needed |
| Generated files drift from source rules | Agents receive content that differs from reviewed source | Rebuild `skills/*/AGENTS.md` in the same change and fail review on unexpected generated diff |
| Roadmap becomes a wish list | Contributors cannot tell what is actionable | Require an owner outcome, acceptance condition, and evidence for each completed item |
| Account observations leak PII | Security and privacy exposure | Use generalized observations, safe placeholders, and a pre-commit/reviewer PII check |
| Framework versions diverge from rule content | Frontend guidance becomes misleading | Record framework version assumptions, validate official URLs, and review compatibility changes separately |

## Updating this roadmap

Open a documentation change when priorities, sequencing, or acceptance conditions change. Keep completed work linked to evidence, move abandoned work to an explicit deferred or rejected note, and avoid silently deleting context that explains an important decision. The public document should remain concise enough to review while preserving the reasoning needed for maintainers.

## References

[1]: ../README.md "NextDNS Skills project inventory and commands"
[2]: ../AGENTS.md "Repository rules, architecture, and validation protocol"
[3]: ../.agents/workflows/index.md "Agent workflow routing and safety boundary"
[4]: ../package.json "Repository scripts and quality gates"
