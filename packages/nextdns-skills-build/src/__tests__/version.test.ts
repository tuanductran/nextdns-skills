import { describe, expect, it } from 'vite-plus/test';

import { getPackageVersion } from '../core/version.js';

describe('getPackageVersion', () => {
  it('returns a semantic package version', () => {
    expect(getPackageVersion()).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
