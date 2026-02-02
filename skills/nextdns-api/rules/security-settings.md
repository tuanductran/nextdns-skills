---
title: "Security Settings"
impact: "HIGH"
impactDescription: "Configure threat protection and security features"
type: "capability"
tags: "security, threat intelligence, cryptojacking, DNS rebinding, typosquatting, DGA, NRD, CSAM"
---
# Security Settings

**Impact: HIGH** - Configure comprehensive security features for DNS filtering

## Security Configuration

```javascript
const securitySettings = {
  security: {
    // Threat Intelligence
    threatIntelligenceFeeds: true,
    aiThreatDetection: true,
    googleSafeBrowsing: true,
    
    // Malicious Activity Protection
    cryptojacking: true,        // Block cryptojacking domains
    dnsRebinding: true,          // Prevent DNS rebinding attacks
    idnHomographs: true,         // Block IDN homograph attacks
    typosquatting: true,         // Block typosquatting domains
    dga: true,                   // Block Domain Generation Algorithm domains
    nrd: true,                   // Block Newly Registered Domains
    ddns: true,                  // Block Dynamic DNS hostnames
    parking: true,               // Block parked domains
    csam: true,                  // Block Child Sexual Abuse Material
    
    // Block specific TLDs
    tlds: [
      { id: "ru" },              // Russia
      { id: "cn" },              // China
      { id: "cf" },              // Central African Republic (free domain)
      { id: "accountants" }      // Often used for phishing
    ]
  }
};
```

## Update Security Settings

PATCH to update security settings:

```javascript
await fetch('https://api.nextdns.io/profiles/abc123/security', {
  method: 'PATCH',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    cryptojacking: true,
    typosquatting: true,
    tlds: [
      { id: "tk" },
      { id: "ml" },
      { id: "ga" }
    ]
  })
});
```

## Add/Remove TLDs

Manage blocked TLDs via nested endpoint:

```javascript
// Add a TLD to blocklist
await fetch('https://api.nextdns.io/profiles/abc123/security/tlds', {
  method: 'POST',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ id: "xyz" })
});

// Remove a TLD
await fetch('https://api.nextdns.io/profiles/abc123/security/tlds/xyz', {
  method: 'DELETE',
  headers: { 'X-API-Key': 'YOUR_API_KEY' }
});
```

## Security Features Explained

| Feature | Description |
|---------|-------------|
| **Threat Intelligence Feeds** | Block domains from curated threat intelligence sources |
| **AI Threat Detection** | Use AI to detect and block emerging threats |
| **Google Safe Browsing** | Block phishing and malware sites via Google's database |
| **Cryptojacking** | Block cryptocurrency mining scripts |
| **DNS Rebinding** | Prevent attacks that bypass same-origin policy |
| **IDN Homographs** | Block domains using similar-looking characters (e.g., аpple.com with Cyrillic 'а') |
| **Typosquatting** | Block common typos of popular domains |
| **DGA** | Block algorithmically generated domains used by malware |
| **NRD** | Block newly registered domains (often used in attacks) |
| **DDNS** | Block dynamic DNS services often used by malware |
| **Parking** | Block parked domains with ads |
| **CSAM** | Block illegal content |

## Do NOT Use

```javascript
// ❌ Using string values instead of boolean
{
  security: {
    cryptojacking: "true" // ❌ Should be boolean
  }
}

// ❌ Invalid TLD format
{
  security: {
    tlds: ["ru", "cn"] // ❌ Should be objects with id property
  }
}

// ✅ Correct format
{
  security: {
    cryptojacking: true,
    tlds: [
      { id: "ru" },
      { id: "cn" }
    ]
  }
}
```

## Reference

- [NextDNS Security Features](https://help.nextdns.io/t/g9hmv0a/what-are-the-security-features)
- [TLD List](https://data.iana.org/TLD/tlds-alpha-by-domain.txt)
