# Patches

This directory contains patches applied to npm dependencies to fix compatibility issues or bugs that
have not yet been fixed upstream.

## Current Patches

### eslint-plugin-case-police@2.1.1

**Issue:** The plugin uses the deprecated `context.getFilename()` method which was removed in ESLint
v10.

**Fix:** Replace `context.getFilename()` with the new `context.filename` property.

**Changes:**

- Line 118: `context.getFilename()` → `context.filename`

**Upstream Status:** This is a breaking change introduced in ESLint v10.0.0 where
`context.getFilename()` method was removed in favor of the `context.filename` property. This patch
can be removed once the plugin is updated to support ESLint v10.

**Related:**

- ESLint v10.0.0 deprecated `context.getFilename()` in favor of `context.filename`
