---
title: Allowlist and Denylist
impact: HIGH
impactDescription: Manage domain allowlists and denylists for custom filtering
type: capability
tags: allowlist, denylist, whitelist, blacklist, domain blocking, domain allowing
---

# Allowlist and Denylist

**Impact: HIGH** - Manage custom domain allow/deny lists

## Configuration

```javascript
const lists = {
  // Denylist (block these domains)
  denylist: [
    { id: "badwebsite.com", active: true },
    { id: "pornhub.com", active: false },      // In list but not active
    { id: "ads.example.com", active: true }
  ],
  
  // Allowlist (always allow these domains)
  allowlist: [
    { id: "goodwebsite.com", active: true },
    { id: "nytimes.com", active: false },      // In list but not active
    { id: "work-app.company.com", active: true }
  ]
};
```bash

## Add Domain to Denylist

```javascript
// Block a domain
await fetch('https://api.nextdns.io/profiles/abc123/denylist', {
  method: 'POST',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ 
    id: "malicious-site.com",
    active: true 
  })
});
```bash

## Add Domain to Allowlist

```javascript
// Always allow a domain (bypass all blocking)
await fetch('https://api.nextdns.io/profiles/abc123/allowlist', {
  method: 'POST',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ 
    id: "trusted-site.com",
    active: true 
  })
});
```bash

## Update Domain Status

```javascript
// Temporarily disable a denylist entry without removing it
await fetch('https://api.nextdns.io/profiles/abc123/denylist/badwebsite.com', {
  method: 'PATCH',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ active: false })
});

// Re-enable it later
await fetch('https://api.nextdns.io/profiles/abc123/denylist/badwebsite.com', {
  method: 'PATCH',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ active: true })
});
```bash

## Remove Domain

```javascript
// Remove from denylist
await fetch('https://api.nextdns.io/profiles/abc123/denylist/badwebsite.com', {
  method: 'DELETE',
  headers: { 'X-API-Key': 'YOUR_API_KEY' }
});

// Remove from allowlist
await fetch('https://api.nextdns.io/profiles/abc123/allowlist/goodwebsite.com', {
  method: 'DELETE',
  headers: { 'X-API-Key': 'YOUR_API_KEY' }
});
```bash

## Get All Entries

```javascript
// Get denylist
const denylist = await fetch('https://api.nextdns.io/profiles/abc123/denylist', {
  headers: { 'X-API-Key': 'YOUR_API_KEY' }
}).then(r => r.json());

// Get allowlist
const allowlist = await fetch('https://api.nextdns.io/profiles/abc123/allowlist', {
  headers: { 'X-API-Key': 'YOUR_API_KEY' }
}).then(r => r.json());
```bash

## Domain Format

Domains can include:

```javascript
// Exact domain
{ id: "example.com", active: true }

// Subdomain
{ id: "ads.example.com", active: true }

// Wildcard (blocks all subdomains)
{ id: "*.ads-network.com", active: true }
```bash

## Use Cases

### Denylist Use Cases

- Block specific malicious domains not in blocklists
- Block distracting websites (social media during work hours)
- Block specific ad servers
- Block tracking domains

### Allowlist Use Cases

- Unblock false positives from blocklists
- Allow work-critical domains that might be blocked
- Allow specific services needed by apps
- Override parental controls for specific trusted sites

## Priority

Allowlist has **higher priority** than denylist and all other blocking rules:

```text
Allowlist > Denylist > Parental Control > Privacy > Security
```bash

## Error Handling

```javascript
try {
  const response = await fetch('https://api.nextdns.io/profiles/abc123/denylist', {
    method: 'POST',
    headers: {
      'X-API-Key': 'YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: "invalid domain!", active: true })
  });
  
  const result = await response.json();
  
  if (result.errors) {
    // Handle validation errors
    console.error('Invalid domain:', result.errors);
  }
} catch (error) {
  console.error('Request failed:', error);
}
```bash

## Do NOT Use

```javascript
// ❌ Using array of strings
{
  denylist: ["bad1.com", "bad2.com"]
}

// ❌ Using "blocked" or "allowed" properties
{
  denylist: [
    { id: "bad.com", blocked: true } // ❌
  ]
}

// ✅ Correct format
{
  denylist: [
    { id: "bad.com", active: true }
  ],
  allowlist: [
    { id: "good.com", active: true }
  ]
}
```bash

## Reference

- [NextDNS Allowlist/Denylist](https://help.nextdns.io/t/g9hmv0k/what-is-the-allowlist-and-denylist)
