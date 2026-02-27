---
title: 'Error Handling'
impact: MEDIUM
impactDescription:
  'Unhandled API errors silently fail or show raw JSON to users, breaking the UI feedback loop'
type: capability
tags:
  - error handling
  - error page
  - astro actions
  - api errors
  - react island
---

<!-- @case-police-ignore Api -->

# Error handling

Map NextDNS API errors to user-friendly Astro pages and React island notifications

## Overview

The NextDNS API returns errors in two formats:

- **HTTP 4xx/5xx** with `{ "errors": [...] }` — validation or auth errors.
- **HTTP 200 OK** with `{ "errors": [...] }` — user-level errors (for example, duplicate profile name).

Both must be handled. Astro API endpoints should return typed error responses, and React islands
should surface them inline or via toast-style notifications.

## Correct usage

### API endpoint — return typed errors

```typescript
// ✅ src/pages/api/profiles.ts — wrap nextdnsFetch with error translation
import type { APIRoute } from 'astro';
import { nextdnsFetch } from '../../lib/nextdns';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const data = await nextdnsFetch('/profiles', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

### Lib/nextdns.ts — check both HTTP errors and 200-with-errors

```typescript
// ✅ src/lib/nextdns.ts — error-aware fetcher
export async function nextdnsFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const apiKey = import.meta.env.NEXTDNS_API_KEY;
  if (!apiKey) throw new Error('NEXTDNS_API_KEY is not set');

  const res = await fetch(`https://api.nextdns.io${path}`, {
    ...options,
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });

  const json = await res.json();

  // Both 4xx and 200 responses may contain errors
  if (json.errors?.length) {
    const first = json.errors[0];
    throw new Error(first.detail ?? first.code ?? 'NextDNS API error');
  }

  return json as T;
}
```

### React island — inline error feedback

```tsx
// ✅ src/components/react/CreateProfileForm.tsx
import { useState } from 'react';

export default function CreateProfileForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: formData.get('name') }),
    });

    if (!res.ok) {
      const { error: message } = await res.json();
      setError(message ?? 'Failed to create profile');
      return;
    }

    setSuccess(true);
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Profile name" required />
      <button type="submit">Create</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Profile created!</p>}
    </form>
  );
}
```

### Astro error page — 404 and 500

```astro
---
// ✅ src/pages/404.astro
---
<html>
  <body>
    <h1>404 — Page Not Found</h1>
    <a href="/">Go home</a>
  </body>
</html>
```

```astro
---
// ✅ src/pages/500.astro (requires output: 'server' or 'hybrid')
const { error } = Astro.props
---
<html>
  <body>
    <h1>500 — Server Error</h1>
    <p>Something went wrong. Please try again later.</p>
  </body>
</html>
```

### Astro page — handle API errors in frontmatter

```astro
---
// ✅ src/pages/profiles/[id].astro — redirect on 404
import { nextdnsFetch } from '../../lib/nextdns'

const { id } = Astro.params

let profile
try {
  const res = await nextdnsFetch<{ data: { id: string; name: string } }>(`/profiles/${id}`)
  profile = res.data
} catch {
  return Astro.redirect('/404')
}
---

<html>
  <body>
    <h1>{profile.name}</h1>
  </body>
</html>
```

## Do NOT Use

```typescript
// ❌ Checking only HTTP status — NextDNS also returns errors in 200 responses
if (!res.ok) throw new Error('error'); // ❌ Misses 200-with-errors case

// ❌ Swallowing errors silently
try {
  await fetch('/api/profiles', { method: 'DELETE' });
} catch {
  // ❌ User gets no feedback
}

// ❌ Exposing raw error objects from nextdnsFetch to the browser response
return new Response(JSON.stringify(err), { status: 500 }); // ❌ May leak internal details
```

## Best practices

- **Check `json.errors` before checking `res.ok`**: The NextDNS API can return user errors inside a
  200 response — `res.ok` is insufficient.
- **Return `{ error: message }` JSON from endpoints**: Consistent error shape lets React islands
  always read `const { error } = await res.json()`.
- **Use `Astro.redirect` for page-level 404s**: When a profile does not exist, redirect to the 404
  page rather than rendering an empty page.
- **Log server-side errors**: Use `console.error` in API endpoints to capture upstream failures
  without exposing details to the browser.

## Troubleshooting

### Issue: error from API endpoint NOT reaching the React island

**Solution**: Ensure the API endpoint returns a JSON body and sets `Content-Type: application/json`
on the error response. Check the status code in the React component:

```typescript
if (!res.ok) {
  const { error } = await res.json();
  setError(error ?? 'Unknown error');
}
```

### Issue: Astro frontmatter throws but the error page doesn't show

**Solution**: Uncaught errors in Astro frontmatter are surfaced as 500 errors. Use a `try/catch`
block and call `return Astro.redirect('/404')` or `return Astro.redirect('/500')` for handled
errors.

## Reference

- [Astro — Error Pages](https://docs.astro.build/en/basics/astro-pages/#custom-404-error-page)
- [Astro — Endpoints](https://docs.astro.build/en/guides/endpoints/)
- [NextDNS API — Handling Errors](https://nextdns.github.io/api/#handling-errors)
