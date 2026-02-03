---
title: "Nested Endpoints"
impact: HIGH
impactDescription: "Work with nested objects and arrays in profile configuration"
type: capability
tags: "nested objects, child endpoints, PATCH, DELETE, PUT, POST"
---
# Nested Endpoints

**Impact: HIGH** - Understand how to work with nested profile configuration

## Nested Structure

Profile configuration has nested objects and arrays:

```javascript
{
  "security": {              // Nested object
    "cryptojacking": true,
    "tlds": [...]            // Nested array
  },
  "privacy": {               // Nested object
    "blocklists": [...],     // Nested array
    "natives": [...]         // Nested array
  },
  "denylist": [...],         // Top-level array
  "settings": {              // Nested object
    "logs": {                // Deeply nested object
      "enabled": true
    }
  }
}
```

## Child Endpoints

All nested objects and arrays have their own API endpoints:

```text
/profiles/:profile                           # Full profile
/profiles/:profile/security                  # Nested object
/profiles/:profile/security/tlds             # Nested array
/profiles/:profile/privacy                   # Nested object
/profiles/:profile/privacy/blocklists        # Nested array
/profiles/:profile/settings                  # Nested object
/profiles/:profile/settings/performance      # Deeply nested object
/profiles/:profile/denylist                  # Top-level array
```

## HTTP Methods by Endpoint Type

### Object Endpoints

Nested objects support `GET` and `PATCH`:

```javascript
// GET nested object
const security = await fetch(
  'https://api.nextdns.io/profiles/abc123/security',
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
).then(r => r.json());

// PATCH nested object
await fetch('https://api.nextdns.io/profiles/abc123/security', {
  method: 'PATCH',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    cryptojacking: true,
    typosquatting: true
  })
});
```

### Array Endpoints

Nested arrays support `GET`, `POST`, and `PUT`:

```javascript
// GET array
const blocklists = await fetch(
  'https://api.nextdns.io/profiles/abc123/privacy/blocklists',
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
).then(r => r.json());

// POST to add item
await fetch('https://api.nextdns.io/profiles/abc123/privacy/blocklists', {
  method: 'POST',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ id: 'stevenblack' })
});

// PUT to replace entire array
await fetch('https://api.nextdns.io/profiles/abc123/privacy/blocklists', {
  method: 'PUT',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify([
    { id: 'nextdns-recommended' },
    { id: 'oisd' }
  ])
});
```

### Array Item Endpoints

Individual array items support `PATCH` and `DELETE`:

```javascript
// PATCH array item (update)
await fetch('https://api.nextdns.io/profiles/abc123/denylist/badsite.com', {
  method: 'PATCH',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ active: false })
});

// DELETE array item (remove)
await fetch('https://api.nextdns.io/profiles/abc123/denylist/badsite.com', {
  method: 'DELETE',
  headers: { 'X-API-Key': 'YOUR_API_KEY' }
});
```

## Using First Key as ID

For array items, use the first key as the ID in the URL:

```javascript
// Array item
{
  "id": "badsite.com",
  "active": true
}

// URL uses the id value
/profiles/abc123/denylist/badsite.com

// Another example
{
  "id": "tiktok",
  "active": true
}

// URL
/profiles/abc123/parentalControl/services/tiktok
```

## Complete Examples

### Update Security Settings

```javascript
// Update specific security settings
await fetch('https://api.nextdns.io/profiles/abc123/security', {
  method: 'PATCH',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    cryptojacking: true,
    dnsRebinding: true,
    typosquatting: true
  })
});
```

### Manage TLDs

```javascript
// Add TLD to block
await fetch('https://api.nextdns.io/profiles/abc123/security/tlds', {
  method: 'POST',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ id: 'xyz' })
});

// Remove TLD
await fetch('https://api.nextdns.io/profiles/abc123/security/tlds/xyz', {
  method: 'DELETE',
  headers: { 'X-API-Key': 'YOUR_API_KEY' }
});

// Replace all TLDs
await fetch('https://api.nextdns.io/profiles/abc123/security/tlds', {
  method: 'PUT',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify([
    { id: 'ru' },
    { id: 'cn' },
    { id: 'tk' }
  ])
});
```

### Update Performance Settings

```javascript
// Update deeply nested settings
await fetch('https://api.nextdns.io/profiles/abc123/settings/performance', {
  method: 'PATCH',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ecs: true,
    cacheBoost: true,
    cnameFlattening: true
  })
});
```

### Manage Parental Control Services

```javascript
// Add service
await fetch('https://api.nextdns.io/profiles/abc123/parentalControl/services', {
  method: 'POST',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ id: 'tiktok', active: true })
});

// Toggle service
await fetch('https://api.nextdns.io/profiles/abc123/parentalControl/services/tiktok', {
  method: 'PATCH',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ active: false })
});

// Remove service
await fetch('https://api.nextdns.io/profiles/abc123/parentalControl/services/tiktok', {
  method: 'DELETE',
  headers: { 'X-API-Key': 'YOUR_API_KEY' }
});
```

## Endpoint Patterns

| Endpoint Type | GET | POST | PUT | PATCH | DELETE |
|---------------|-----|------|-----|-------|--------|
| Profile | ✅ | ✅ | ❌ | ✅ | ✅ |
| Nested Object | ✅ | ❌ | ❌ | ✅ | ❌ |
| Nested Array | ✅ | ✅ | ✅ | ❌ | ❌ |
| Array Item | ❌ | ❌ | ❌ | ✅ | ✅ |

## Do NOT Use

```javascript
// ❌ Using PUT on object endpoints
await fetch('https://api.nextdns.io/profiles/abc123/security', {
  method: 'PUT',  // Not supported, use PATCH
  body: JSON.stringify({ cryptojacking: true })
});

// ❌ Using PATCH on array endpoints
await fetch('https://api.nextdns.io/profiles/abc123/privacy/blocklists', {
  method: 'PATCH',  // Not supported, use POST or PUT
  body: JSON.stringify({ id: 'oisd' })
});

// ❌ Using POST on array items
await fetch('https://api.nextdns.io/profiles/abc123/denylist/bad.com', {
  method: 'POST',  // Not supported, use PATCH
  body: JSON.stringify({ active: false })
});

// ❌ Wrong ID format in URL
await fetch('https://api.nextdns.io/profiles/abc123/denylist/0', {
  // Use domain name, not array index
  method: 'DELETE'
});

// ✅ Correct
await fetch('https://api.nextdns.io/profiles/abc123/denylist/bad.com', {
  method: 'DELETE'
});
```

## Helper Class

```javascript
class NextDNSProfile {
  constructor(profileId, apiKey) {
    this.profileId = profileId;
    this.apiKey = apiKey;
    this.baseUrl = `https://api.nextdns.io/profiles/${profileId}`;
  }

  async get(path = '') {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: { 'X-API-Key': this.apiKey }
    });
    return response.json();
  }

  async patch(path, data) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'PATCH',
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async post(path, data) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async put(path, data) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async delete(path) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: { 'X-API-Key': this.apiKey }
    });
    return response.json();
  }
}

// Usage
const profile = new NextDNSProfile('abc123', process.env.NEXTDNS_API_KEY);

// Get security settings
const security = await profile.get('/security');

// Update security
await profile.patch('/security', { cryptojacking: true });

// Add to denylist
await profile.post('/denylist', { id: 'bad.com', active: true });

// Remove from denylist
await profile.delete('/denylist/bad.com');
```

## Reference

- [NextDNS API - Nested Objects and Arrays](https://nextdns.github.io/api/#nested-objects-and-arrays)
