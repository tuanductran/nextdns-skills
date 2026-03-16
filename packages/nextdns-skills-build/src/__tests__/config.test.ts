import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEFAULT_SKILL, SKILLS, SKILLS_DIR } from '../config.js';

describe('SKILLS registry', () => {
  it('defines all five expected skills', () => {
    const keys = Object.keys(SKILLS);
    expect(keys).toContain('nextdns-api');
    expect(keys).toContain('nextdns-cli');
    expect(keys).toContain('nextdns-ui');
    expect(keys).toContain('integrations');
    expect(keys).toContain('nextdns-frontend');
    expect(keys).toHaveLength(5);
  });

  it('each skill has required fields', () => {
    for (const [key, config] of Object.entries(SKILLS)) {
      expect(config.name, `${key}.name`).toBe(key);
      expect(config.title, `${key}.title`).toBeTruthy();
      expect(config.description, `${key}.description`).toBeTruthy();
      expect(config.skillDir, `${key}.skillDir`).toBeTruthy();
      expect(config.rulesDir, `${key}.rulesDir`).toBeTruthy();
      expect(config.metadataFile, `${key}.metadataFile`).toBeTruthy();
      expect(config.outputFile, `${key}.outputFile`).toBeTruthy();
      expect(config.sectionMap, `${key}.sectionMap`).toBeTruthy();
    }
  });

  it('each skill rulesDir is a subdirectory of skillDir', () => {
    for (const [key, config] of Object.entries(SKILLS)) {
      expect(
        config.rulesDir.startsWith(config.skillDir),
        `${key}.rulesDir should be under skillDir`
      ).toBe(true);
    }
  });

  it('non-frontend skills have capability and efficiency sections', () => {
    const nonFrontend = ['nextdns-api', 'nextdns-cli', 'nextdns-ui', 'integrations'];
    for (const key of nonFrontend) {
      const { sectionMap } = SKILLS[key];
      expect(sectionMap['capability'], `${key} capability section`).toBe(1);
      expect(sectionMap['efficiency'], `${key} efficiency section`).toBe(2);
    }
  });

  it('nextdns-frontend has framework sections', () => {
    const { sectionMap } = SKILLS['nextdns-frontend'];
    expect(sectionMap['nuxt']).toBe(1);
    expect(sectionMap['nextjs']).toBe(2);
    expect(sectionMap['astro']).toBe(3);
    expect(sectionMap['sveltekit']).toBe(4);
    expect(sectionMap['react-router']).toBe(5);
  });

  it('outputFile ends with AGENTS.md for every skill', () => {
    for (const [key, config] of Object.entries(SKILLS)) {
      expect(
        config.outputFile.endsWith('AGENTS.md'),
        `${key}.outputFile should end with AGENTS.md`
      ).toBe(true);
    }
  });

  it('metadataFile ends with metadata.json for every skill', () => {
    for (const [key, config] of Object.entries(SKILLS)) {
      expect(
        config.metadataFile.endsWith('metadata.json'),
        `${key}.metadataFile should end with metadata.json`
      ).toBe(true);
    }
  });
});

describe('DEFAULT_SKILL', () => {
  it('is nextdns-api', () => {
    expect(DEFAULT_SKILL).toBe('nextdns-api');
  });

  it('exists in SKILLS registry', () => {
    expect(SKILLS[DEFAULT_SKILL]).toBeDefined();
  });
});

describe('SKILLS_DIR', () => {
  it('points to a directory that exists on disk', () => {
    expect(fs.existsSync(SKILLS_DIR)).toBe(true);
  });

  it('is an absolute path', () => {
    expect(path.isAbsolute(SKILLS_DIR)).toBe(true);
  });

  it('contains expected skill subdirectories', () => {
    const entries = fs.readdirSync(SKILLS_DIR);
    expect(entries).toContain('nextdns-api');
    expect(entries).toContain('nextdns-cli');
    expect(entries).toContain('nextdns-frontend');
  });
});
