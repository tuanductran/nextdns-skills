/**
 * Parser for NextDNS skill rule markdown files
 */

import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

import type { CodeExample, ImpactLevel, Rule, RuleType } from './types.js';

import { parseFrontmatter } from './markdown.js';

export interface RuleFile {
  section: number;
  subsection?: number;
  rule: Rule;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function isRuleType(value: string): value is RuleType {
  return value === 'capability' || value === 'efficiency';
}

function isImpactLevel(value: string): value is ImpactLevel {
  return value === 'HIGH' || value === 'MEDIUM' || value === 'LOW';
}

/** Build a CodeExample omitting undefined optional fields (exactOptionalPropertyTypes). */
function makeExample(
  label: string,
  code: string,
  language: string,
  description?: string,
  additionalText?: string
): CodeExample {
  const ex: CodeExample = { label, code, language };
  if (description !== undefined) ex.description = description;
  if (additionalText !== undefined) ex.additionalText = additionalText;
  return ex;
}

export async function parseRuleFile(
  filePath: string,
  sectionMap?: Record<string, number>,
  relativePath?: string
): Promise<RuleFile> {
  const rawContent = await readFile(filePath, 'utf-8');
  const content = rawContent.replace(/\r\n/g, '\n');

  let frontmatter: Record<string, unknown> = {};
  let contentStart = 0;

  if (content.startsWith('---')) {
    const frontmatterEnd = content.indexOf('\n---', 3);
    if (frontmatterEnd !== -1) {
      frontmatter = parseFrontmatter(content.slice(0, frontmatterEnd + 4));
      contentStart = frontmatterEnd + 4;
    }
  }

  const ruleLines = content.slice(contentStart).trim().split('\n');

  let title = '';
  let titleLine = -1;
  let description = '';

  for (let i = 0; i < ruleLines.length; i++) {
    const line = ruleLines[i];
    if (line === undefined) continue;
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      title = line.replace(/^#\s+/, '').trim();
      titleLine = i;
      for (let j = i + 1; j < ruleLines.length; j++) {
        const next = ruleLines[j];
        if (next === undefined) continue;
        const trimmed = next.trim();
        if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('<!--')) {
          description = trimmed;
          break;
        }
      }
      break;
    }
  }

  let explanation = description;
  const examples: CodeExample[] = [];
  const references: string[] = [];

  type ExampleSection = 'correct' | 'incorrect' | null;
  let currentSection: ExampleSection = null;
  let currentH3: string | undefined;
  let inCodeBlock = false;
  let codeBlockLanguage = 'bash';
  let codeBlockContent: string[] = [];
  let additionalText: string[] = [];

  let draftLabel = '';
  let draftDescription: string | undefined;
  let draftCode = '';
  let draftLanguage = 'bash';

  function flushExample(): void {
    if (!draftLabel) return;
    examples.push(
      makeExample(
        draftLabel,
        draftCode,
        draftLanguage,
        draftDescription,
        additionalText.length > 0 ? additionalText.join('\n\n') : undefined
      )
    );
    draftLabel = '';
    draftDescription = undefined;
    draftCode = '';
    draftLanguage = 'bash';
    additionalText = [];
  }

