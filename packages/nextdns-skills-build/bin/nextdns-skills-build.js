#!/usr/bin/env node
// Static entrypoint, checked into git — never built/generated.
//
// Because this file always exists on disk, pnpm can create the
// node_modules/.bin symlink for it during `pnpm install` regardless of
// whether `dist/` has been built yet. The actual CLI logic lives in
// dist/cli.mjs (built by tsdown) and is only required when the command
// actually runs — same pattern Vite itself uses for bin/vite.js.
import '../dist/cli.mjs';
