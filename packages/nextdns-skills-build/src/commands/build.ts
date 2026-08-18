#!/usr/bin/env node
/**
 * Build script to compile individual rule files into AGENTS.md
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Section } from '../core/types.js';

import { parseBuildCliOptions, type BuildCliOptions } from '../core/cli-validation.js';
import { DEFAULT_SKILL, SKILLS, type SkillConfig } from '../core/config.js';
import { parseBuildMetadata, type BuildMetadata } from '../core/data-schemas.js';
import { parseRuleFile, type RuleFile } from '../core/parser.js';
import { collectRuleFiles } from '../core/utils.js';

/**
 * Increment a semver-style version string (e.g., "0.1.0" -> "0.1.1", "1.0" -> "1.1")
 */
function incrementVersion(version: string): string {
  const parts = version.split('.').map(Number);
  const last = parts[parts.length - 1];
  if (last !== undefined) parts[parts.length - 1] = last + 1;
  return parts.join('.');
}

/**
 * Generate markdown from rules
 */
function generateMarkdown(
  sections: Section[],
  metadata: BuildMetadata,
  skillConfig: SkillConfig
): string {
  let md = `# ${skillConfig.title}\n\n`;
  md += `**Version ${metadata.version}**  \n`;
  md += `${metadata.organization}  \n`;
  md += `${metadata.date}\n\n`;
  md += `> **Note:**  \n`;
  md += `> This document is mainly for agents and LLMs to follow when maintaining,  \n`;
  md += `> generating, or refactoring ${skillConfig.description}. Humans  \n`;
  md += `> may also find it useful, but guidance here is optimized for automation  \n`;
  md += `> and consistency by AI-assisted workflows.\n\n`;
  md += `---\n\n`;
  md += `## Abstract\n\n`;
  md += `${metadata.abstract}\n\n`;
  md += `---\n\n`;
  md += `## Table of Contents\n\n`;

  // Generate TOC
  sections.forEach((section) => {
    md += `${section.number}. [${section.title}](#${section.number}-${section.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')}) — **${section.impact}**\n`;
    section.rules.forEach((rule) => {
      // GitHub generates anchors from the full heading text: "1.1 Title" -> "#11-title"
      const anchor = `${rule.id} ${rule.title}`
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, ''); // Remove special characters except hyphens
      md += `   - ${rule.id} [${rule.title}](#${anchor})\n`;
    });
  });

  md += `\n---\n\n`;

  // Generate sections
  sections.forEach((section) => {
    md += `## ${section.number}. ${section.title}\n\n`;
    md += `**Impact: ${section.impact}${
      section.impactDescription ? ` (${section.impactDescription})` : ''
    }**\n\n`;
    if (section.introduction) {
      md += `${section.introduction}\n\n`;
    }

    section.rules.forEach((rule) => {
      md += `### ${rule.id} ${rule.title}\n\n`;
      md += `**Impact: ${rule.impact}${
        rule.impactDescription ? ` (${rule.impactDescription})` : ''
      }**\n\n`;
      md += `${rule.explanation}\n\n`;

      rule.examples.forEach((example) => {
        if (example.description) {
          md += `**${example.label}: ${example.description}**\n\n`;
        } else {
          md += `**${example.label}:**\n\n`;
        }
        // Only generate code block if there's actual code
        if (example.code?.trim()) {
          md += `\`\`\`${example.language || 'typescript'}\n`;
          md += `${example.code}\n`;
          md += `\`\`\`\n\n`;
        }
        if (example.additionalText) {
          md += `${example.additionalText}\n\n`;
        }
      });

      if (rule.references && rule.references.length > 0) {
        md += `Reference: ${rule.references.map((ref) => `[${ref}](${ref})`).join(', ')}\n\n`;
      }
    });

    md += `---\n\n`;
  });

  // Add references section
  if (metadata.references && metadata.references.length > 0) {
    md += `## References\n\n`;
    metadata.references.forEach((ref, i) => {
      md += `${i + 1}. [${ref.title}](${ref.url})\n`;
    });
  }

  return md;
}

/**
 * Build a single skill
 */