  for (let i = titleLine + 1; i < ruleLines.length; i++) {
    const line = ruleLines[i];
    if (line === undefined) continue;
    if (line.startsWith('<!--')) continue;

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        if (currentSection && draftLabel) {
          draftCode = codeBlockContent.join('\n');
          draftLanguage = codeBlockLanguage;
        }
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeBlockLanguage = line.slice(3).trim() || 'bash';
        codeBlockContent = [];
        if (currentSection) {
          flushExample();
          draftLabel = currentSection === 'correct' ? 'Correct' : 'Incorrect';
          draftDescription = currentH3;
          draftCode = '';
          draftLanguage = codeBlockLanguage;
          currentH3 = undefined;
        }
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    if (line.startsWith('## ')) {
      flushExample();
      const headingLower = line
        .replace(/^##\s+/, '')
        .trim()
        .toLowerCase();
      if (headingLower.includes('correct usage') || headingLower.includes('correct use')) {
        currentSection = 'correct';
      } else if (
        headingLower.includes('do not use') ||
        headingLower.includes("don't use") ||
        headingLower.includes('incorrect') ||
        headingLower.includes('avoid')
      ) {
        currentSection = 'incorrect';
      } else {
        currentSection = null;
        currentH3 = undefined;
      }
      continue;
    }

    if (line.startsWith('### ') && currentSection) {
      flushExample();
      currentH3 = line.replace(/^###\s+/, '').trim();
      continue;
    }

    const labelMatch = line.match(/^\*\*([^:]+?):\*?\*?$/);
    if (labelMatch && !currentSection) {
      flushExample();
      const fullLabel = (labelMatch[1] ?? '').trim();
      const descMatch = fullLabel.match(/^([A-Za-z]+(?:\s+[A-Za-z]+)*)\s*\(([^()]+)\)$/);
      draftLabel = descMatch ? (descMatch[1] ?? fullLabel).trim() : fullLabel;
      draftDescription = descMatch ? (descMatch[2] ?? undefined) : undefined;
      draftCode = '';
      draftLanguage = codeBlockLanguage;
      continue;
    }

    if (line.startsWith('Reference:') || line.startsWith('References:')) {
      flushExample();
      const refMatches = line.match(/\[([^\]]+)\]\(([^)]+)\)/g);
      if (refMatches) {
        references.push(
          ...refMatches.map((ref) => ref.match(/\[([^\]]+)\]\(([^)]+)\)/)?.[2] ?? ref)
        );
      }
      continue;
    }

    if (line.trim() && !line.startsWith('#')) {
      if (!currentSection && !draftLabel) {
        if (!line.startsWith('<!--')) explanation += (explanation ? '\n\n' : '') + line;
      } else if (draftLabel) {
        additionalText.push(line);
      }
    }
  }

  flushExample();

  const rawRuleType = asString(frontmatter['type']);
  const ruleType = rawRuleType !== undefined && isRuleType(rawRuleType) ? rawRuleType : undefined;
  const effectiveSectionMap = sectionMap ?? { capability: 1, efficiency: 2 };
  let section = 0;

  if (ruleType !== undefined) {
    section = effectiveSectionMap[ruleType] ?? 0;
  }

  if (section === 0 && relativePath) {
    const parts = relativePath.replace(/\\/g, '/').split('/');
    if (parts.length > 1) {
      for (let len = parts.length - 1; len > 0; len--) {
        const prefix = parts.slice(0, len).join('/');
        if (effectiveSectionMap[prefix] !== undefined) {
          section = effectiveSectionMap[prefix] ?? 0;
          break;
        }
        const dirName = parts[len - 1];
        if (dirName !== undefined && effectiveSectionMap[dirName] !== undefined) {
          section = effectiveSectionMap[dirName] ?? 0;
          break;
        }
      }
    }
  }

  if (section === 0) {
    const filename = basename(filePath);
    const filenameParts = filename.replace('.md', '').split('-');
    for (let len = filenameParts.length; len > 0; len--) {
      const prefix = filenameParts.slice(0, len).join('-');
      if (effectiveSectionMap[prefix] !== undefined) {
        section = effectiveSectionMap[prefix] ?? 0;
        break;
      }
    }
  }

  if (frontmatter['section']) section = Number(frontmatter['section']) || section;

  const rawImpact = asString(frontmatter['impact']) ?? 'MEDIUM';
  const impact: ImpactLevel = isImpactLevel(rawImpact) ? rawImpact : 'MEDIUM';

  const impactDescription = asString(frontmatter['impactDescription']) ?? '';

  const rawTags = frontmatter['tags'];
  const tags: string[] | undefined = Array.isArray(rawTags)
    ? rawTags.filter((t): t is string => typeof t === 'string')
    : typeof rawTags === 'string'
      ? rawTags.split(',').map((t) => t.trim())
      : undefined;

  // With exactOptionalPropertyTypes, we must omit optional props instead of
  // assigning undefined to them. Use conditional spread for all optional fields.
  const rule: Rule = {
    id: '',
    title: asString(frontmatter['title']) ?? title,
    section,
    impact,
    impactDescription,
    explanation: explanation.trim(),
    examples,
    references,
    ...(ruleType !== undefined ? { type: ruleType } : {}),
    ...(tags !== undefined ? { tags } : {}),
  };

  return { section, rule };
}
