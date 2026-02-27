---
title: 'DNS Rewrites'
impact: HIGH
impactDescription:
  'Incorrect rewrite payload returns 400 errors and custom DNS records fail to resolve'
type: capability
tags:
  - rewrites
  - dns records
  - custom dns
  - hostname override
  - cname
---

<!-- @case-police-ignore Api -->

# DNS rewrites

Manage custom DNS rewrite records via the NextDNS API

## Overview

DNS rewrites let you override DNS resolution for specific hostnames, mapping them to a custom IP
address or CNAME target. The `/profiles/{id}/rewrites` endpoint supports listing, creating, and
deleting rewrite records.

Common use cases:

- Point internal hostnames (for example, `nas.home`) to local IP addresses
- Block a specific hostname by returning `0.0.0.0`
- Create CNAME aliases for self-hosted services

## Correct usage

### List all rewrites

```javascript
// ✅ Retrieve all rewrite records for a profile
const response = await fetch('https://api.nextdns.io/profiles/abc123/rewrites', {
  headers: { 'X-Api-Key': 'YOUR_API_KEY' },
});

const { data } = await response.json();
// data: [{ "id": "abc123", "name": "nas.home", "content": "192.168.1.100" }]
```

### Add an a record IPv4

```javascript
// ✅ Map a hostname to an IPv4 address
await fetch('https://api.nextdns.io/profiles/abc123/rewrites', {
  method: 'POST',
  headers: {
    'X-Api-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'nas.home',
    content: '192.168.1.100',
  }),
});
```

### Add a CNAME alias

```javascript
// ✅ Point a subdomain to another hostname
await fetch('https://api.nextdns.io/profiles/abc123/rewrites', {
  method: 'POST',
  headers: {
    'X-Api-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'blog.example.com',
    content: 'myserver.example.com',
  }),
});
```

### Block a hostname via rewrite

```javascript
// ✅ Return zero address to effectively block a hostname
await fetch('https://api.nextdns.io/profiles/abc123/rewrites', {
  method: 'POST',
  headers: {
    'X-Api-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'tracker.example.com',
    content: '0.0.0.0',
  }),
});
```

### Delete a rewrite

```javascript
// ✅ Remove a rewrite using the id returned from GET or POST
const rewriteId = 'abc123';

await fetch(`https://api.nextdns.io/profiles/abc123/rewrites/${rewriteId}`, {
  method: 'DELETE',
  headers: { 'X-Api-Key': 'YOUR_API_KEY' },
});
```

## Do NOT Use

```javascript
// ❌ PATCH is not supported — delete and re-create to update a rewrite
await fetch('https://api.nextdns.io/profiles/abc123/rewrites/abc123', {
  method: 'PATCH',
  body: JSON.stringify({ content: '192.168.1.200' }),
});

// ❌ Omitting Content-Type on POST causes a 400 error
await fetch('https://api.nextdns.io/profiles/abc123/rewrites', {
  method: 'POST',
  headers: { 'X-Api-Key': 'YOUR_API_KEY' }, // Missing Content-Type
  body: JSON.stringify({ name: 'nas.home', content: '192.168.1.100' }),
});

// ❌ Using the hostname name instead of the numeric id for DELETE
await fetch('https://api.nextdns.io/profiles/abc123/rewrites/nas.home', {
  method: 'DELETE', // ❌ Use the id field from the GET/POST response
});
```

## Best practices

- **Store rewrite IDs**: Save the `id` from the POST response to enable programmatic deletion
  without a prior GET.
- **Re-create to update**: The rewrites endpoint has no PATCH support. To change a record, DELETE
  the old entry and POST a new one.
- **Avoid blocking via rewrites**: For blocking domains, prefer the denylist endpoint. Use rewrites
  only when you need a specific non-zero answer.
- **Use non-public TLDs for local names**: Suffixes like `.home` or `.lan` avoid conflicts with
  public DNS resolution.

## Troubleshooting

### Issue: post returns 400 bad request

**Symptoms**: `{"errors": {"name": "invalid"}}` or a generic validation error.

**Solution**: Ensure the `name` is a valid hostname and `Content-Type: application/json` is set.

```bash
# Verify JSON is well-formed
echo '{"name":"nas.home","content":"192.168.1.100"}' | python3 -m json.tool
```

### Issue: rewrite NOT taking effect

**Symptoms**: DNS still resolves to the original IP after creating the rewrite.

**Solution**: Confirm the rewrite was created by listing all rewrites, then flush local DNS cache.

```bash
# macOS
sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder

# Linux (systemd-resolved)
sudo resolvectl flush-caches

# Windows
ipconfig /flushdns
```

## Reference

- [NextDNS API — Rewrites](https://nextdns.github.io/api/#rewrites)
- [NextDNS Help Center](https://help.nextdns.io)
