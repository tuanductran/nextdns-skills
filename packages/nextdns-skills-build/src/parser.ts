/**
 * Parser for NextDNS skill rule markdown files
 */

import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import type { CodeExample, ImpactLevel, Rule, RuleType } from './types.js';

export interface RuleFile {
  section: number;
  subsection?: number;
  rule: Rule;
}

function parseFrontmatter(text: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let currentKey = '';
  let inArray = false;
  const arrayValues: string[] = [];

  for (const line of text.split('\n')) {
    const arrayItemMatch = line.match(/^\s+-\s+(.+)/);
    if (arrayItemMatch) {
      if (inArray) arrayValues.push((arrayItemMatch[1] ?? '').trim().replace(/^["']|["']$/g, ''));
      continue;
    }
    if (inArray && currentKey) {
      result[currentKey] = arrayValues.slice();
      inArray = false;
      arrayValues.length = 0;
    }
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    if (!key) continue;
    if (value === '') {
      currentKey = key;
      inArray = true;
    } else {
      currentKey = key;
      result[key] = value.replace(/^["']|["']$/g, '');
    }
  }
  if (inArray && currentKey) result[currentKey] = arrayValues.slice();
  return result;
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
      frontmatter = parseFrontmatter(content.slice(3, frontmatterEnd).trim());
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

  const ruleType = frontmatter['type'] as RuleType | undefined;
  const effectiveSectionMap = sectionMap ?? { capability: 1, efficiency: 2 };
  let section = 0;

  if (ruleType !== undefined) {
    section = effectiveSectionMap[ruleType] ?? 0;
  }

  if (section === 0 && relativePath) {
    const parts = relativePath.replace(/\\/g, '/').split('/');
    if (parts.length > 1) {
      outer: for (let len = parts.length - 1; len > 0; len--) {
        const prefix = parts.slice(0, len).join('/');
        if (effectiveSectionMap[prefix] !== undefined) {
          section = effectiveSectionMap[prefix] ?? 0;
          break outer;
        }
        const dirName = parts[len - 1];
        if (dirName !== undefined && effectiveSectionMap[dirName] !== undefined) {
          section = effectiveSectionMap[dirName] ?? 0;
          break outer;
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

  const validImpacts: ImpactLevel[] = ['HIGH', 'MEDIUM', 'LOW'];
  const rawImpact = (frontmatter['impact'] as string | undefined) ?? 'MEDIUM';
  const impact: ImpactLevel = validImpacts.includes(rawImpact as ImpactLevel)
    ? (rawImpact as ImpactLevel)
    : 'MEDIUM';

  const impactDescription = (frontmatter['impactDescription'] as string | undefined) ?? '';

  const rawTags = frontmatter['tags'];
  const tags: string[] | undefined = Array.isArray(rawTags)
    ? (rawTags as unknown[]).filter((t): t is string => typeof t === 'string')
    : typeof rawTags === 'string'
      ? (rawTags as string).split(',').map((t: string) => t.trim())
      : undefined;

  // With exactOptionalPropertyTypes, we must omit optional props instead of
  // assigning undefined to them. Use conditional spread for all optional fields.
  const rule: Rule = {
    id: '',
    title: (frontmatter['title'] as string | undefined) ?? title,
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
