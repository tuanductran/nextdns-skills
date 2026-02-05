---
title: 'Your Rule Title'
impact: HIGH
impactDescription: 'Clear explanation of what happens if rule is not followed'
type: capability
tags:
  - keyword1
  - keyword2
  - keyword3
  - keyword4
---

<!-- @case-police-ignore Api -->

# Your Rule Title

Brief one-line description of what this rule addresses

## Overview

Provide context about what this rule covers and when it should be applied. Explain the problem this
rule solves and why it matters for NextDNS users.

This section should help users understand:

- What scenario this rule applies to
- Why this approach is necessary
- What benefits following this rule provides

## Correct Usage

Show the recommended way to implement this rule with clear, working examples.

```bash
# ✅ Example showing correct implementation
# Use realistic but safe placeholder values
nextdns config set -profile=abc123
```

```javascript
// ✅ Example in JavaScript (if applicable)
const response = await fetch('https://api.nextdns.io/profiles/abc123', {
  headers: {
    'X-Api-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
```

```python
# ✅ Example in Python (if applicable)
import requests

headers = {
    'X-Api-Key': 'YOUR_API_KEY'
}

response = requests.get('https://api.nextdns.io/profiles/abc123', headers=headers)
data = response.json()
```

### Additional Examples (if needed)

Provide more examples for different use cases or scenarios.

## Do NOT Use

Show anti-patterns and common mistakes to avoid. Mark all incorrect examples with ❌.

```bash
# ❌ Example of incorrect implementation
# Explain specifically why this is wrong
nextdns config set profile=abc123  # Missing hyphen before 'profile'
```

```javascript
// ❌ Wrong approach
// Explain the issue
const response = await fetch('https://api.nextdns.io/profiles/abc123');
// Missing authentication header
```

## Best Practices

List actionable recommendations and tips for optimal implementation.

- **Practice 1**: Specific recommendation with clear rationale
- **Practice 2**: Another important tip with explanation
- **Practice 3**: Additional guidance for edge cases
- **Practice 4**: Performance or security consideration

## Common Pitfalls

Describe frequent mistakes users make and how to avoid them.

### Pitfall 1: Descriptive Name

Explain the mistake and its consequences.

**Solution**: Provide clear steps to avoid or fix this issue.

### Pitfall 2: Another Common Issue

Describe the problem scenario.

**Solution**: Explain the correct approach.

## Troubleshooting

Provide debugging guidance for issues related to this rule.

### Issue: Common Error or Problem

**Symptoms**: What the user will observe when this issue occurs.

**Solution**: Step-by-step instructions to resolve the issue.

```bash
# Commands to diagnose or fix the problem
nextdns status
```

### Issue: Another Potential Problem

**Symptoms**: Observable behavior indicating this issue.

**Solution**: Resolution steps with examples.

## Reference

Link to official documentation and relevant resources. Always use HTTPS URLs.

- [NextDNS API Documentation](https://nextdns.github.io/api/)
- [NextDNS CLI Wiki](https://github.com/nextdns/nextdns/wiki)
- [NextDNS Help Center](https://help.nextdns.io)
- [Specific Related Documentation](https://example.com)

---

<!--
TEMPLATE USAGE NOTES:
Refer to AGENTS.md for detailed instructions on rule creation protocols,
frontmatter requirements, and quality standards.
-->
