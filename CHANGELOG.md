# Changelog

This file records user-facing, contributor-facing, and distribution-relevant changes to NextDNS Skills. It intentionally does not duplicate every individual rule edit; detailed implementation evidence belongs in commits and pull requests.

## Unreleased

### Added

- Public documentation index in `docs/`.
- Project roadmap covering documentation, coverage, developer experience, evaluation, and distribution priorities.
- Public architecture, contribution, and documentation standards.
- Root contribution, security, and code-of-conduct entry points.
- GitHub issue and pull-request templates.
- A structured `audit` command with JSON output for maintenance quality gates.
- `build --check` and root `pnpm build:check` for generated-output drift detection.
- `--version` support and version helpers for both package CLIs.

### Changed

- Documentation now distinguishes public project guidance, agent context, agent workflows, source rules, and generated output.
- Package documentation now covers audit, public API metadata, and generated-output checks.

### Maintenance notes

The next release entry should summarize meaningful changes since this baseline and link to the relevant comparison, commit range, or pull request. Do not include credentials, live profile data, DNS logs, or private account observations.

## Release entry template

```markdown
## [Version or date]

### Added

- Describe a user-visible capability or a new supported workflow.

### Changed

- Describe a meaningful behavior, source, compatibility, or documentation change.

### Fixed

- Describe a corrected rule, stale reference, validation issue, or build defect.

### Security

- Describe a public security remediation without exposing exploit details or private data.
```
