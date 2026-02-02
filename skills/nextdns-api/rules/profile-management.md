---
title: "Profile Management"
impact: "HIGH"
impactDescription: "Create, read, update, and delete NextDNS profiles"
type: "capability"
tags: "profiles, CRUD, create profile, update profile, delete profile, settings"
---
# Profile Management

**Impact: HIGH** - Manage NextDNS profiles via API endpoints

## Create a New Profile

POST to `https://api.nextdns.io/profiles` with profile configuration:

```javascript
const profileData = {
  name: "My Home Network",
  security: {
    threatIntelligenceFeeds: true,
    aiThreatDetection: true,
    googleSafeBrowsing: true,
    cryptojacking: true,
    dnsRebinding: true,
    idnHomographs: true,
    typosquatting: true,
    dga: true,
    nrd: true,
    ddns: true,
    parking: true,
    csam: true,
    tlds: [
      { id: "ru" },
      { id: "cn" }
    ]
  },
  privacy: {
    blocklists: [
      { id: "nextdns-recommended" },
      { id: "oisd" }
    ],
    natives: [
      { id: "huawei" },
      { id: "samsung" }
    ],
    disguisedTrackers: true,
    allowAffiliate: true
  },
  settings: {
    logs: {
      enabled: true,
      drop: {
        ip: false,
        domain: false
      },
      retention: 7776000,
      location: "eu"
    },
    blockPage: {
      enabled: true
    },
    performance: {
      ecs: true,
      cacheBoost: false,
      cnameFlattening: true
    },
    web3: true
  }
};

const response = await fetch('https://api.nextdns.io/profiles', {
  method: 'POST',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(profileData)
});

const result = await response.json();
// { "data": { "id": "abc123" } }
```

## Get Profile

GET a specific profile:

```javascript
const response = await fetch('https://api.nextdns.io/profiles/abc123', {
  headers: { 'X-API-Key': 'YOUR_API_KEY' }
});

const profile = await response.json();
```

## Update Profile

PATCH to update specific fields:

```javascript
const updates = {
  name: "Updated Profile Name",
  security: {
    cryptojacking: false
  }
};

await fetch('https://api.nextdns.io/profiles/abc123', {
  method: 'PATCH',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(updates)
});
```

## Delete Profile

DELETE a profile:

```javascript
await fetch('https://api.nextdns.io/profiles/abc123', {
  method: 'DELETE',
  headers: { 'X-API-Key': 'YOUR_API_KEY' }
});
```

## Profile ID Usage

After creating a profile, use the returned `id` for all subsequent operations:

```javascript
const { data } = await createProfile(profileData);
const profileId = data.id; // "abc123"

// Use in analytics
const analytics = await fetch(
  `https://api.nextdns.io/profiles/${profileId}/analytics/status`,
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
);
```

## Do NOT Use

```javascript
// ❌ Using PUT instead of PATCH for partial updates
await fetch('https://api.nextdns.io/profiles/abc123', {
  method: 'PUT', // Wrong method
  body: JSON.stringify({ name: "New Name" })
});

// ❌ Forgetting to use the profile ID from creation response
const response = await createProfile(data);
// Don't hardcode or guess the ID
const wrongId = "myprofile"; // ❌
```

## Reference

- [NextDNS API - Profiles](https://nextdns.github.io/api/#profiles)
