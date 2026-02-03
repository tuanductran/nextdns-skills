---
title: 'Authentication'
impact: HIGH
impactDescription: 'Authenticate all NextDNS API requests with API key'
type: capability
tags:
  - authentication
  - API key
  - X-Api-Key
  - authorization
  - security
---

# Authentication

All NextDNS API requests require authentication via API key

## Correct Usage

Pass your API key via the `X-Api-Key` header for every API call:

```bash
curl -H "X-Api-Key: a8f4e42e896ff37f181e3e8a42a9737e1423d8e7" \
  https://api.nextdns.io/profiles
```

```javascript
const headers = {
  'X-Api-Key': 'a8f4e42e896ff37f181e3e8a42a9737e1423d8e7',
  'Content-Type': 'application/json',
};

fetch('https://api.nextdns.io/profiles', { headers })
  .then((response) => response.json())
  .then((data) => console.log(data));
```

```python
import requests

headers = {
    'X-Api-Key': 'a8f4e42e896ff37f181e3e8a42a9737e1423d8e7'
}

response = requests.get('https://api.nextdns.io/profiles', headers=headers)
data = response.json()
```

## Finding Your API Key

💡 Find your API key at the bottom of your account page: <https://my.nextdns.io/account>

## Do NOT Use

```bash
# ❌ Missing authentication header
curl https://api.nextdns.io/profiles

# ❌ Using Authorization header instead of X-Api-Key
curl -H "Authorization: Bearer a8f4e42e896ff37f181e3e8a42a9737e1423d8e7" \
  https://api.nextdns.io/profiles

# ❌ Passing API key as query parameter
curl https://api.nextdns.io/profiles?api_key=a8f4e42e896ff37f181e3e8a42a9737e1423d8e7
```

## Security Best Practices

- Never commit API keys to version control
- Use environment variables to store API keys
- Rotate API keys periodically
- Use different API keys for different environments (dev, staging, production)

## Reference

- [NextDNS API - Authentication](https://nextdns.github.io/api/#authentication)
