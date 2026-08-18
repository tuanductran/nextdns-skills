import { describe, expect, it } from 'vite-plus/test';

import {
  BuildMetadataSchema,
  FrontmatterSchema,
  PackageMetadataSchema,
  parseBuildMetadata,
  parseFrontmatter,
  parsePackageMetadata,
} from '../core/data-schemas.js';
import { parseFrontmatter as parseMarkdownFrontmatter } from '../core/markdown.js';

const validBuildMetadata = {
  version: '1.2.3',
  organization: 'NextDNS Skills',
  date: '2026-08-18',
  abstract: 'Build metadata for the generated skills package.',
  references: [{ title: 'NextDNS API', url: 'https://api.nextdns.io' }],
};

describe('data schemas', () => {
  describe('FrontmatterSchema', () => {
    it('accepts scalar and string-array frontmatter values', () => {
      const frontmatter = parseFrontmatter({
        title: 'Authentication',
        tags: ['api', 'security'],
      });

      expect(frontmatter).toEqual({ title: 'Authentication', tags: ['api', 'security'] });
    });

    it('rejects non-string frontmatter values', () => {
      expect(() => parseFrontmatter({ tags: ['api', 1] })).toThrow();
      expect(() => parseFrontmatter({ count: 2 })).toThrow();
    });

    it('validates frontmatter produced by the markdown parser', () => {
      const frontmatter = parseMarkdownFrontmatter(`---
title: 'Authentication'
tags:
  - api
  - security
---

# Authentication
`);

      expect(FrontmatterSchema).toBeDefined();
      expect(frontmatter).toEqual({ title: 'Authentication', tags: ['api', 'security'] });
    });
  });

  describe('BuildMetadataSchema', () => {
    it('accepts complete build metadata with references', () => {
      const metadata = parseBuildMetadata(validBuildMetadata);

      expect(metadata.version).toBe('1.2.3');
      expect(metadata.references?.[0]?.url).toBe('https://api.nextdns.io');
    });

    it('accepts build metadata without optional references', () => {
      const { references, ...withoutReferences } = validBuildMetadata;

      expect(references).toBeDefined();
      expect(parseBuildMetadata(withoutReferences).organization).toBe('NextDNS Skills');
    });

    it('rejects missing required metadata fields', () => {
      const { abstract, ...withoutAbstract } = validBuildMetadata;

      expect(abstract).toBeDefined();
      expect(() => parseBuildMetadata(withoutAbstract)).toThrow();
    });

    it('rejects malformed metadata fields and references', () => {
      expect(() => parseBuildMetadata({ ...validBuildMetadata, version: 1 })).toThrow();
      expect(() =>
        parseBuildMetadata({
          ...validBuildMetadata,
          references: [{ title: 'NextDNS API', url: '' }],
        })
      ).toThrow();
    });
  });

  describe('PackageMetadataSchema', () => {
    it('accepts package metadata with or without a version', () => {
      expect(parsePackageMetadata({ version: '0.4.0' }).version).toBe('0.4.0');
      expect(parsePackageMetadata({})).toEqual({});
    });

    it('rejects malformed package metadata', () => {
      expect(() => parsePackageMetadata(null)).toThrow();
      expect(() => parsePackageMetadata({ version: 4 })).toThrow();
    });

    it('exposes the schema for runtime composition', () => {
      expect(BuildMetadataSchema).toBeDefined();
      expect(PackageMetadataSchema).toBeDefined();
    });
  });
});
