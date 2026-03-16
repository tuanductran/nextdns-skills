---
name: nextdns-frontend
description:
  Frontend integration for the NextDNS API using Nuxt 4, Next.js 15, Astro, SvelteKit, or React Router
  v7. This skill covers secure API key proxying via the BFF pattern, profile management UI,
  real-time SSE log streaming, analytics chart data preparation, and error handling. Use this skill
  when building a custom NextDNS dashboard or management interface with any popular full-stack
  framework. Triggers on tasks involving Nuxt, Vue, Next.js, Astro, React, SvelteKit, Svelte, React
  Router, Remix, NextDNS dashboard, DNS analytics UI, or log streaming.
license: MIT
metadata:
  author: tuanductran
  version: '1.0.0'
---

<!-- @case-police-ignore Api -->

# NextDNS frontend skills

Nuxt, Next.js, Astro, SvelteKit, and React Router v7 patterns for building a secure, full-featured
NextDNS management dashboard.

## Nuxt rules

Patterns for Nuxt 4 (Vue) projects.

| Rule                                                         | Keywords                                                          | Description                                          |
| ------------------------------------------------------------ | ----------------------------------------------------------------- | ---------------------------------------------------- |
| [api-proxy](rules/nuxt/api-proxy.md)                         | api key, bff, server route, proxy, runtimeConfig, security        | Proxy X-Api-Key through Nuxt server routes (BFF)     |
| [project-setup](rules/nuxt/project-setup.md)                 | nuxt, setup, nuxt.config, runtimeConfig, environment variables    | Bootstrap a Nuxt 4 project for NextDNS integration   |
| [profile-management-ui](rules/nuxt/profile-management-ui.md) | profile, crud, useFetch, composable, vue                          | Build profile list, create, update, and delete flows |
| [logs-streaming](rules/nuxt/logs-streaming.md)               | logs, streaming, sse, event source, real-time, server-sent events | Proxy and consume the NextDNS SSE log stream         |
| [analytics-charts](rules/nuxt/analytics-charts.md)           | analytics, charts, time series, dashboard, visualization          | Fetch and render analytics and time-series data      |
| [error-handling](rules/nuxt/error-handling.md)               | error handling, notifications, toast, createError, api errors     | Map NextDNS API errors to Nuxt UI notifications      |
| [tanstack-query](rules/nuxt/tanstack-query.md)               | tanstack query, vue query, cache, mutation, optimistic, infinite  | Advanced data fetching with Vue Query and cache invalidation |

## Next.js rules

Patterns for Next.js 15 (React) projects using the App Router.

| Rule                                                           | Keywords                                                         | Description                                            |
| -------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------ |
| [api-proxy](rules/nextjs/api-proxy.md)                         | api key, bff, route handler, proxy, process.env, security        | Proxy X-Api-Key through Next.js Route Handlers (BFF)   |
| [project-setup](rules/nextjs/project-setup.md)                 | next.js, setup, next.config, env vars, typescript, app router    | Bootstrap a Next.js 15 project for NextDNS integration |
| [profile-management-ui](rules/nextjs/profile-management-ui.md) | profile, crud, server component, react, fetch                    | Build profile list, create, update, and delete flows   |
| [logs-streaming](rules/nextjs/logs-streaming.md)               | logs, streaming, sse, readable stream, real-time, server-sent    | Proxy and consume the NextDNS SSE log stream           |
| [analytics-charts](rules/nextjs/analytics-charts.md)           | analytics, charts, time series, dashboard, server component      | Fetch and render analytics and time-series data        |
| [error-handling](rules/nextjs/error-handling.md)               | error handling, error boundary, next response, toast, api errors | Map NextDNS API errors to React/Next.js error UI       |
| [tanstack-query](rules/nextjs/tanstack-query.md)               | tanstack query v5, react query, hydration, prefetch, infinite    | Prefetch in Server Components and mutate in Client Components |

## Astro rules

Patterns for Astro (React islands) projects.

