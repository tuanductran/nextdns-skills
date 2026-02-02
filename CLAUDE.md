# CLAUDE.md - Ultimate Governance Constitution

This file serves as the **Ultimate Governance Constitution** for the NextDNS Skills repository. All AI agents working with this codebase MUST strictly adhere to the 10-Point Protocol System defined herein.

---

## Repository Overview

NextDNS agent skills repository providing specialized knowledge for AI agents to handle NextDNS API integration, CLI operations, and Web UI configuration.

- **Purpose**: Empowering AI agents with expert DNS management capabilities.
- **Content**: Markdown-based skills and rules with standardized metadata.
- **Package Manager**: pnpm (NOT npm or yarn).
- **Tools**: markdownlint-cli, case-police.
- **Governance**: 10-Point Protocol System for maximum quality and consistency.

## Development Commands

### Linting and Formatting

```bash
pnpm lint           # Runs markdownlint and case-police check
pnpm lint:fix       # Fixes linting and casing issues automatically
```

**MANDATORY**: All content MUST pass `pnpm lint` before any commit or pull request.

---

## The 10 Governance Protocols

### Protocol 1: Strict Conventional Commits

**Status**: `MANDATORY`

All commit messages MUST follow the Conventional Commits specification:

**Format**: `type(scope): description`

**Allowed Types**:

- `feat` - New feature or capability
- `fix` - Bug fix
- `docs` - Documentation changes only
- `style` - Code style/formatting changes (whitespace, indentation)
- `refactor` - Code restructuring without behavior change
- `chore` - Maintenance tasks (dependencies, configs, tooling)

**Scope Constraints**:

- MUST match directory names: `api`, `cli`, `ui`, `integrations`
- OR use `root` for repository-level changes
- Examples:
    - `feat(api): add profile streaming endpoint rule`
    - `fix(cli): correct daemon restart command syntax`
    - `docs(ui): update security settings best practices`
    - `chore(root): update markdownlint configuration`

**Enforcement**: Commits not following this format will be rejected in code review.

---

### Protocol 2: The "Atomic Update" Workflow (Integrity)

**Status**: `CRITICAL - ZERO TOLERANCE`

**Rule**: Creation of any file in `skills/` MUST include a simultaneous update to the parent `SKILL.md` (or root `README.md` for new skills) in the **same response/commit**.

**Why**: Orphan files break navigation, discoverability, and skill triggering.

**Mandatory Steps When Creating a New Rule**:

1. Create the rule file in `skills/<category>/rules/<name>.md`
2. **IMMEDIATELY** update `skills/<category>/SKILL.md` to add the rule to the appropriate table
3. **VERIFY** the entry includes correct metadata (title, type, tags)
4. Commit both files together with message: `feat(<category>): add <rule-name> rule`

**Example**:

```text
✅ CORRECT: Create `skills/api/rules/rate-limiting.md` + Update `skills/api/SKILL.md`
❌ WRONG: Create `skills/api/rules/rate-limiting.md` (orphan file - PROHIBITED)
```

**Enforcement**: Any pull request with orphan files will be immediately rejected.

---

### Protocol 3: Automated Quality Assurance (Linting)

**Status**: `MANDATORY`

**Command**: All content MUST pass `pnpm lint` (markdownlint + case-police) before commit.

**Standards Enforced**:

- ✅ No trailing whitespace
- ✅ Correct indentation (4 spaces for lists)
- ✅ Proper heading hierarchy (H1 → H2 → H3)
- ✅ Fenced code blocks with language tags
- ✅ Case-police compliance (see Protocol 4)
- ✅ No duplicate headings at the same level (except siblings)

**Workflow**:

1. Make changes to markdown files
2. Run `pnpm lint:fix` to auto-fix issues
3. Run `pnpm lint` to verify compliance
4. Only commit if lint check passes

**Configuration Files**:

- `.markdownlint.yml` - Markdown linting rules
- `package.json` - Lint scripts and case-police patterns

**Enforcement**: CI/CD will fail if linting errors are detected.

---

