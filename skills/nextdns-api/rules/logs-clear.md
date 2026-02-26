---
title: 'Logs Clear'
impact: HIGH
impactDescription:
  'Clearing logs is permanent and irreversible — there is no confirmation prompt or undo'
type: capability
tags:
  - logs
  - clear logs
  - delete logs
  - purge
  - gdpr
---

<!-- @case-police-ignore Api -->

# Logs Clear

Permanently delete all stored DNS logs for a profile

## Overview

The `DELETE /profiles/{id}/logs` endpoint erases all DNS query logs stored for a profile. This is
useful for GDPR/privacy compliance workflows, resetting a profile to a clean state, or purging
sensitive log data on demand.

This operation is **permanent and irreversible**. Logs cannot be recovered after deletion.

## Correct Usage

```javascript
// ✅ Clear all logs for a profile
const response = await fetch('https://api.nextdns.io/profiles/abc123/logs', {
  method: 'DELETE',
  headers: { 'X-Api-Key': 'YOUR_API_KEY' },
});

// 204 No Content on success — no response body
if (response.status === 204) {
  console.log('All logs cleared successfully');
}
```

```python
# ✅ Python example
import requests

response = requests.delete(
    'https://api.nextdns.io/profiles/abc123/logs',
    headers={'X-Api-Key': 'YOUR_API_KEY'},
)

# 204 No Content on success
assert response.status_code == 204
```

```bash
# ✅ cURL example
curl -X DELETE https://api.nextdns.io/profiles/abc123/logs \
  -H "X-Api-Key: YOUR_API_KEY" \
  -w "%{http_code}"
# Expected: 204
```

## Do NOT Use

```javascript
// ❌ Using POST or PATCH — only DELETE is supported for clearing logs
await fetch('https://api.nextdns.io/profiles/abc123/logs', {
  method: 'POST', // ❌ Will return 405 Method Not Allowed
});

// ❌ Calling without verifying profile ID — logs deletion is permanent
await fetch('https://api.nextdns.io/profiles/wrongId/logs', {
  method: 'DELETE',
  headers: { 'X-Api-Key': 'YOUR_API_KEY' },
  // ❌ Double-check the profile ID before calling
});
```

## Best Practices

- **Verify the profile ID before calling**: The operation is irreversible. Confirm you are targeting
  the correct profile.
- **Automate GDPR/retention workflows**: Use this endpoint to implement data retention policies that
  clear logs after a defined period.
- **Disable logs before clearing**: If you plan to stop logging permanently, first set
  `logs.enabled = false` via the Settings endpoint, then clear existing logs.
- **Note that profile deletion clears logs automatically**: If the profile itself is being deleted,
  the logs are cleared as part of the profile deletion — no separate call needed.

## Troubleshooting

### Issue: 401 Unauthorized

**Symptoms**: Response `{"errors": [{"code": "unauthorized"}]}`.

**Solution**: Ensure the `X-Api-Key` header is present and the key belongs to the account that owns
the profile.

### Issue: 404 Not Found

**Symptoms**: The profile ID does not exist or belongs to a different account.

**Solution**: Verify the profile ID by listing all profiles first.

```javascript
// List all profiles to verify IDs
const profiles = await fetch('https://api.nextdns.io/profiles', {
  headers: { 'X-Api-Key': 'YOUR_API_KEY' },
}).then((r) => r.json());

console.log(profiles.data.map((p) => ({ id: p.id, name: p.name })));
```

## Reference

- [NextDNS API — Logs Clear](https://nextdns.github.io/api/#clear)
- [NextDNS Help Center](https://help.nextdns.io)