async function buildSkill(skillConfig: SkillConfig, options: BuildCliOptions) {
  console.log(`\nBuilding ${skillConfig.name}...`);
  console.log(`  Rules directory: ${skillConfig.rulesDir}`);
  console.log(`  Output file: ${skillConfig.outputFile}`);

  // Read all rule files recursively (supports nested subdirs for nextdns-frontend)
  const ruleFilePaths = await collectRuleFiles(skillConfig.rulesDir);

  const ruleData: RuleFile[] = [];
  for (const filePath of ruleFilePaths) {
    const relativePath = relative(skillConfig.rulesDir, filePath).replace(/\\/g, '/');
    try {
      const parsed = await parseRuleFile(filePath, skillConfig.sectionMap, relativePath);
      ruleData.push(parsed);
    } catch (error) {
      console.error(`  Error parsing ${relativePath}:`, error);
    }
  }

  // Group rules by section
  const sectionsMap = new Map<number, Section>();

  // Build reverse lookup: section number → section key name
  const reverseSectionMap = Object.fromEntries(
    Object.entries(skillConfig.sectionMap).map(([key, num]) => [num, key])
  );

  function sectionTitle(key: string): string {
    const labels: Record<string, string> = {
      capability: 'Capability rules',
      efficiency: 'Efficiency rules',
      nextjs: 'Next.js',
      'react-router': 'React Router',
      sveltekit: 'SvelteKit',
    };
    return labels[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
  }

  ruleData.forEach(({ section, rule }) => {
    if (!sectionsMap.has(section)) {
      sectionsMap.set(section, {
        number: section,
        title: sectionTitle(reverseSectionMap[section] ?? `section-${section}`),
        impact: rule.impact,
        rules: [],
      });
    }
    sectionsMap.get(section)?.rules.push(rule);
  });

  // Sort rules within each section by title (using en-US locale for consistency across environments)
  sectionsMap.forEach((section) => {
    section.rules.sort((a, b) => a.title.localeCompare(b.title, 'en-US', { sensitivity: 'base' }));

    // Assign IDs based on sorted order
    section.rules.forEach((rule, index) => {
      rule.id = `${section.number}.${index + 1}`;
      rule.subsection = index + 1;
    });
  });

  // Convert to array and sort
  const sections = Array.from(sectionsMap.values()).sort((a, b) => a.number - b.number);

  // Read metadata
  let metadata: BuildMetadata;
  try {
    const metadataContent = await readFile(skillConfig.metadataFile, 'utf-8');
    metadata = parseBuildMetadata(JSON.parse(metadataContent));
  } catch {
    metadata = {
      version: '1.0.0',
      organization: 'NextDNS Skills',
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
      abstract: `Best practices and guidelines for ${skillConfig.description}, ordered by impact.`,
    };
  }

  // Upgrade version if flag is passed
  if (options.upgradeVersion) {
    const oldVersion = metadata.version;
    metadata.version = incrementVersion(oldVersion);
    console.log(`  Upgrading version: ${oldVersion} -> ${metadata.version}`);

    // Write updated metadata.json
    await writeFile(skillConfig.metadataFile, `${JSON.stringify(metadata, null, 2)}\n`, 'utf-8');
    console.log(`  ✓ Updated metadata.json`);

    // Update SKILL.md frontmatter if it exists
    const skillFile = join(skillConfig.skillDir, 'SKILL.md');
    try {
      const skillContent = await readFile(skillFile, 'utf-8');
      const updatedSkillContent = skillContent.replace(
        /^(---[\s\S]*?version:\s*)"[^"]*"([\s\S]*?---)$/m,
        `$1"${metadata.version}"$2`
      );
      await writeFile(skillFile, updatedSkillContent, 'utf-8');
      console.log(`  ✓ Updated SKILL.md`);
    } catch {
      // SKILL.md doesn't exist, skip
    }
  }

  // Generate markdown
  const markdown = generateMarkdown(sections, metadata, skillConfig);

  // Write output or verify generated output without mutating the repository.
  if (options.check) {
    let existing = '';
    try {
      existing = await readFile(skillConfig.outputFile, 'utf-8');
    } catch {
      // A missing generated file is a drift failure.
    }
    if (existing !== markdown) {
      console.error(`  ✗ Generated output is out of date: ${skillConfig.outputFile}`);
      process.exitCode = 1;
      return;
    }
    console.log(`  ✓ Generated output is up to date: ${skillConfig.outputFile}`);
    return;
  }

  await writeFile(skillConfig.outputFile, markdown, 'utf-8');
  console.log(`  ✓ Built AGENTS.md with ${sections.length} sections and ${ruleData.length} rules`);
}

/**
 * Main build function
 */
async function build(
  options: BuildCliOptions = parseBuildCliOptions(process.argv.slice(2))
): Promise<void> {
  try {
    console.log('Building AGENTS.md from rules...');

    if (options.all) {
      // Build all skills
      for (const skill of Object.values(SKILLS)) {
        await buildSkill(skill, options);
      }
    } else if (options.skill) {
      // Build specific skill
      const skill = SKILLS[options.skill];
      if (!skill) {
        console.error(`Unknown skill: ${options.skill}`);
        console.error(`Available skills: ${Object.keys(SKILLS).join(', ')}`);
        process.exit(1);
      }
      await buildSkill(skill, options);
    } else {
      // Build default skill (backwards compatibility)
      const defaultSkill = SKILLS[DEFAULT_SKILL];
      if (!defaultSkill) {
        console.error(`Unknown default skill: ${DEFAULT_SKILL}`);
        console.error(`Available skills: ${Object.keys(SKILLS).join(', ')}`);
        process.exit(1);
      }
      await buildSkill(defaultSkill, options);
    }

    console.log('\n✓ Build complete');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

export const run = build;
if (fileURLToPath(import.meta.url) === process.argv[1]) void build();
