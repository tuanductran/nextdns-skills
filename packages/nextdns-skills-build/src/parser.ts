/**
 * Parser for NextDNS skill rule markdown files
 */

import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import type { ImpactLevel, Rule, RuleType } from './types.js';

export interface RuleFile {
  section: number;
  subsection?: number;
  rule: Rule;
}

/**
 * Parse YAML frontmatter from a markdown file.
 * Handles both scalar values and YAML array format (- item).
 */
function parseFrontmatter(text: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let currentKey = '';
  let inArray = false;
  const arrayValues: string[] = [];

  for (const line of text.split('\n')) {
    // YAML array item: "  - value"
    const arrayItemMatch = line.match(/^\s+-\s+(.+)/);
    if (arrayItemMatch) {
      if (inArray) {
        arrayValues.push(arrayItemMatch[1].trim().replace(/^["']|["']$/g, ''));
      }
      continue;
    }

    // Flush accumulated array before processing the next key
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
      // Start of YAML array block
      currentKey = key;
      inArray = true;
    } else {
      currentKey = key;
      result[key] = value.replace(/^["']|["']$/g, '');
    }
  }

  // Flush array at end of frontmatter
  if (inArray && currentKey) {
    result[currentKey] = arrayValues.slice();
  }

  return result;
}

/**
 * Parse a rule markdown file into a Rule object.
 * Supports the NextDNS rule format:
 *   - YAML frontmatter (title, impact, impactDescription, type, tags)
 *   - # H1 Title + one-line description
 *   - ## Correct Usage  → examples with label "Correct"
 *   - ## Do NOT Use     → examples with label "Incorrect"
 *   - Other ## sections → explanation / additional context
 */
export async function parseRuleFile(
  filePath: string,
  sectionMap?: Record<string, number>,
  relativePath?: string
): Promise<RuleFile> {
  const rawContent = await readFile(filePath, 'utf-8');
  const content = rawContent.replace(/\r\n/g, '\n');

  // --- Frontmatter ---
  let frontmatter: Record<string, unknown> = {};
  let contentStart = 0;

  if (content.startsWith('---')) {
    const frontmatterEnd = content.indexOf('\n---', 3);
    if (frontmatterEnd !== -1) {
      const frontmatterText = content.slice(3, frontmatterEnd).trim();
      frontmatter = parseFrontmatter(frontmatterText);
      contentStart = frontmatterEnd + 4;
    }
  }

  const ruleContent = content.slice(contentStart).trim();
  const ruleLines = ruleContent.split('\n');

  // --- Extract H1 title and one-line description ---
  let title = '';
  let titleLine = -1;
  let description = '';

  for (let i = 0; i < ruleLines.length; i++) {
    const line = ruleLines[i];
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      title = line.replace(/^#\s+/, '').trim();
      titleLine = i;
      // Next non-empty line is the one-line description
      for (let j = i + 1; j < ruleLines.length; j++) {
        const next = ruleLines[j].trim();
        if (next && !next.startsWith('#') && !next.startsWith('<!--')) {
          description = next;
          break;
        }
      }
      break;
    }
  }

  // --- Parse sections and examples ---
  let explanation = description;
  const examples: Rule['examples'] = [];
  const references: string[] = [];

  type ExampleSection = 'correct' | 'incorrect' | null;
  let currentSection: ExampleSection = null;
  let currentH3: string | undefined;
  let inCodeBlock = false;
  let codeBlockLanguage = 'bash';
  let codeBlockContent: string[] = [];
  let additionalText: string[] = [];
  let currentExample: Rule['examples'][number] | null = null;

  function flushExample() {
    if (currentExample) {
      if (additionalText.length > 0) {
        currentExample.additionalText = additionalText.join('\n\n');
        additionalText = [];
      }
      examples.push(currentExample);
      currentExample = null;
    }
  }

  for (let i = titleLine + 1; i < ruleLines.length; i++) {
    const line = ruleLines[i];

    // Skip HTML comments (e.g., <!-- @case-police-ignore -->)
    if (line.startsWith('<!--')) continue;

    // Code block boundaries
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End of code block — save to current example
        if (currentSection && currentExample) {
          currentExample.code = codeBlockContent.join('\n');
          currentExample.language = codeBlockLanguage;
        }
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        // Start of code block
        inCodeBlock = true;
        codeBlockLanguage = line.slice(3).trim() || 'bash';
        codeBlockContent = [];

        if (currentSection) {
          // Save previous example before starting a new code-based one
          flushExample();
          const label = currentSection === 'correct' ? 'Correct' : 'Incorrect';
          currentExample = {
            label,
            description: currentH3,
            code: '',
            language: codeBlockLanguage,
          };
          currentH3 = undefined;
        }
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // H2 section headings
    if (line.startsWith('## ')) {
      flushExample();
      const heading = line.replace(/^##\s+/, '').trim();
      const headingLower = heading.toLowerCase();

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
        // Non-example section: reset section context
        currentSection = null;
        currentH3 = undefined;
      }
      continue;
    }

    // H3 subheadings within example sections (become example descriptions)
    if (line.startsWith('### ') && currentSection) {
      flushExample();
      currentH3 = line.replace(/^###\s+/, '').trim();
      continue;
    }

    // Legacy **Label:** pattern (backwards compatibility)
    const labelMatch = line.match(/^\*\*([^:]+?):\*?\*?$/);
    if (labelMatch && !currentSection) {
      flushExample();
      const fullLabel = labelMatch[1].trim();
      const descMatch = fullLabel.match(/^([A-Za-z]+(?:\s+[A-Za-z]+)*)\s*\(([^()]+)\)$/);
      currentExample = {
        label: descMatch ? descMatch[1].trim() : fullLabel,
        description: descMatch ? descMatch[2].trim() : undefined,
        code: '',
        language: codeBlockLanguage,
      };
      continue;
    }

    // Reference links
    if (line.startsWith('Reference:') || line.startsWith('References:')) {
      flushExample();
      const refMatches = line.match(/\[([^\]]+)\]\(([^)]+)\)/g);
      if (refMatches) {
        references.push(
          ...refMatches.map((ref) => {
            const m = ref.match(/\[([^\]]+)\]\(([^)]+)\)/);
            return m ? m[2] : ref;
          })
        );
      }
      continue;
    }

    // Plain text
    if (line.trim() && !line.startsWith('#')) {
      if (!currentSection && !currentExample) {
        // Explanation content outside of example sections
        if (!line.startsWith('<!--')) {
          explanation += (explanation ? '\n\n' : '') + line;
        }
      } else if (currentExample) {
        additionalText.push(line);
      }
    }
  }

  flushExample();

  // --- Determine section number ---
  const ruleType = frontmatter.type as RuleType | undefined;
  const effectiveSectionMap = sectionMap ?? { capability: 1, efficiency: 2 };

  let section = 0;

  // 1. Use type frontmatter against sectionMap (for non-frontend skills)
  if (ruleType && effectiveSectionMap[ruleType] !== undefined) {
    section = effectiveSectionMap[ruleType];
  }

  // 2. Use subdirectory prefix (for nextdns-frontend nested rules)
  if (section === 0 && relativePath) {
    const parts = relativePath.replace(/\\/g, '/').split('/');
    if (parts.length > 1) {
      // Try longest prefix first from directory components
      for (let len = parts.length - 1; len > 0; len--) {
        const prefix = parts.slice(0, len).join('/');
        if (effectiveSectionMap[prefix] !== undefined) {
          section = effectiveSectionMap[prefix];
          break;
        }
        // Try last component only (e.g., "nextjs" from "nextjs/api-proxy.md")
        const dirName = parts[len - 1];
        if (effectiveSectionMap[dirName] !== undefined) {
          section = effectiveSectionMap[dirName];
          break;
        }
      }
    }
  }

  // 3. Fall back to filename prefix matching
  if (section === 0) {
    const filename = basename(filePath);
    const filenameParts = filename.replace('.md', '').split('-');
    for (let len = filenameParts.length; len > 0; len--) {
      const prefix = filenameParts.slice(0, len).join('-');
      if (effectiveSectionMap[prefix] !== undefined) {
        section = effectiveSectionMap[prefix];
        break;
      }
    }
  }

  // 4. Use frontmatter section override
  if (frontmatter.section) {
    section = Number(frontmatter.section) || section;
  }

  const validImpacts: ImpactLevel[] = ['HIGH', 'MEDIUM', 'LOW'];
  const rawImpact = (frontmatter.impact as string | undefined) || 'MEDIUM';
  const impact: ImpactLevel = validImpacts.includes(rawImpact as ImpactLevel)
    ? (rawImpact as ImpactLevel)
    : 'MEDIUM';

  const rule: Rule = {
    id: '',
    title: (frontmatter.title as string | undefined) || title,
    section,
    subsection: undefined,
    type: ruleType,
    impact,
    impactDescription: (frontmatter.impactDescription as string | undefined) || '',
    explanation: explanation.trim(),
    examples,
    references,
    tags: Array.isArray(frontmatter.tags)
      ? (frontmatter.tags as unknown[]).filter((t): t is string => typeof t === 'string')
      : typeof frontmatter.tags === 'string'
        ? (frontmatter.tags as string).split(',').map((t: string) => t.trim())
        : undefined,
  };

  return { section, subsection: 0, rule };
}
