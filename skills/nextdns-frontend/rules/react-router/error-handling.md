---
title: 'Error Handling (React Router v7)'
impact: MEDIUM
impactDescription:
  'Unhandled loader or action errors crash the entire page; React Router error boundaries and typed
  error responses must be used to isolate failures'
type: efficiency
tags:
  - error handling
  - error boundary
  - ErrorBoundary
  - loader errors
  - action errors
  - api errors
---

<!-- @case-police-ignore Api -->

# Error handling React router v7)

Map NextDNS API errors to React Router v7 error boundaries and inline component feedback

## Overview

React Router v7 provides two error-handling mechanisms:

1. **`ErrorBoundary` export** in a route module — catches errors thrown by `loader` or `action` and
   renders a fallback UI. In Framework Mode, `ErrorBoundary` receives `error` as a typed prop via
   `Route.ErrorBoundaryProps`.
2. **Returning error data** from `action` — returns a typed object (no throw) for inline form
   validation errors, available as `actionData` in the component.

Throw errors in `loader` for unrecoverable failures. Return error objects from `action` for
recoverable validation failures.

## Correct usage

### Route-level error boundary (framework mode)

```typescript
// ✅ app/routes/profiles.$id.tsx
import { data, isRouteErrorResponse } from 'react-router';
import { nextdnsFetch } from '~/lib/nextdns.server';
import type { Route } from './+types/profiles.$id';

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const result = await nextdnsFetch<{ data: { id: string; name: string } }>(
      `/profiles/${params.id}`,
    );
    return { profile: result.data };
  } catch (err) {
    const message = (err as Error).message;

    if (message.includes('404')) {
      // Use data() to throw typed responses with status codes
      throw data('Profile not found', { status: 404 });
    }
    if (message.includes('401')) {
      throw data('Invalid API key', { status: 401 });
    }
    throw data('Upstream error', { status: 502 });
  }
}

// In Framework Mode, ErrorBoundary receives error as a typed prop (not useRouteError hook)
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status}: {error.statusText}
        </h1>
        <p>{error.data}</p>
        <a href="/profiles">Back to profiles</a>
      </div>
    );
  }

  return (
    <div>
      <h1>Unexpected Error</h1>
      <p>{(error as Error).message}</p>
    </div>
  );
}

export default function ProfilePage({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1>{loaderData.profile.name}</h1>
    </div>
  );
}
```

### Inline action error (form validation)

```typescript
// ✅ app/routes/profiles.tsx  (action returns error, does not throw)
export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const name = form.get('name') as string;

  if (!name?.trim()) {
    // Return (not throw) — renders as actionData in the component
    return { error: 'Profile name is required' };
  }

  try {
    await nextdnsFetch('/profiles', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    return null;
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export default function ProfilesPage({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <div>
      {actionData?.error && <p className="error">{actionData.error}</p>}
      {/* form... */}
    </div>
  );
}
```

### Root error boundary (catch-all)

```typescript
// ✅ app/root.tsx  (add ErrorBoundary to the root route)
import { isRouteErrorResponse, Links, Meta, Scripts } from 'react-router';
import type { Route } from './+types/root';

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <html>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>Something went wrong</h1>
        {isRouteErrorResponse(error) ? (
          <p>
            {error.status}: {error.data}
          </p>
        ) : (
          <p>{(error as Error).message}</p>
        )}
        <Scripts />
      </body>
    </html>
  );
}
```

## Do NOT Use

```typescript
// ❌ Never swallow errors in loaders — the component will receive undefined loaderData
export async function loader({ params }: Route.LoaderArgs) {
  try {
    return await nextdnsFetch(`/profiles/${params.id}`);
  } catch {
    return null; // ❌ Component renders with null, no error UI shown
  }
}
```

```typescript
// ❌ Never throw from an action when you want inline validation errors
export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  if (!form.get('name')) {
    throw data('Name required', { status: 400 }); // ❌ Triggers ErrorBoundary, leaves the page
  }
}
```

```typescript
// ❌ In Framework Mode, do NOT use useRouteError() hook — use the typed prop instead
import { useRouteError } from 'react-router'; // ❌ Data Mode hook
export function ErrorBoundary() {
  const error = useRouteError(); // ❌ Use Route.ErrorBoundaryProps instead
}
```

## Best practices

- **`throw data()` in `loader`, return in `action`**: Thrown errors trigger `ErrorBoundary`;
  returned objects are available as `actionData` for inline feedback.
- **`isRouteErrorResponse`**: Use this helper to distinguish between `data()` throws and unexpected
  JavaScript errors in `ErrorBoundary`.
- **Nested error boundaries**: Each route segment can have its own `ErrorBoundary`, isolating
  failures to that segment without crashing the entire layout.
- **`Route.ErrorBoundaryProps`**: In Framework Mode, use the auto-generated type for the `error`
  prop instead of the `useRouteError()` hook (which is for Data Mode).

## Troubleshooting

### Issue: `errorboundary` NOT rendered — blank white page

**Symptoms**: Loader throws but the app shows a blank page instead of the error boundary.

**Solution**: Ensure `ErrorBoundary` is exported from the **same route module** as the `loader`, not
just from `root.tsx`.

### Issue: `actiondata` is `undefined` after form submission

**Solution**: Ensure the `action` returns a plain object (not `undefined`) on error. Returning
`null` is valid for success; returning `{ error: '...' }` gives `actionData` to the component.

## Reference

- [React Router v7 — Error Boundaries](https://reactrouter.com/how-to/error-boundary)
- [React Router v7 — Actions](https://reactrouter.com/start/framework/actions)
- [React Router v7 — `data()` utility](https://reactrouter.com/api/utils/data)
- [NextDNS API — Error Responses](https://nextdns.github.io/api/)
