---
title: Error Handling
impact: HIGH
impactDescription: Handle API errors and validation responses correctly
type: capability
tags: error handling, validation, 400 error, error format, error response
---

# Error Handling

**Impact: HIGH** - Properly handle API errors and validation failures

## Error Response Formats

The API uses two different error response patterns:

### 1. Client Errors (400 Bad Request)

Invalid requests return `400` status with errors array:

```javascript
// Response: 400 Bad Request
{
  "errors": [
    {
      "code": "invalid",
      "detail": "\"HeLlO\" is not an integer.",
      "source": {
        "parameter": "limit"  // For query parameters
      }
    }
  ]
}
```

### 2. User Errors (200 OK)

Business logic errors return `200` status with errors array:

```javascript
// Response: 200 OK
{
  "errors": [
    {
      "code": "invalid_domain",
      "detail": "Invalid domain format",
      "source": {
        "pointer": "/denylist/0/id"  // JSON pointer to error location
      }
    }
  ]
}
```

## Error Object Structure

```typescript
interface Error {
  code: string;           // Error code (e.g., "invalid", "duplicate")
  detail: string;         // Human-readable error message
  source: {
    parameter?: string;   // Query parameter name (for 400 errors)
    pointer?: string;     // JSON pointer (for 200 errors)
  };
}
```

## Common Error Codes

| Code | Description | Example |
|------|-------------|---------|
| `invalid` | Invalid parameter value | Wrong type, out of range |
| `required` | Missing required parameter | Missing API key, missing field |
| `invalid_domain` | Invalid domain format | Malformed domain name |
| `duplicate` | Duplicate entry | Domain already in list |
| `not_found` | Resource not found | Profile doesn't exist |
| `rate_limit` | Rate limit exceeded | Too many requests |

## Handling Errors

```javascript
async function makeApiRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'X-API-Key': process.env.NEXTDNS_API_KEY,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    const data = await response.json();

    // Check for errors in response
    if (data.errors) {
      throw new ApiError(data.errors, response.status);
    }

    // Check for HTTP errors
    if (!response.ok) {
      throw new HttpError(response.status, response.statusText);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      // Handle API validation errors
      console.error('API Errors:', error.errors);
      error.errors.forEach(err => {
        console.error(`- ${err.code}: ${err.detail}`);
        if (err.source.parameter) {
          console.error(`  Parameter: ${err.source.parameter}`);
        }
        if (err.source.pointer) {
          console.error(`  Location: ${err.source.pointer}`);
        }
      });
    } else if (error instanceof HttpError) {
      // Handle HTTP errors
      console.error(`HTTP Error ${error.status}: ${error.message}`);
    } else {
      // Handle network errors
      console.error('Network Error:', error);
    }
    throw error;
  }
}

class ApiError extends Error {
  constructor(errors, status) {
    super('API Error');
    this.errors = errors;
    this.status = status;
  }
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
```

## Validation Examples

### Invalid Query Parameter

```javascript
// Request
const response = await fetch(
  'https://api.nextdns.io/profiles/abc123/analytics/status?limit=invalid',
  { headers: { 'X-API-Key': 'YOUR_API_KEY' } }
);

// Response: 400 Bad Request
{
  "errors": [
    {
      "code": "invalid",
      "detail": "\"invalid\" is not an integer.",
      "source": {
        "parameter": "limit"
      }
    }
  ]
}
```

### Invalid Domain

```javascript
// Request
await fetch('https://api.nextdns.io/profiles/abc123/denylist', {
  method: 'POST',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ id: 'invalid domain!', active: true })
});

// Response: 200 OK (user error)
{
  "errors": [
    {
      "code": "invalid_domain",
      "detail": "Invalid domain format",
      "source": {
        "pointer": "/id"
      }
    }
  ]
}
```

### Duplicate Entry

```javascript
// Adding domain that already exists
await fetch('https://api.nextdns.io/profiles/abc123/denylist', {
  method: 'POST',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ id: 'existing.com', active: true })
});

// Response: 200 OK
{
  "errors": [
    {
      "code": "duplicate",
      "detail": "Domain already exists in denylist",
      "source": {
        "pointer": "/id"
      }
    }
  ]
}
```

## Comprehensive Error Handler

```javascript
async function nextdnsApi(endpoint, options = {}) {
  const url = `https://api.nextdns.io${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'X-API-Key': process.env.NEXTDNS_API_KEY,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const data = await response.json();

  // Handle errors
  if (data.errors) {
    const errorMessages = data.errors.map(err => {
      let msg = `[${err.code}] ${err.detail}`;
      if (err.source.parameter) {
        msg += ` (parameter: ${err.source.parameter})`;
      }
      if (err.source.pointer) {
        msg += ` (location: ${err.source.pointer})`;
      }
      return msg;
    });

    throw new Error(`NextDNS API Error:\n${errorMessages.join('\n')}`);
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return data;
}

// Usage
try {
  const data = await nextdnsApi('/profiles/abc123/denylist', {
    method: 'POST',
    body: JSON.stringify({ id: 'bad.com', active: true })
  });
  console.log('Success:', data);
} catch (error) {
  console.error('Error:', error.message);
}
```

## Retry Logic

```javascript
async function nextdnsApiWithRetry(endpoint, options = {}, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await nextdnsApi(endpoint, options);
    } catch (error) {
      lastError = error;
      
      // Don't retry on validation errors (400, or 200 with errors)
      if (error.message.includes('API Error')) {
        throw error;
      }
      
      // Retry on network errors or 5xx errors
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}
```

## Do NOT Use

```javascript
// ❌ Only checking response.ok
if (!response.ok) {
  throw new Error('Request failed');
}
// User errors return 200 OK!

// ❌ Not checking for errors in response body
const data = await response.json();
return data;  // Might contain errors!

// ✅ Correct
const data = await response.json();
if (data.errors) {
  throw new ApiError(data.errors);
}
if (!response.ok) {
  throw new HttpError(response.status);
}
return data;
```

## Best Practices

1. **Always check for `errors` in response** even on 200 OK
2. **Check HTTP status** for network/server errors
3. **Parse error details** for user-friendly messages
4. **Don't retry validation errors** (they won't succeed)
5. **Implement exponential backoff** for retries
6. **Log errors** with full context for debugging
7. **Handle rate limiting** with appropriate delays

## Reference

- [NextDNS API - Error Handling](https://nextdns.github.io/api/#handling-errors)
