import fs from 'node:fs';
import path from 'node:path';

export {
  collectCodeBlocks,
  collectLinks,
  findFirstHeading,
  findHeadings,
  getDocumentNodes,
  getText,
  parseFrontmatter,
  parseFrontmatter as parseMarkdownFrontmatter,
  parseFrontmatterNode,
  parseMarkdown,
} from 'nextdns-markdown';
export type {
  Frontmatter,
  FrontmatterValue,
  MarkdownCodeBlock,
  MarkdownLink,
} from 'nextdns-markdown';

export function collectMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(fullPath));
    } else if (
      entry.name.endsWith('.md') &&
      !entry.name.startsWith('_') &&
      entry.name !== 'README.md'
    ) {
      files.push(fullPath);
    }
  }

  return files.sort();
}
