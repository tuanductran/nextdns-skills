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
Refer to AGENTS.md for detailed instructions on category manifests,
keyword indexing, and skill triggering protocols.
-->
