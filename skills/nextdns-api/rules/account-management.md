---
title: 'Account Management'
impact: MEDIUM
impactDescription: 'Querying account info and usage quota without this rule causes incorrect dashboard metrics and missing plan limit displays'
type: capability
tags:
  - account
  - usage
  - quota
  - plan
  - billing
  - profile list
---

<!-- @case-police-ignore Api -->

# Account management

Retrieve account information, usage quota, and profile list for dashboard display

## Overview

The NextDNS API exposes account-level endpoints that sit above individual profiles. These endpoints
provide your current plan, monthly query usage (for example, "41,734 / 300,000"), the list of all
profiles owned by the account, and basic account metadata. Use these when building a dashboard that
must display billing context or enumerate all available profiles.

## Correct usage

### Get all profiles

```javascript
// ✅ List all profiles associated with the account
const response = await fetch('https://api.nextdns.io/profiles', {
  headers: { 'X-Api-Key': 'YOUR_API_KEY' },
});

const { data } = await response.json();
// data: [{ "id": "abc123", "name": "Home Network" }, ...]
```

```python
# ✅ Python equivalent
import requests

response = requests.get(
    'https://api.nextdns.io/profiles',
    headers={'X-Api-Key': 'YOUR_API_KEY'},
)
profiles = response.json()['data']
```

### Create a profile

```javascript
// ✅ Create a new profile (returns the new profile id)
const response = await fetch('https://api.nextdns.io/profiles', {
  method: 'POST',
  headers: {
    'X-Api-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ name: 'Work Laptop' }),
});

const { data } = await response.json();
const newProfileId = data.id; // e.g. "def456"
```

### Paginate through all profiles

```javascript
// ✅ If you have many profiles, use cursor-based pagination
async function getAllProfiles(apiKey) {
  const profiles = [];
  let cursor = null;

  do {
    const url = new URL('https://api.nextdns.io/profiles');
    if (cursor) url.searchParams.set('cursor', cursor);

    const response = await fetch(url, {
      headers: { 'X-Api-Key': apiKey },
    });
    const result = await response.json();

    if (result.errors) throw new Error(result.errors[0].detail);

    profiles.push(...result.data);
    cursor = result.meta?.pagination?.cursor ?? null;
  } while (cursor);

  return profiles;
}

const allProfiles = await getAllProfiles('YOUR_API_KEY');
console.log(`Total profiles: ${allProfiles.length}`);
```

### TypeScript types

```typescript
// ✅ Type definitions for account-level data
interface Profile {
  id: string;
  name: string;
  fingerprint?: string;
}

interface ProfileListResponse {
  data: Profile[];
  meta?: {
    pagination?: { cursor: string | null };
  };
}

async function listProfiles(): Promise<Profile[]> {
  const res = await fetch('https://api.nextdns.io/profiles', {
    headers: { 'X-Api-Key': process.env.NEXTDNS_API_KEY ?? '' },
  });
  const json: ProfileListResponse = await res.json();
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return json.data;
}
```

## Do NOT Use

```javascript
// ❌ Hardcoding a profile ID without fetching the list first
// — the ID may not belong to the authenticated account
const profileId = 'abc123'; // ❌ Assume nothing; always verify via GET /profiles

// ❌ Ignoring pagination — accounts with many profiles will silently lose data
const { data } = await fetch('https://api.nextdns.io/profiles', { headers }).then(r => r.json());
return data; // ❌ Returns first page only (default limit: 10)
```

## Best practices

- **Always verify profile ownership**: Before acting on a profile ID (from a URL param or form
  input), call `GET /profiles/{id}` to confirm it belongs to the authenticated account.
- **Cache the profile list**: The list changes infrequently. Cache for 60 seconds to avoid
  redundant API calls on every page navigation.
- **Use the profile `name` for display**: The `id` is opaque and short. Use `name` in all UI labels
  and log it alongside `id` for debugging.
- **Handle empty accounts**: A freshly created API key will return an empty `data: []` array from
  `GET /profiles`. Render a "Create your first profile" empty state instead of an error.

## Troubleshooting

### Issue: `GET /profiles` returns an empty array despite profiles existing

**Symptoms**: The API returns `{ "data": [] }` but profiles are visible in the NextDNS dashboard.

**Solution**: Verify you are using the API key that belongs to the same account. API keys are
per-account — a key from a sub-account or a different login will not see profiles owned by another
account.

```bash
# Confirm which account owns the key by inspecting the profile list
curl -H "X-Api-Key: YOUR_API_KEY" https://api.nextdns.io/profiles
```

### Issue: 401 Unauthorized when calling `/profiles`

**Solution**: The `X-Api-Key` header must be present on every request. The key is found at the
bottom of the NextDNS account page: `https://my.nextdns.io/account`.

## Reference

- [NextDNS API — Profiles](https://nextdns.github.io/api/#profiles)
- [NextDNS API — Authentication](https://nextdns.github.io/api/#authentication)
- [NextDNS Account Page](https://my.nextdns.io/account)
