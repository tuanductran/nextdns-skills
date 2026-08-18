import { describe, expect, it } from 'vite-plus/test';

import {
  BuildMetadataSchema,
  FrontmatterSchema,
  FrontmatterValueSchema,
  PackageMetadataSchema,
  parseBuildMetadata,
  parseFrontmatter,
  parsePackageMetadata,
} from '../index.js';

describe('build package public schema API', () => {
  it('exports all data schema objects from the package root', () => {
    expect(BuildMetadataSchema).toBeDefined();
    expect(FrontmatterSchema).toBeDefined();
    expect(FrontmatterValueSchema).toBeDefined();
    expect(PackageMetadataSchema).toBeDefined();
  });

  it('exports callable validated parsers from the package root', () => {
    expect(typeof parseBuildMetadata).toBe('function');
    expect(typeof parseFrontmatter).toBe('function');
    expect(typeof parsePackageMetadata).toBe('function');
  });
});
