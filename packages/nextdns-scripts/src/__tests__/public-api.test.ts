import { describe, expect, it } from 'vitest';

import {
  AuditCheckSchema,
  AuditReportSchema,
  parseAuditReport,
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
  });

  it('exports callable report parsers from the package root', () => {
    expect(typeof parseAuditReport).toBe('function');
    expect(typeof parseStatsReport).toBe('function');
  });
});