| Rule                                                          | Keywords                                                             | Description                                                |
| ------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------- |
| [api-proxy](rules/astro/api-proxy.md)                         | api key, bff, endpoint, proxy, import.meta.env, security             | Proxy X-Api-Key through Astro API endpoints (BFF)          |
| [project-setup](rules/astro/project-setup.md)                 | astro, setup, astro.config, ssr, adapter, react integration          | Bootstrap an Astro + React project for NextDNS integration |
| [profile-management-ui](rules/astro/profile-management-ui.md) | profile, crud, astro page, react island, client directive, hydration | Build profile list, create, update, and delete flows       |
| [logs-streaming](rules/astro/logs-streaming.md)               | logs, streaming, sse, readable stream, real-time, client:only        | Proxy and consume the NextDNS SSE log stream               |
| [analytics-charts](rules/astro/analytics-charts.md)           | analytics, charts, time series, dashboard, react island, swr         | Fetch and render analytics and time-series data            |
| [error-handling](rules/astro/error-handling.md)               | error handling, error page, astro actions, api errors, react island  | Map NextDNS API errors to Astro pages and React islands    |
| [server-islands](rules/astro/server-islands.md)               | server islands, server:defer, lazy load, performance, astro 5        | Lazy-load analytics panels with Astro 5 Server Islands     |

## SvelteKit rules

Patterns for SvelteKit (Svelte 5) projects.

| Rule                                                              | Keywords                                                           | Description                                               |
| ----------------------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------- |
| [api-proxy](rules/sveltekit/api-proxy.md)                         | api key, bff, +server.ts, proxy, $env/static/private, security     | Proxy X-Api-Key through SvelteKit +server.ts routes (BFF) |
| [project-setup](rules/sveltekit/project-setup.md)                 | sveltekit, setup, svelte.config, adapter, environment variables    | Bootstrap a SvelteKit project for NextDNS integration     |
| [profile-management-ui](rules/sveltekit/profile-management-ui.md) | profile, crud, load function, form actions, svelte, page.server.ts | Build profile list, create, update, and delete flows      |
| [logs-streaming](rules/sveltekit/logs-streaming.md)               | logs, streaming, sse, event source, real-time, readable stream     | Proxy and consume the NextDNS SSE log stream              |
| [analytics-charts](rules/sveltekit/analytics-charts.md)           | analytics, charts, time series, dashboard, visualization           | Fetch and render analytics and time-series data           |
| [error-handling](rules/sveltekit/error-handling.md)               | error handling, +error.svelte, error(), fail(), api errors         | Map NextDNS API errors to SvelteKit error boundaries      |
| [websocket-alternative](rules/sveltekit/websocket-alternative.md) | polling, long-polling, cloudflare, edge, sse fallback, interval    | Polling-based log fetching for platforms without SSE      |

## React router v7 rules

Patterns for React Router v7 (formerly Remix) projects.

| Rule                                                                 | Keywords                                                             | Description                                                 |
| -------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------- |
| [api-proxy](rules/react-router/api-proxy.md)                         | api key, bff, resource route, proxy, process.env, security           | Proxy X-Api-Key through React Router resource routes (BFF)  |
| [project-setup](rules/react-router/project-setup.md)                 | react router, setup, react-router.config, ssr, environment variables | Bootstrap a React Router v7 project for NextDNS integration |
| [profile-management-ui](rules/react-router/profile-management-ui.md) | profile, crud, loader, action, react, form                           | Build profile list, create, update, and delete flows        |
| [logs-streaming](rules/react-router/logs-streaming.md)               | logs, streaming, sse, resource route, readable stream, real-time     | Proxy and consume the NextDNS SSE log stream                |
| [analytics-charts](rules/react-router/analytics-charts.md)           | analytics, charts, time series, dashboard, loader, recharts          | Fetch and render analytics and time-series data             |
| [error-handling](rules/react-router/error-handling.md)               | error handling, ErrorBoundary, loader errors, action errors, api     | Map NextDNS API errors to React Router error boundaries     |
| [data-revalidation](rules/react-router/data-revalidation.md)         | shouldRevalidate, fetcher, defer, await, revalidation, performance   | Control loader revalidation and background mutations        |

## Related skills

- **nextdns-api**: REST endpoint reference — used by every server route in this skill.
- **nextdns-ui**: Web dashboard strategy — complements this skill for configuration best practices.

## Resources

- [Nuxt Documentation](https://nuxt.com/docs)
- [Nuxt UI Components](https://ui.nuxt.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Astro Documentation](https://docs.astro.build)
- [Astro React Integration](https://docs.astro.build/en/guides/integrations-guide/react/)
- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [React Router v7 Documentation](https://reactrouter.com/start/framework/installation)
- [NextDNS API Reference](https://nextdns.github.io/api/)
- [VueUse](https://vueuse.org)
- [TanStack Query](https://tanstack.com/query/latest)
