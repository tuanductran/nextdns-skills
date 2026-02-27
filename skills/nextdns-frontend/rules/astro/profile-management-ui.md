---
title: 'Profile Management UI'
impact: MEDIUM
impactDescription:
  'Mounting React components without client directives renders them as static HTML with no
  interactivity, silently breaking delete and update flows'
type: capability
tags:
  - profile
  - crud
  - astro
  - react island
  - client directive
  - hydration
---

<!-- @case-police-ignore Api -->

# Profile management UI

Build profile list, create, update, and delete flows using Astro pages and React islands

## Overview

In Astro, page data is fetched in the `.astro` frontmatter (server-side, synchronous). React
components handle interactivity as **islands** — hydrated selectively with `client:*` directives.
Mutations (create, update, delete) are triggered from React components via Astro API endpoints.

## Correct usage

### API endpoints

```typescript
// ✅ src/pages/api/profiles.ts
import type { APIRoute } from 'astro';
import { nextdnsFetch } from '../../lib/nextdns';

export const prerender = false;

export const GET: APIRoute = async () => {
  const data = await nextdnsFetch('/profiles');
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const data = await nextdnsFetch('/profiles', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return new Response(JSON.stringify(data), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

```typescript
// ✅ src/pages/api/profiles/[id].ts
import type { APIRoute } from 'astro';
import { nextdnsFetch } from '../../../lib/nextdns';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const data = await nextdnsFetch(`/profiles/${params.id}`);
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PATCH: APIRoute = async ({ params, request }) => {
  const body = await request.json();
  const data = await nextdnsFetch(`/profiles/${params.id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ params }) => {
  await nextdnsFetch(`/profiles/${params.id}`, { method: 'DELETE' });
  return new Response(null, { status: 204 });
};
```

### Astro page — server-rendered profile list

```astro
---
// ✅ src/pages/index.astro — frontmatter runs on the server
import { nextdnsFetch } from '../lib/nextdns'
import ProfileActions from '../components/react/ProfileActions'
import type { NextDNSProfile } from '../types/nextdns'

const { data: profiles } = await nextdnsFetch<{ data: NextDNSProfile[] }>('/profiles')
---

<html>
  <body>
    <h1>Profiles</h1>
    <ul>
      {profiles.map((profile) => (
        <li>
          {profile.name} ({profile.id})
          <!-- client:load hydrates the React component in the browser -->
          <ProfileActions client:load profileId={profile.id} />
        </li>
      ))}
    </ul>
  </body>
</html>
```

### React island — profile actions

```tsx
// ✅ src/components/react/ProfileActions.tsx
import { useState } from 'react';

interface Props {
  profileId: string;
}

export default function ProfileActions({ profileId }: Props) {
  const [deleted, setDeleted] = useState(false);

  async function handleDelete() {
    const res = await fetch(`/api/profiles/${profileId}`, { method: 'DELETE' });
    if (res.ok) {
      setDeleted(true);
      window.location.reload(); // Reload to re-fetch server-rendered list
    }
  }

  if (deleted) return null;

  return (
    <button onClick={handleDelete} style={{ color: 'red' }}>
      Delete
    </button>
  );
}
```

### Astro page — profile detail

```astro
---
// ✅ src/pages/profiles/[id].astro
import { nextdnsFetch } from '../../lib/nextdns'
import type { NextDNSProfile } from '../../types/nextdns'

const { id } = Astro.params
const { data: profile } = await nextdnsFetch<{ data: NextDNSProfile }>(`/profiles/${id}`)
---

<html>
  <body>
    <h1>{profile.name}</h1>
    <pre>{JSON.stringify(profile, null, 2)}</pre>
  </body>
</html>
```

## Do NOT Use

```astro
---
// ❌ No client directive — React component renders as static HTML, buttons are unresponsive
---
<ProfileActions profileId={profile.id} />

// ❌ Fetching from api.nextdns.io inside a React component
// src/components/react/Profiles.tsx
useEffect(() => {
  fetch('https://api.nextdns.io/profiles', {
    headers: { 'X-Api-Key': import.meta.env.PUBLIC_NEXTDNS_API_KEY }, // ❌ Key exposed
  })
}, [])
```

## Best practices

- **Choose the right `client:*` directive**: Use `client:load` for above-the-fold interactive
  elements. Use `client:visible` for components lower on the page to defer JS loading.
- **Prefer `window.location.reload()` after mutations**: Astro pages are server-rendered, so
  reloading re-fetches fresh data from the server without a client-side router.
- **Keep React islands small**: Astro's island architecture is most efficient when React components
  handle only the interactive parts — let `.astro` handle the static markup.

## Troubleshooting

### Issue: delete button has no effect when clicked

**Solution**: Ensure the React component has a `client:load` (or similar) directive in the `.astro`
template. Without it, the component is static HTML and click handlers are never attached.

### Issue: profile list doesn't update after mutation without page reload

**Solution**: Astro pages are server-rendered. After a mutation, call `window.location.reload()` or
navigate programmatically to re-run the frontmatter data fetch.

## Reference

- [Astro — Framework Components](https://docs.astro.build/en/guides/framework-components/)
- [Astro — Client Directives](https://docs.astro.build/en/reference/directives-reference/#client-directives)
- [Astro — Endpoints](https://docs.astro.build/en/guides/endpoints/)
- [NextDNS API — Profiles](https://nextdns.github.io/api/#profiles)
