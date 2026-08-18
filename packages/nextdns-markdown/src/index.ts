import type { Code, Heading, Link, Root, RootContent } from 'mdast';

import { toString } from 'mdast-util-to-string';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import * as v from 'valibot';
import { parse as parseYaml } from 'yaml';

const markdownProcessor = unified().use(remarkParse).use(remarkFrontmatter, 'yaml').use(remarkGfm);
const FlatFrontmatterValueSchema = v.union([v.string(), v.array(v.string())]);
const NestedFrontmatterSchema = v.record(v.string(), FlatFrontmatterValueSchema);
const FrontmatterValueSchema = v.union([v.string(), v.array(v.string()), NestedFrontmatterSchema]);

export const FrontmatterSchema = v.record(v.string(), FrontmatterValueSchema);

export type FrontmatterValue = v.InferOutput<typeof FrontmatterValueSchema>;
export type Frontmatter = v.InferOutput<typeof FrontmatterSchema>;

export interface MarkdownCodeBlock {
  value: string;
  language: string;
  meta?: string;
}

export interface MarkdownLink {
  label: string;
  url: string;
  title?: string;
}

export function parseMarkdown(content: string): Root {
  return markdownProcessor.parse(content) as Root;
}

export function parseFrontmatter(content: string): Frontmatter {
  const tree = parseMarkdown(content);
  return parseFrontmatterNode(tree);
}

export function parseFrontmatterNode(tree: Root): Frontmatter {
  const firstNode = tree.children[0];
  if (!firstNode || firstNode.type !== 'yaml') return {};

  const parsed = normalizeYamlValue(parseYaml(firstNode.value));
  return v.parse(FrontmatterSchema, parsed ?? {});
}

export function getDocumentNodes(tree: Root): RootContent[] {
  const firstNode = tree.children[0];
  return firstNode?.type === 'yaml' ? tree.children.slice(1) : tree.children;
}

export function getText(node: RootContent | Heading | Code | Link): string {
  return toString(node);
}

export function findFirstHeading(tree: Root, depth = 1): Heading | undefined {
  return findHeadings(tree, depth)[0];
}

export function findHeadings(tree: Root, depth?: number): Heading[] {
  const headings: Heading[] = [];
  walk(tree, (node) => {
    if (node.type === 'heading' && (depth === undefined || node.depth === depth)) {
      headings.push(node);
    }
  });
  return headings;
}

export function collectCodeBlocks(tree: Root): MarkdownCodeBlock[] {
  const blocks: MarkdownCodeBlock[] = [];
  walk(tree, (node) => {
    if (node.type !== 'code') return;

    const block: MarkdownCodeBlock = {
      value: node.value,
      language: node.lang || 'bash',
    };
    if (node.meta !== null && node.meta !== undefined) block.meta = node.meta;
    blocks.push(block);
  });
  return blocks;
}

export function collectLinks(tree: Root): MarkdownLink[] {
  const links: MarkdownLink[] = [];
  walk(tree, (node) => {
    if (node.type !== 'link') return;

    const link: MarkdownLink = {
      label: toString(node),
      url: node.url,
    };
    if (node.title !== null && node.title !== undefined) link.title = node.title;
    links.push(link);
  });
  return links;
}

function normalizeYamlValue(value: unknown): unknown {
  if (value === null || value === undefined) return [];
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    return value.map((item) => normalizeYamlValue(item));
  }
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, normalizeYamlValue(nestedValue)])
    );
  }
  return value;
}

function walk(node: Root | RootContent, visitor: (node: RootContent) => void): void {
  if (node.type !== 'root') visitor(node);
  if (!('children' in node)) return;

  for (const child of node.children) {
    walk(child, visitor);
  }
}

export { FrontmatterValueSchema };
