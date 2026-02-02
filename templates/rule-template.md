---
title: "Your Rule Title"
impact: "HIGH"
impactDescription: "Clear explanation of what happens if rule is not followed"
type: "capability"
tags: "keyword1, keyword2, keyword3"
---

# Your Rule Title

**Impact: HIGH** - Brief description of impact

<!-- 
This template provides a standardized structure for creating NextDNS skill rules.
MUST comply with CLAUDE.md Protocol 5: Template Adherence (Metadata)

YAML Frontmatter Requirements (MANDATORY):
- title: Descriptive name (3-8 words) - Use quotes for consistency
- impact: Severity level - Choose one: "HIGH", "MEDIUM", or "LOW"
  * HIGH - Critical, causes failures or security issues
  * MEDIUM - Important, affects quality or performance
  * LOW - Helpful, improves consistency or clarity
- impactDescription: One sentence explaining consequences - Use quotes
- type: Choose one: "capability" or "efficiency"
  * capability - AI cannot solve without this knowledge
  * efficiency - AI can solve but poorly without this guidance
- tags: Comma-separated keywords for skill triggering (3-7 tags) - Use quotes

Impact Line (MANDATORY):
- MUST immediately follow the H1 heading
- Format: **Impact: [HIGH|MEDIUM|LOW]** - [Brief description]
- Must match the impact level in frontmatter
-->

## Overview

<!-- 
Provide a brief introduction to what this rule addresses and why it matters.
Explain the context and when this rule should be applied.
-->

[Explain what this rule covers and its importance]

## Correct Usage

<!-- 
Show examples of the correct way to implement this rule.
MUST follow Protocol 8: Code Block Standardization
- All code blocks MUST specify language tag (bash, javascript, json, yaml, etc.)
- Code must be copy-paste ready where applicable
- Use full paths and executable commands
-->

```bash
# ✅ Example showing correct implementation
# Replace placeholders with actual values
nextdns config set -profile=abc123
```

```javascript
// ✅ Example in JavaScript (if applicable)
const config = {
  profileId: 'abc123',
  apiKey: 'YOUR_API_KEY'
};
```

## Do NOT Use

<!-- 
Show anti-patterns or common mistakes to avoid.
Mark incorrect examples with ❌ symbol.
-->

```bash
# ❌ Example of incorrect implementation
# Explain why this is wrong
```

## Best Practices

<!-- 
List additional tips and recommendations.
Use bullet points for clarity.
-->

- **Practice 1**: Explanation
- **Practice 2**: Explanation  
- **Practice 3**: Explanation

## Common Pitfalls

<!-- 
Describe common mistakes and how to avoid them.
Provide actionable guidance.
-->

1. **Pitfall 1**: Description and how to avoid
2. **Pitfall 2**: Description and how to avoid

## Troubleshooting

<!-- 
Provide guidance on debugging issues related to this rule.
Include common error messages and solutions.
-->

**Issue**: [Common error or problem]  
**Solution**: [How to fix it]

## Reference

<!-- 
Link to official documentation and relevant resources.
MUST follow Protocol 10: Link Integrity
- Use full HTTPS URLs for external links
- Verify all links are accessible
-->

- [NextDNS Official Documentation](https://nextdns.io/docs)
- [NextDNS API Documentation](https://nextdns.github.io/api/)
- [Related Resource](https://example.com)
