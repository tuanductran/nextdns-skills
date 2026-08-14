# Research and update NextDNS guidance

Use this workflow when a rule needs current product behavior, a newly discovered endpoint, a dashboard
setting, or a platform-specific setup detail. Research is evidence gathering; it does not authorize
account mutations or publication by itself.

## Procedure

1. Read the root and nearest `AGENTS.md` files, then identify the exact claim that needs evidence.
   State whether the intended result is a new rule, a correction, or a scoped addition.
2. Search broadly first, then narrow to authoritative sources. Prefer the NextDNS API documentation,
   `nextdns/nextdns` wiki, NextDNS Help Center, and official dashboard instructions. Use secondary
   sources only to discover leads, not as the sole basis for product guarantees.
3. Open the source pages and verify the full relevant section. Record the URL, the claim it supports,
   the date or version context when available, and any uncertainty. Do not rely on search-result
   snippets alone.
4. Separate facts, recommendations, and observations in the draft. Dashboard observations must be
   labeled as UI observations and must not be generalized into an API contract without an official
   source.
5. Sanitize all notes before they enter the repository. Replace live values with `YOUR_API_KEY`,
   `abc123`, `example.com`, `192.0.2.10`, or another documentation placeholder. Never copy email
   addresses, profile IDs, public IPs, DNS logs, cookies, tokens, or device names from a live account.
6. Update only the canonical source rule or manifest. Do not copy large external documents into the
   repository. Keep the rule concise and link to the official source in its `Reference` section.
7. Add troubleshooting for stale or conflicting behavior. If a feature is beta, community-reported,
   account-specific, or not confirmed by an official source, label it clearly and avoid promising it.
8. Run link and content checks, then use `review-change.md` and `release-check.md` before delivery.

## Source hierarchy

| Priority | Source | Use |
| :---: | :--- | :--- |
| 1 | Official NextDNS API documentation | Endpoint behavior, request/response shape, parameters |
| 1 | Official NextDNS CLI wiki | CLI flags, platform support, daemon behavior |
| 1 | NextDNS Help Center | Setup choices, protocol behavior, user-facing limitations |
| 1 | Authenticated `my.nextdns.io` dashboard | Read-only UI labels and account-scoped setup examples, only with user authorization |
| 2 | Official NextDNS repositories or release notes | Implementation details and version context |
| 3 | Community discussions and third-party guides | Discovery and troubleshooting leads; verify before asserting |

## Stop conditions

Stop and ask the user if the source requires credentials that are not available, the source conflicts
with another official source, the requested behavior would modify an account, or the evidence cannot
support a safe and precise rule.
