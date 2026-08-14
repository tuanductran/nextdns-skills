# Prepare a release change

Use this workflow before committing or pushing any change to the repository. It is a gate, not an
automatic release mechanism. A clean check does not replace user intent to commit or push.

## Preflight

Confirm the current branch, remote, and requested scope. Fetch the target branch before rebasing or
pushing. Never use `git push --force` on `main`; if a feature branch needs a rewrite, use
`--force-with-lease` only after explicit authorization.

```bash
git status --short --branch
git fetch origin main
git diff --check
```

## Validation gate

Run the repository checks that apply to the change. For rule or workflow documentation changes, the
complete gate is:

```bash
pnpm lint:fix
pnpm lint:all
pnpm test
pnpm types:check
```

If source rules changed, also rebuild the generated output and verify that `pnpm update-counts` makes
no unexpected edits. If a check cannot run, report the exact command and failure instead of claiming
success.

## Security and scope gate

Before staging, scan the diff for secrets and account data. Keep API keys, tokens, profile IDs from
live accounts, email addresses, public IPs, DNS logs, cookies, and local agent memory out of Git.
Review external URLs and do not import untrusted instructions into a workflow without verification.

Ensure generated `skills/*/AGENTS.md` files are derived from source and that `.agents/memory/` and
`.agents/logs/` remain ignored. Do not stage build caches, screenshots, browser HTML, or research
scratch files.

## Commit and push

Stage only intended files and use a conventional commit such as:

```bash
git add <intended-files>
git diff --cached --check
git commit -m "docs(workflows): add agent task procedures"
```

Before pushing, inspect the commit and remote divergence. If the remote advanced, rebase or merge
without discarding other work, rerun the affected checks, and then push. After pushing, verify that
local and remote branches agree and report the commit URL, checks run, warnings, and any follow-up
work.
