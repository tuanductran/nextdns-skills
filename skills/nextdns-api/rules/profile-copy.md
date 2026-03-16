---
title: 'Profile Copy and Duplication'
impact: MEDIUM
impactDescription: 'There is no single clone endpoint — incorrect copy order omits nested settings or blocklists, resulting in a silently incomplete duplicate'
type: capability
tags:
  - profile copy
  - duplicate profile
  - clone
  - migration
  - backup
  - bulk management
---

<!-- @case-police-ignore Api -->

# Profile copy and duplication

Clone an existing NextDNS profile by reading all nested settings and writing them to a new profile

## Overview

The NextDNS API does not provide a dedicated clone or duplicate endpoint. To copy a profile, you
must fetch each nested object and array individually, then POST them to the new profile in the
correct order. Because some nested endpoints are interdependent (for example, the denylist depends
on the profile existing), the sequence matters.

Typical use cases:

- Creating a template profile and replicating it for new users
- Backing up a profile before making experimental changes
- Migrating settings from a personal profile to a team profile

## Correct usage

### Full profile copy — JavaScript

```javascript
// ✅ Clone a profile: read all settings, write to a new profile
async function copyProfile(sourceId, newName, apiKey) {
  const headers = {
    'X-Api-Key': apiKey,
    'Content-Type': 'application/json',
  };

  async function get(path) {
    const res = await fetch(`https://api.nextdns.io${path}`, { headers });
    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0].detail);
    return json.data;
  }

  async function patch(path, body) {
    const res = await fetch(`https://api.nextdns.io${path}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0].detail);
    return json.data;
  }

  async function put(path, body) {
    const res = await fetch(`https://api.nextdns.io${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0].detail);
    return json.data;
  }

  // Step 1: Create the destination profile
  const createRes = await fetch('https://api.nextdns.io/profiles', {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: newName }),
  });
  const createJson = await createRes.json();
  if (createJson.errors) throw new Error(createJson.errors[0].detail);
  const destId = createJson.data.id;
  console.log(`Created profile: ${destId}`);

  // Step 2: Copy nested objects (PATCH)
  const [security, privacy, parentalControl, settings] = await Promise.all([
    get(`/profiles/${sourceId}/security`),
    get(`/profiles/${sourceId}/privacy`),
    get(`/profiles/${sourceId}/parentalControl`),
    get(`/profiles/${sourceId}/settings`),
  ]);

  // Copy scalar fields; strip nested arrays (handled separately below)
  await patch(`/profiles/${destId}/security`, {
    threatIntelligenceFeeds: security.threatIntelligenceFeeds,
    aiThreatDetection: security.aiThreatDetection,
    googleSafeBrowsing: security.googleSafeBrowsing,
    cryptojacking: security.cryptojacking,
    dnsRebinding: security.dnsRebinding,
    idnHomographs: security.idnHomographs,
    typosquatting: security.typosquatting,
    dga: security.dga,
    nrd: security.nrd,
    ddns: security.ddns,
    parking: security.parking,
    csam: security.csam,
  });

  await patch(`/profiles/${destId}/privacy`, {
    disguisedTrackers: privacy.disguisedTrackers,
    allowAffiliate: privacy.allowAffiliate,
  });

  await patch(`/profiles/${destId}/parentalControl`, {
    safeSearch: parentalControl.safeSearch,
    youtubeRestrictedMode: parentalControl.youtubeRestrictedMode,
    blockBypass: parentalControl.blockBypass,
  });

  await patch(`/profiles/${destId}/settings`, settings);

  // Step 3: Copy nested arrays (PUT replaces entire array)
  const [tlds, blocklists, natives, services, categories, denylist, allowlist, rewrites] =
    await Promise.all([
      get(`/profiles/${sourceId}/security/tlds`),
      get(`/profiles/${sourceId}/privacy/blocklists`),
      get(`/profiles/${sourceId}/privacy/natives`),
      get(`/profiles/${sourceId}/parentalControl/services`),
      get(`/profiles/${sourceId}/parentalControl/categories`),
      get(`/profiles/${sourceId}/denylist`),
      get(`/profiles/${sourceId}/allowlist`),
      get(`/profiles/${sourceId}/rewrites`),
    ]);

  await Promise.all([
    tlds.length && put(`/profiles/${destId}/security/tlds`, tlds),
    blocklists.length && put(`/profiles/${destId}/privacy/blocklists`, blocklists),
    natives.length && put(`/profiles/${destId}/privacy/natives`, natives),
    services.length && put(`/profiles/${destId}/parentalControl/services`, services),
    categories.length && put(`/profiles/${destId}/parentalControl/categories`, categories),
    denylist.length && put(`/profiles/${destId}/denylist`, denylist),
    allowlist.length && put(`/profiles/${destId}/allowlist`, allowlist),
  ]);

  // Rewrites use POST individually (no PUT endpoint)
  for (const rewrite of rewrites) {
    await fetch(`https://api.nextdns.io/profiles/${destId}/rewrites`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: rewrite.name, content: rewrite.content }),
    });
  }

  console.log(`Profile "${newName}" (${destId}) cloned from ${sourceId}`);
  return destId;
}

