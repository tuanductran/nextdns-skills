---
title: 'Privacy Settings'
impact: HIGH
impactDescription: 'Configure privacy blocklists and native tracking protection'
type: capability
tags:
  - privacy
  - blocklists
  - native tracking
  - disguised trackers
  - affiliate links
---

<!-- @case-police-ignore Api -->

# Privacy settings

Configure privacy protection and ad/tracker blocking

## Privacy configuration

```javascript
const privacySettings = {
  privacy: {
    // Ad and tracker blocklists
    blocklists: [
      { id: 'nextdns-recommended' }, // NextDNS curated list
      { id: 'oisd' }, // OISD blocklist
      { id: 'energized' }, // Energized Protection
      { id: 'adguard' }, // AdGuard DNS filter
    ],

    // Native tracking protection
    natives: [
      { id: 'huawei' }, // Block Huawei tracking
      { id: 'samsung' }, // Block Samsung tracking
      { id: 'apple' }, // Block Apple tracking
      { id: 'windows' }, // Block Windows tracking
      { id: 'xiaomi' }, // Block Xiaomi tracking
      { id: 'alexa' }, // Block Amazon Alexa tracking
      { id: 'roku' }, // Block Roku tracking
      { id: 'sonos' }, // Block Sonos tracking
    ],

    // Advanced privacy features
    disguisedTrackers: true, // Block CNAME-cloaked trackers
    allowAffiliate: false, // Block affiliate & tracking links
  },
};
```

## Update privacy settings

```javascript
await fetch('https://api.nextdns.io/profiles/abc123/privacy', {
  method: 'PATCH',
  headers: {
    'X-Api-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    disguisedTrackers: true,
    allowAffiliate: false,
  }),
});
```

## Manage blocklists

Add or remove blocklists:

```javascript
// Add a blocklist
await fetch('https://api.nextdns.io/profiles/abc123/privacy/blocklists', {
  method: 'POST',
  headers: {
    'X-Api-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ id: 'stevenblack' }),
});

// Remove a blocklist
await fetch('https://api.nextdns.io/profiles/abc123/privacy/blocklists/stevenblack', {
  method: 'DELETE',
  headers: { 'X-Api-Key': 'YOUR_API_KEY' },
});
```

## Manage native tracking protection

```javascript
// Add native tracking protection
await fetch('https://api.nextdns.io/profiles/abc123/privacy/natives', {
  method: 'POST',
  headers: {
    'X-Api-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ id: 'apple' }),
});

// Remove native tracking protection
await fetch('https://api.nextdns.io/profiles/abc123/privacy/natives/apple', {
  method: 'DELETE',
  headers: { 'X-Api-Key': 'YOUR_API_KEY' },
});
```

## Popular blocklists

| Blocklist ID          | Description                         |
| --------------------- | ----------------------------------- |
| `nextdns-recommended` | NextDNS curated ads and trackers list |
| `oisd`                | OISD Big List (comprehensive)       |
| `energized`           | Energized Protection                |
| `adguard`             | AdGuard DNS filter                  |
| `stevenblack`         | Steven Black's unified hosts        |
| `1hosts-lite`         | 1Hosts (Lite)                       |
| `easylist`            | EasyList                            |
| `easyprivacy`         | EasyPrivacy                         |

## Native tracking platforms

| Platform ID | Description                  |
| ----------- | ---------------------------- |
| `apple`     | Apple telemetry and tracking |
| `huawei`    | Huawei telemetry             |
| `samsung`   | Samsung telemetry            |
| `windows`   | Windows telemetry            |
| `xiaomi`    | Xiaomi telemetry             |
| `alexa`     | Amazon Alexa                 |
| `roku`      | Roku tracking                |
| `sonos`     | Sonos telemetry              |

## Privacy features explained

- **Blocklists**: Curated lists of known ad and tracker domains
- **Native Tracking**: Block built-in telemetry from device manufacturers
- **Disguised Trackers**: Block CNAME-cloaked trackers that bypass traditional blocklists
- **Allow Affiliate**: When disabled, blocks affiliate and tracking parameters from URLs

## Do NOT Use

```javascript
// ❌ Using array of strings instead of objects
{
  privacy: {
    blocklists: ['nextdns-recommended', 'oisd']; // ❌
  }
}

// ✅ Correct format
{
  privacy: {
    blocklists: [{ id: 'nextdns-recommended' }, { id: 'oisd' }];
  }
}
```

## Reference

- [NextDNS API - Profile Settings](https://nextdns.github.io/api/#profile)
