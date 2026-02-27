---
title: 'Profile Management UI (React Router v7)'
impact: MEDIUM
impactDescription:
  'Using clientLoader instead of loader for API-key-protected data fetches the key on the browser
  and exposes it via DevTools network requests'
type: capability
tags:
  - profile
  - crud
  - loader
  - action
  - react router
  - server data loading
---

<!-- @case-police-ignore Api -->

# Profile management UI React router v7)

Build NextDNS profile list, create, update, and delete flows using React Router v7 `loader` and
`action` functions

## Overview

React Router v7 uses `loader` (server-side data fetching) and `action` (server-side mutations) in
route modules. All NextDNS API calls must go through `loader`/`action` because they run only on the
server and have access to `process.env.NEXTDNS_API_KEY`. The component receives `loaderData` as a
prop automatically typed by the framework.

## Correct usage

### Profile list route with loader

```typescript
// ✅ app/routes/profiles.tsx
import { Form, Link } from 'react-router';
import { nextdnsFetch } from '~/lib/nextdns.server';
import type { Route } from './+types/profiles';

interface Profile {
  id: string;
  name: string;
}

export async function loader(_: Route.LoaderArgs) {
  const data = await nextdnsFetch<{ data: Profile[] }>('/profiles');
  return { profiles: data.data };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = form.get('intent');

  if (intent === 'delete') {
    const id = form.get('id') as string;
    await nextdnsFetch(`/profiles/${id}`, { method: 'DELETE' });
    return null;
  }

  if (intent === 'create') {
    const name = form.get('name') as string;
    if (!name?.trim()) {
      return { error: 'Profile name is required' };
    }
    await nextdnsFetch('/profiles', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    return null;
  }
}

export default function ProfilesPage({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <div>
      <h1>Profiles</h1>

      {actionData?.error && <p className="error">{actionData.error}</p>}

      <Form method="post">
        <input name="name" placeholder="New profile name" required />
        <button name="intent" value="create" type="submit">
          Create
        </button>
      </Form>

      <ul>
        {loaderData.profiles.map((profile) => (
          <li key={profile.id}>
            <Link to={`/profiles/${profile.id}`}>{profile.name}</Link>
            <Form method="post" style={{ display: 'inline' }}>
              <input type="hidden" name="id" value={profile.id} />
              <button name="intent" value="delete" type="submit">
                Delete
              </button>
            </Form>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Individual profile route

```typescript
// ✅ app/routes/profiles.$id.tsx
import { Form } from 'react-router';
import { nextdnsFetch } from '~/lib/nextdns.server';
import type { Route } from './+types/profiles.$id';

export async function loader({ params }: Route.LoaderArgs) {
  const profile = await nextdnsFetch<{ data: { id: string; name: string } }>(
    `/profiles/${params.id}`,
  );
  return { profile: profile.data };
}

export default function ProfilePage({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1>{loaderData.profile.name}</h1>
      <p>ID: {loaderData.profile.id}</p>
    </div>
  );
}
```

## Do NOT Use

```typescript
// ❌ Never use clientLoader for NextDNS API calls — runs in the browser
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const res = await fetch(`https://api.nextdns.io/profiles/${params.id}`, {
    headers: { 'X-Api-Key': import.meta.env.VITE_NEXTDNS_API_KEY }, // ❌ Key exposed
  });
  return res.json();
}
```

## Best practices

- **`loader` for GET, `action` for mutations**: This is the React Router v7 convention. `loader`
  runs on GET requests; `action` handles POST, PATCH, DELETE, PUT form submissions.
- **`Form` component over `fetch`**: Use the `<Form>` component from `react-router` for mutations —
  it progressively enhances and triggers `action` on submit.
- **Intent pattern**: A single `action` can handle multiple operations using a hidden `intent` field
  — avoids creating separate routes for each mutation.
- **Typed props**: Use `Route.ComponentProps`, `Route.LoaderArgs`, `Route.ActionArgs` from
  `./+types/<route-name>` for full type safety.

## Troubleshooting

### Issue: `loaderdata` is `undefined` after form submission

**Symptoms**: Component re-renders but `loaderData` is empty after the `action` runs.

**Solution**: React Router automatically re-runs the `loader` after an `action` completes
(revalidation). Ensure your `action` returns `null` or a valid object — throwing an error prevents
revalidation.

## Reference

- [React Router v7 — Data Loading](https://reactrouter.com/start/framework/data-loading)
- [React Router v7 — Actions](https://reactrouter.com/start/framework/actions)
- [NextDNS API — Profiles](https://nextdns.github.io/api/#profiles)
