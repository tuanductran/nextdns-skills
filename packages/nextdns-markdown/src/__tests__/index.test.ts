import { describe, expect, it } from 'vitest';

import {
  collectCodeBlocks,
  collectLinks,
  findFirstHeading,
  findHeadings,
  getDocumentNodes,
  getText,
  parseFrontmatter,
  parseFrontmatterNode,
  parseMarkdown,
} from '../index.js';

const markdown = `---
title: Authentication
tags:
  - api
  - security
impact: HIGH
---

# Authentication

Use the [NextDNS API](https://api.nextdns.io) securely.

## Correct Usage

### With an API key

\`\`\`bash
curl -H "X-Api-Key: YOUR_API_KEY" https://api.nextdns.io
\`\`\`
`;

describe('shared Markdown parser', () => {
  it('parses YAML frontmatter and validates its supported shape', () => {
    expect(parseFrontmatter(markdown)).toEqual({
      title: 'Authentication',
      tags: ['api', 'security'],
      impact: 'HIGH',
    });

    expect(parseFrontmatter('---\ncount: 2\n---\n')).toEqual({ count: '2' });
  });

  it('exposes the MDAST document without frontmatter as content nodes', () => {
    const tree = parseMarkdown(markdown);
    const nodes = getDocumentNodes(tree);

    expect(tree.children[0]?.type).toBe('yaml');
    expect(nodes[0]?.type).toBe('heading');
    expect(parseFrontmatterNode(tree)['title']).toBe('Authentication');
  });

  it('finds headings, code blocks, and links structurally', () => {
    const tree = parseMarkdown(markdown);
    const h1 = findFirstHeading(tree);
    const headings = findHeadings(tree);
    const codeBlocks = collectCodeBlocks(tree);
    const links = collectLinks(tree);

    expect(h1 ? getText(h1) : '').toBe('Authentication');
    expect(headings.map((heading) => getText(heading))).toEqual([
      'Authentication',
      'Correct Usage',
      'With an API key',
    ]);
    expect(codeBlocks).toEqual([
      {
        value: 'curl -H "X-Api-Key: YOUR_API_KEY" https://api.nextdns.io',
        language: 'bash',
      },
    ]);
    expect(links).toEqual([{ label: 'NextDNS API', url: 'https://api.nextdns.io' }]);
  });
});
