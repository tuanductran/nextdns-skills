/**
 * Configuration for the build tooling
 */

import { join } from 'node:path';

import { getRepositoryRoot } from './paths.js';

// Base paths
export const REPO_ROOT = getRepositoryRoot(import.meta.url);
export const SKILLS_DIR = join(REPO_ROOT, 'skills');
export const BUILD_DIR = join(REPO_ROOT, 'packages/nextdns-skills-build');

// Skill configurations
export interface SkillConfig {
  name: string;
  title: string;
  description: string;
  skillDir: string;
  rulesDir: string;
  metadataFile: string;
  outputFile: string;
  sectionMap: Record<string, number>;
}

export const SKILLS: Record<string, SkillConfig> = {
  'nextdns-api': {
    name: 'nextdns-api',
    title: 'NextDNS API Skills',
    description: 'NextDNS API integration and management',
    skillDir: join(SKILLS_DIR, 'nextdns-api'),
    rulesDir: join(SKILLS_DIR, 'nextdns-api/rules'),
    metadataFile: join(SKILLS_DIR, 'nextdns-api/metadata.json'),
    outputFile: join(SKILLS_DIR, 'nextdns-api/AGENTS.md'),
    sectionMap: { capability: 1, efficiency: 2 },
  },
  'nextdns-cli': {
    name: 'nextdns-cli',
    title: 'NextDNS CLI Skills',
    description: 'NextDNS CLI deployment and system configuration',
    skillDir: join(SKILLS_DIR, 'nextdns-cli'),
    rulesDir: join(SKILLS_DIR, 'nextdns-cli/rules'),
    metadataFile: join(SKILLS_DIR, 'nextdns-cli/metadata.json'),
    outputFile: join(SKILLS_DIR, 'nextdns-cli/AGENTS.md'),
    sectionMap: { capability: 1, efficiency: 2 },
  },
  'nextdns-ui': {
    name: 'nextdns-ui',
    title: 'NextDNS UI Skills',
    description: 'NextDNS Web UI configuration and dashboard management',
    skillDir: join(SKILLS_DIR, 'nextdns-ui'),
    rulesDir: join(SKILLS_DIR, 'nextdns-ui/rules'),
    metadataFile: join(SKILLS_DIR, 'nextdns-ui/metadata.json'),
    outputFile: join(SKILLS_DIR, 'nextdns-ui/AGENTS.md'),
    sectionMap: { capability: 1, efficiency: 2 },
  },
  integrations: {
    name: 'integrations',
    title: 'NextDNS Integrations',
    description: 'NextDNS third-party platform integrations',
    skillDir: join(SKILLS_DIR, 'integrations'),
    rulesDir: join(SKILLS_DIR, 'integrations/rules'),
    metadataFile: join(SKILLS_DIR, 'integrations/metadata.json'),
    outputFile: join(SKILLS_DIR, 'integrations/AGENTS.md'),
    sectionMap: { capability: 1, efficiency: 2 },
  },
  'nextdns-frontend': {
    name: 'nextdns-frontend',
    title: 'NextDNS Frontend Skills',
    description:
      'NextDNS frontend dashboard integration with Nuxt, Next.js, Astro, SvelteKit, and React Router',
    skillDir: join(SKILLS_DIR, 'nextdns-frontend'),
    rulesDir: join(SKILLS_DIR, 'nextdns-frontend/rules'),
    metadataFile: join(SKILLS_DIR, 'nextdns-frontend/metadata.json'),
    outputFile: join(SKILLS_DIR, 'nextdns-frontend/AGENTS.md'),
    sectionMap: { nuxt: 1, nextjs: 2, astro: 3, sveltekit: 4, 'react-router': 5 },
  },
};

// Default skill
export const DEFAULT_SKILL = 'nextdns-api';

// Test cases are build artifacts, not part of the skill
export const TEST_CASES_FILE = join(BUILD_DIR, 'test-cases.json');