// Usage
const newId = await copyProfile('abc123', 'Home Network (Copy)', 'YOUR_API_KEY');
```

### Backup a profile to JSON

```javascript
// ✅ Export profile settings to a JSON file for backup
async function backupProfile(profileId, apiKey) {
  const headers = { 'X-Api-Key': apiKey };
  const get = async (path) => {
    const res = await fetch(`https://api.nextdns.io${path}`, { headers });
    return (await res.json()).data;
  };

  const backup = {
    exportedAt: new Date().toISOString(),
    sourceId: profileId,
    security: await get(`/profiles/${profileId}/security`),
    'security/tlds': await get(`/profiles/${profileId}/security/tlds`),
    privacy: await get(`/profiles/${profileId}/privacy`),
    'privacy/blocklists': await get(`/profiles/${profileId}/privacy/blocklists`),
    'privacy/natives': await get(`/profiles/${profileId}/privacy/natives`),
    parentalControl: await get(`/profiles/${profileId}/parentalControl`),
    'parentalControl/services': await get(`/profiles/${profileId}/parentalControl/services`),
    'parentalControl/categories': await get(`/profiles/${profileId}/parentalControl/categories`),
    settings: await get(`/profiles/${profileId}/settings`),
    denylist: await get(`/profiles/${profileId}/denylist`),
    allowlist: await get(`/profiles/${profileId}/allowlist`),
    rewrites: await get(`/profiles/${profileId}/rewrites`),
  };

  return JSON.stringify(backup, null, 2);
}
```

## Do NOT Use

```javascript
// ❌ Trying to copy a profile via a single request — no such endpoint exists
await fetch('https://api.nextdns.io/profiles/abc123/copy', { method: 'POST' }); // ❌ 404

// ❌ Skipping array endpoints — blocklists and denylist are separate from the main object
await patch(`/profiles/${destId}`, securityObject);
// ❌ This does not copy tlds[], blocklists[], denylist[], or rewrites[]

// ❌ Using POST for arrays — use PUT to replace the whole array atomically
await fetch(`/profiles/${destId}/privacy/blocklists`, {
  method: 'POST',           // ❌ POST adds one item; use PUT to copy all items at once
  body: JSON.stringify(allBlocklists),
});
```

## Best practices

- **Always create the destination profile first**: Several nested endpoints return 404 if the
  profile ID does not exist yet.
- **Use `PUT` for array endpoints when copying**: `PUT` replaces the entire array in one request,
  whereas `POST` would require looping through each item individually.
- **Copy rewrites one at a time**: The rewrites endpoint has no `PUT` — POST each rewrite
  individually.
- **Save the backup JSON before copying**: Run `backupProfile` before modifying the source to
  ensure you can restore if needed.
- **Add a suffix to the copy name**: Naming the copy `"[Source] (Copy)"` prevents confusion in the
  dashboard.

## Troubleshooting

### Issue: destination profile is missing blocklists after copy

**Symptoms**: Security and privacy scalar settings copied correctly but the blocklist table is empty.

**Solution**: Confirm you ran the `PUT /profiles/{destId}/privacy/blocklists` step and that the
source blocklists array was not empty before calling PUT.

```javascript
const blocklists = await get(`/profiles/${sourceId}/privacy/blocklists`);
console.log('Source blocklists:', blocklists); // Verify non-empty before PUT
```

### Issue: rewrites not copied

**Solution**: The `/rewrites` endpoint requires individual POST calls — there is no bulk PUT.
Verify the loop in Step 3 iterates over the rewrites array correctly.

## Reference

- [NextDNS API — Profiles](https://nextdns.github.io/api/#profiles)
- [NextDNS API — Nested Objects](https://nextdns.github.io/api/#nested-objects-and-arrays)
- [NextDNS API — Rewrites](https://nextdns.github.io/api/#rewrites)
