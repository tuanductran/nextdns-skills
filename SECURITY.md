# Security policy

## Scope

This repository contains Markdown-based AI agent skills, build tooling, validation scripts, schemas, and public project documentation. It must not contain live credentials, API keys, profile identifiers from a real account, email addresses, public IP addresses, DNS logs, cookies, browser session data, or private screenshots.

## Report a vulnerability

Do not publish credentials, exploit details, private logs, or account data in an issue, pull request, rule, workflow, or documentation example. Use GitHub's private security reporting channel for this repository when the issue concerns a repository vulnerability, dependency, workflow permission, or release artifact. If private reporting is unavailable, open a minimal public issue containing only a non-sensitive description and request a private follow-up; never include the secret or a working exploit.

For a NextDNS service, API, account, or dashboard vulnerability, report it through the appropriate official NextDNS support or security channel rather than placing private service details in this repository. This project cannot grant access to or change a user's NextDNS account.

## Safe examples

Use `YOUR_API_KEY`, `abc123`, `example.com`, and `192.0.2.10` in examples. Generalize dashboard observations and remove profile URLs, domains, timestamps, IP addresses, log rows, cookies, and screenshots that identify an account.

## Maintainer response

Maintainers should acknowledge a report, reproduce it without exposing private data, limit discussion to the minimum necessary scope, and document the remediation in a release note or changelog when the fix is public. Do not merge a remediation that adds a secret to fixtures, logs, snapshots, generated output, or documentation.

## Review checklist

| Check | Question |
| :--- | :--- |
| Secrets | Does the diff contain API keys, tokens, credentials, or serialized browser state? |
| Account data | Does it contain live profile IDs, private domains, DNS logs, email addresses, or public IP addresses? |
| CI permissions | Does a workflow request more permission or untrusted execution than necessary? |
| Dependencies | Does a dependency change have a reviewed lockfile and a passing test suite? |
| Documentation | Are security claims supported by an official source or clearly labeled as proposals? |
