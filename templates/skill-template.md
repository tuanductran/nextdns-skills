---
name: skill-name
description:
  Comprehensive description of what this skill covers and when it should be used. Include specific
  trigger keywords that help AI agents identify when to activate this skill. Mention key
  technologies, platforms, or use cases. This description should be detailed enough to enable
  reliable skill triggering.
license: MIT
metadata:
  author: tuanductran
  version: '1.0.0'
---

# Skill Name

Brief overview paragraph explaining the purpose and scope of this skill category.

## Capability Rules

Rules that address problems AI cannot solve without this specialized knowledge.

| Rule                                  | Keywords                     | Description                                |
| ------------------------------------- | ---------------------------- | ------------------------------------------ |
| [rule-name](rules/rule-name.md)       | keyword1, keyword2, keyword3 | Brief description of what this rule covers |
| [another-rule](rules/another-rule.md) | keyword1, keyword2           | Another rule description                   |

## Efficiency Rules

Rules that provide optimal patterns and best practices for problems AI can solve but not well.

| Rule                                            | Keywords           | Description                         |
| ----------------------------------------------- | ------------------ | ----------------------------------- |
| [optimization-rule](rules/optimization-rule.md) | keyword1, keyword2 | Description of optimization pattern |
| [best-practice](rules/best-practice.md)         | keyword1, keyword2 | Description of best practice        |

## Adding New Rules

When adding a new rule to this skill category:

1. Create rule file: `cp templates/rule-template.md skills/<category>/rules/<rule-name>.md`
2. Fill YAML frontmatter with correct metadata
3. Write content following template structure
4. **IMMEDIATELY** update this SKILL.md file (add entry to appropriate table)
5. Validate: `pnpm lint:fix`
6. Commit both files: `feat(<category>): add <rule-name> rule`

⚠️ **CRITICAL**: Step 4 is mandatory. Creating orphan files without updating SKILL.md will result in
CI failure.

## Skill Categories

This skill covers the following areas:

- **Area 1**: Description of what this area covers
- **Area 2**: Description of another area
- **Area 3**: Additional coverage area

## Usage Examples

### Example 1: Common Use Case

Brief description of a common scenario where this skill applies.

```bash
# Example command or code
nextdns command --option value
```

### Example 2: Another Scenario

Description of another typical use case.

```javascript
// Example code
const result = await apiCall();
```

## Related Skills

- **skill-name-1**: Brief description of how it relates
- **skill-name-2**: Another related skill
- **skill-name-3**: Additional related skill

## Resources

- [NextDNS Help Center](https://help.nextdns.io)
- [API Reference](https://nextdns.github.io/api/)
- [Community Resources](https://github.com/yokoffing/NextDNS-Config)

---

<!--
SKILL.md TEMPLATE USAGE NOTES:

1. YAML Frontmatter (MANDATORY):
   - name: Skill identifier (kebab-case, matches directory name)
   - description: Detailed description with trigger keywords (2-4 sentences)
     * Include specific technologies, platforms, use cases
     * Add keywords that help AI identify when to use this skill
     * Mention common scenarios and trigger phrases
   - license: MIT (standard for this repository)
   - metadata.author: tuanductran (repository owner)
   - metadata.version: "1.0.0" (semantic versioning, quoted)

2. Skill Name (H1):
   - Should be human-readable version of the name
   - Examples: "NextDNS API", "NextDNS CLI", "Platform Integrations"

3. Rule Tables:
   - Separate tables for Capability and Efficiency rules
   - Columns: Rule (with link), Keywords (comma-separated), Description
   - Rule links use relative paths: rules/rule-name.md
   - Keep descriptions concise (one line)
   - Keywords should match tags in rule frontmatter

4. Rule Organization:
   - **Capability Rules**: Core functionality, API-specific patterns, critical knowledge
   - **Efficiency Rules**: Best practices, optimizations, common patterns
   - Sort rules logically (by topic or importance, not alphabetically)

5. Directory Structure:
   skills/
   ├── <skill-name>/
   │   ├── SKILL.md          ← This file
   │   └── rules/
   │       ├── rule-1.md
   │       ├── rule-2.md
   │       └── rule-3.md

6. Naming Conventions:
   - Skill directory: kebab-case (nextdns-api, nextdns-cli, integrations)
   - SKILL.md: Always uppercase
   - Rule files: kebab-case (authentication.md, profile-management.md)

7. Rule Registration Process:
   - Every rule file MUST be registered in this SKILL.md
   - Add to appropriate table (Capability or Efficiency)
   - Use format: | [display-name](rules/filename.md) | keywords | description |
   - Update atomically with rule file creation/modification

8. Validation:
   - CI checks referential integrity (all rules registered, all links valid)
   - Run `pnpm lint` to validate before committing
   - Run `pnpm lint:fix` to auto-fix formatting issues

9. Skill Triggering:
   - The description field is crucial for AI skill activation
   - Include specific keywords users might mention
   - Mention platforms, technologies, and common tasks
   - Examples: "API integration", "CLI installation", "router setup"

10. Examples Section (Optional but Recommended):
    - Provide quick reference examples
    - Show common use cases
    - Keep examples concise
    - Link to specific rules for details

11. Related Skills (Optional):
    - Link to other skill categories that users might need
    - Explain relationships between skills
    - Help AI understand when to combine multiple skills

12. Maintenance:
    - Keep rule counts in README.md synchronized
    - Update version when making significant changes
    - Review and update description if skill scope changes
    - Ensure all links remain valid

13. Quality Standards:
    - Follow all 10 Protocols from CLAUDE.md
    - Use exact NextDNS terminology
    - Validate all links
    - Run linters before committing
    - Commit with conventional commit message: feat(skill-name): description
-->
