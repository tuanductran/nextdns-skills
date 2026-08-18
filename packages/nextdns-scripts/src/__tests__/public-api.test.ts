import { describe, expect, it } from 'vite-plus/test';

import {
  AuditCheckSchema,
  AuditReportSchema,
  PackageMetadataSchema,
  parseAuditReport,
  parsePackageMetadata,
  parseStatsReport,
  SkillStatsSchema,
  StatsReportSchema,
} from '../index.js';

describe('maintenance package public schema API', () => {
  it('exports all Valibot schema objects from the package root', () => {
    expect(AuditCheckSchema).toBeDefined();
    expect(AuditReportSchema).toBeDefined();
    expect(SkillStatsSchema).toBeDefined();
    expect(StatsReportSchema).toBeDefined();
    expect(PackageMetadataSchema).toBeDefined();
  });

  it('exports callable report parsers from the package root', () => {
    expect(typeof parseAuditReport).toBe('function');
    expect(typeof parseStatsReport).toBe('function');
    expect(typeof parsePackageMetadata).toBe('function');
  });
});