### Protocol 4: Terminology Precision (Case Police)

**Status**: `MANDATORY`

**Rule**: Strictly enforce correct casing for all technical terms as defined by case-police.

**Technical Terms (Correct Casing)**:

| Correct | Incorrect |
|---------|-----------|
| NextDNS | nextdns, NextDns, NEXTDNS |
| GitHub | Github, github, GITHUB |
| pnpm | PNPM, npm, Npm |
| iOS | ios, IOS |
| macOS | macos, MacOS, Mac OS |
| OpenWrt | Openwrt, openwrt, OpenWRT |
| JavaScript | Javascript, javascript |
| TypeScript | Typescript, typescript |
| PayPal | Paypal, paypal |
| AdGuard | Adguard, adguard |
| DNSMasq | dnsmasq, Dnsmasq |

**Validation**: Run `case-police 'skills/**/*.md'` to check compliance.

**Fix Command**: `case-police 'skills/**/*.md' --fix`

**Enforcement**: Pull requests with incorrect technical term casing will be rejected.

---

### Protocol 5: Template Adherence (Metadata)

**Status**: `MANDATORY`

**Rule**: All rule files MUST utilize `templates/rule-template.md` as the foundation.

**Required YAML Frontmatter**:

```yaml
---
title: "Human-Readable Title"
impact: "HIGH | MEDIUM | LOW"
impactDescription: "Clear explanation of what happens if rule is not followed"
type: "capability | efficiency"
tags: "keyword1, keyword2, keyword3"
---
```

**Field Definitions**:

- `title` - Descriptive name (3-8 words)
- `impact` - Severity level:
    - `HIGH` - Critical, causes failures or security issues
    - `MEDIUM` - Important, affects quality or performance
    - `LOW` - Helpful, improves consistency or clarity
- `impactDescription` - One sentence explaining consequences
- `type`:
    - `capability` - AI cannot solve without this knowledge
    - `efficiency` - AI can solve but poorly without this guidance
- `tags` - Comma-separated keywords for skill triggering (3-7 tags)

**Required Impact Line**:

Immediately after H1 heading:

```markdown
# Rule Title

**Impact: HIGH** - Brief description of impact
```

**Enforcement**: Rules without proper frontmatter will not be indexed and will be rejected.

---

### Protocol 6: Security & Privacy (Zero-PII)

**Status**: `CRITICAL - ZERO TOLERANCE`

**Rule**: NEVER output real configuration IDs, API keys, IP addresses, or personally identifiable information.

**Mandatory Placeholders**:

| Element | Placeholder |
|---------|-------------|
| Profile ID | `<your_profile_id>` or `abc123` |
| API Key | `YOUR_API_KEY` or `<your_api_key>` |
| IP Address | `192.168.1.1` or `<your_ip>` |
| Domain | `example.com` or `<your_domain>` |
| Email | `user@example.com` or `<your_email>` |

**Code Examples**:

```javascript
// ✅ CORRECT
fetch('https://api.nextdns.io/profiles/abc123', {
  headers: { 'X-Api-Key': 'YOUR_API_KEY' }
});

// ❌ WRONG - Real API key exposed
fetch('https://api.nextdns.io/profiles/a1b2c3', {
  headers: { 'X-Api-Key': 'sk_live_abc123xyz...' }
});
```

**Redaction Requirements**:

- Scrub all real credentials from examples
- Use generic placeholders in documentation
- Warn users to replace placeholders with their actual values

**Enforcement**: Any real PII found in documentation will trigger immediate removal and security review.

---

### Protocol 7: Navigation & Indexing (Simple README)

**Status**: `MANDATORY`

**Rule**: Root `README.md` is strictly a **Navigation Hub**. Keep it concise and scannable.

**Format**:

- ✅ Bullet points with links
- ✅ One-line descriptions (max 15 words)
- ✅ Clear section headings
- ✅ Quick examples (max 10 lines per example)
- ❌ NO long paragraphs
- ❌ NO detailed explanations (those go in skill files)
- ❌ NO inline documentation (link to it instead)

**Structure**:

