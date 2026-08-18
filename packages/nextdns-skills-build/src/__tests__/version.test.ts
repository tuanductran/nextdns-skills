import { describe, expect, it } from 'vitest';

import { getPackageVersion } from '../version.js';

describe('getPackageVersion', () => {
  it('returns a semantic package version', () => {
    expect(getPackageVersion()).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