```markdown
## Section Title

- **[Skill Name](path/to/skill.md)** - Brief one-line description
- **[Another Skill](path/to/skill2.md)** - Another brief description
```

**Enforcement**: README.md will be reviewed for excessive verbosity. Keep it under 500 lines.

---

### Protocol 8: Code Block Standardization

**Status**: `MANDATORY`

**Rule**: All code blocks MUST specify a language for syntax highlighting and be copy-paste ready.

**Language Tags** (Always Required):

- ````bash```` - Shell commands
- ````javascript```` - JavaScript code
- ````yaml```` - YAML/frontmatter
- ````json```` - JSON data
- ````conf```` - Configuration files
- ````text```` - Plain text output

**Copy-Paste Ready Requirements**:

1. **Full Paths**: Use absolute paths in commands
2. **Executable**: Code must run without modification
3. **No Placeholders in Commands**: Unless explicitly noted
4. **Comments**: Use `#` for bash, `//` for JS

**Examples**:

````markdown
✅ CORRECT:
```bash
sudo nextdns config set -profile=abc123
sudo nextdns restart
```

❌ WRONG (no language tag):
```
nextdns restart
```
````

**Enforcement**: CI/CD will detect code blocks without language tags and fail the build.

---

### Protocol 9: Directory Structure Enforcement

**Status**: `MANDATORY`

**Rule**: Files must be placed strictly in their designated directories. No exceptions.

**Allowed Locations**:

```text
/
├── skills/
│   ├── nextdns-api/
│   │   ├── SKILL.md
│   │   └── rules/*.md
│   ├── nextdns-cli/
│   │   ├── SKILL.md
│   │   └── rules/*.md
│   ├── nextdns-ui/
│   │   ├── SKILL.md
│   │   └── rules/*.md
│   └── integrations/
│       ├── SKILL.md
│       └── rules/*.md
├── templates/
│   └── rule-template.md
├── data/
│   └── schemas/*.json
├── README.md
├── CLAUDE.md
└── LICENSE
```

**Prohibited Actions**:

- ❌ Creating rule files in repository root
- ❌ Creating subdirectories inside `rules/`
- ❌ Creating arbitrary files outside designated folders
- ❌ Mixing rule types in wrong skill categories

**File Naming**:

- Use `kebab-case.md` for all rule files
- Example: `security-settings.md`, `api-authentication.md`

**Enforcement**: Files in incorrect locations will be rejected during code review.

---

### Protocol 10: Link Integrity & Validation

**Status**: `MANDATORY`

**Rule**: No broken links. All internal links must be verified before commit.

**Link Requirements**:

1. **Internal Links**: Use relative paths from project root
2. **External Links**: Use full URLs with HTTPS
3. **Verification**: Test all links before committing

**Path Accuracy**:

```markdown
✅ CORRECT:
[API Authentication](skills/nextdns-api/rules/authentication.md)
[NextDNS API Docs](https://nextdns.github.io/api/)

❌ WRONG:
[API Authentication](authentication.md)  <!-- Relative path incorrect -->
[NextDNS Docs](http://example.com)       <!-- Broken link -->
```

**Pre-Commit Checklist**:

- [ ] All links use correct relative paths
- [ ] Linked files exist in repository
- [ ] External URLs are accessible
- [ ] No `404` errors in documentation

**Validation Command**:

```bash
# Check for broken internal links
grep -r '\[.*\](.*\.md)' skills/ | while read line; do
  # Extract and verify file paths exist
  echo "Validating: $line"
done
```

**Enforcement**: Pull requests with broken links will be rejected.

---

## Project Architecture

### Skills Structure

The repository is organized by skill directories inside the `skills/` folder:

- `skills/nextdns-api` - Rules for API integration (Auth, Analytics, Logs, Profiles)
- `skills/nextdns-cli` - Rules for CLI installation, daemon control, and advanced routing
- `skills/nextdns-ui` - Rules for Web Dashboard settings based on best practices and threat modeling
- `skills/integrations` - Rules for third-party platform integrations (Tailscale, Home Assistant, Ubiquiti, etc.)

Each skill directory follows this internal structure:

- `SKILL.md` - Entry point containing skill metadata and a table mapping rules to keywords
- `rules/` - Individual markdown files defining specific capabilities or efficiencies

### Rule System

Every file in the `rules/` directory is a standalone piece of knowledge.

**YAML Frontmatter** (Protocol 5):
Every rule MUST contain standardized metadata for agent triggering.

**Impact Line** (Protocol 5):
Immediately following the H1 heading, a bolded summary must exist.

---

## Key Files

- `skills/nextdns-api/SKILL.md` - Schema and mapping for API-related tasks
- `skills/nextdns-cli/SKILL.md` - Schema and mapping for CLI/Terminal tasks
- `skills/nextdns-ui/SKILL.md` - Schema and mapping for Web UI/Configuration tasks
- `skills/integrations/SKILL.md` - Schema and mapping for third-party integration tasks
- `templates/rule-template.md` - Standardized template for creating new rules
- `data/schemas/profile.json` - Mock NextDNS Profile API response for testing
- `package.json` - Defines linting scripts and project metadata
- `.markdownlint.yml` - Global markdown styling rules
- `.github/workflows/validate-rules.yml` - CI/CD workflow for automated validation

---

## Workflow: Adding a New Rule

Follow this **exact sequence** to comply with all protocols:

### Step 1: Use Template (Protocol 5)

```bash
cp templates/rule-template.md skills/<category>/rules/<rule-name>.md
```

### Step 2: Fill Metadata (Protocol 5)

Edit the YAML frontmatter with correct values.

### Step 3: Write Content (Protocols 3, 4, 8)

- Use 4-space indentation
- Apply correct technical term casing
- Add language tags to all code blocks

### Step 4: Update Index (Protocol 2 - CRITICAL)

**IMMEDIATELY** add the rule to `skills/<category>/SKILL.md`:

```markdown
| [Rule Name](rules/<rule-name>.md) | Brief description | `tag1, tag2` |
```

### Step 5: Validate (Protocol 3)

```bash
pnpm lint:fix
pnpm lint
```

### Step 6: Commit (Protocol 1)

```bash
git add skills/<category>/rules/<rule-name>.md
git add skills/<category>/SKILL.md
git commit -m "feat(<category>): add <rule-name> rule"
```

**⚠️ CRITICAL**: Steps 2, 4, and 6 are non-negotiable. Skipping Protocol 2 will result in rejection.

---

## Technical Knowledge Sources

All rules must align with official documentation:

- **API Rules**: [Official NextDNS API Spec](https://nextdns.github.io/api/)
- **CLI Rules**: [NextDNS CLI Wiki](https://github.com/nextdns/nextdns/wiki)
- **UI Rules**: [NextDNS-Config](https://github.com/yokoffing/NextDNS-Config) community guidelines

---

## Enforcement Summary

| Protocol | Status | Enforcement Method |
|----------|--------|-------------------|
| 1. Conventional Commits | MANDATORY | Code review |
| 2. Atomic Updates | CRITICAL | Automated PR check |
| 3. Linting | MANDATORY | CI/CD pipeline |
| 4. Case Police | MANDATORY | Automated check |
| 5. Template Adherence | MANDATORY | Schema validation |
| 6. Zero-PII | CRITICAL | Security audit |
| 7. Simple README | MANDATORY | Manual review |
| 8. Code Blocks | MANDATORY | CI/CD pipeline |
| 9. Directory Structure | MANDATORY | Automated check |
| 10. Link Integrity | MANDATORY | Pre-commit hook |

**Violation Consequences**:

- ⚠️ **MANDATORY** violations → Pull request rejected, must fix
- 🚨 **CRITICAL** violations → Immediate rejection + security review

---

## Conclusion

These 10 Governance Protocols ensure the NextDNS Skills repository maintains the highest standards of quality, security, and consistency. All contributors and AI agents MUST strictly adhere to these protocols without exception.

**Remember**: Quality is not negotiable. Excellence is the standard.
