import { describe, it, expect } from 'vitest';
import { parseDocumentV2, DocumentV2ParseError } from '../parse-document';
import { rehypePageMarkers } from '../rehype-page-markers';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

const HAPPY = `---
slug: "demo"
title: { en: "Demo", he: "דמו" }
lang: en
year: 1900
scans:
  baseUrl: "/scans/demo/"
  extension: "jpg"
---

# Hello

intro paragraph @@@ File: page_0001.md@@@

## Section

| a | b |
|---|---|
| 1 | 2 @@@ File: page_0002.md@@@ |
`;

describe('parseDocumentV2', () => {
  it('parses frontmatter, toc, and markers', () => {
    const result = parseDocumentV2({ id: 'x', source: HAPPY });
    expect(result.meta.slug).toBe('demo');
    expect(result.meta.title.en).toBe('Demo');
    expect(result.meta.lang).toBe('en');
    expect(result.toc.map((e) => e.text)).toEqual(['Hello', 'Section']);
    expect(result.markers.map((m) => m.filename)).toEqual(['page_0001.md', 'page_0002.md']);
    expect(result.markers.map((m) => m.pageNumber)).toEqual([1, 2]);
    expect(result.markers[0].imageUrl).toBe('/scans/demo/page_0001.jpg');
    expect(result.markers[0].domId).toBe('tripwire-1-page_0001');
  });

  it('throws when frontmatter is missing required fields', () => {
    expect(() => parseDocumentV2({ id: 'x', source: '# bare\n' })).toThrow(DocumentV2ParseError);
  });

  it('counts every marker occurrence by source order, including repeated filenames', () => {
    const src = HAPPY.replace(
      '@@@ File: page_0002.md@@@',
      '@@@ File: page_0001.md@@@',
    );
    const result = parseDocumentV2({ id: 'x', source: src });
    expect(result.markers.map((m) => m.pageNumber)).toEqual([1, 2]);
    expect(result.markers.map((m) => m.filename)).toEqual([
      'page_0001.md',
      'page_0001.md',
    ]);
    expect(result.markers[0].domId).not.toBe(result.markers[1].domId);
  });

  it('ignores malformed marker text', () => {
    const src = HAPPY.replace('@@@ File: page_0001.md@@@', '@@@ Almost: page_x@@@');
    const result = parseDocumentV2({ id: 'x', source: src });
    expect(result.markers.map((m) => m.filename)).toEqual(['page_0002.md']);
  });
});

describe('rehypePageMarkers', () => {
  function transform(md: string): string {
    return String(
      unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypePageMarkers)
        .use(rehypeStringify)
        .processSync(md),
    );
  }

  it('replaces markers in plain text with tripwire spans', () => {
    const html = transform('hello @@@ File: page_0003.md@@@ world');
    expect(html).toContain('data-page-marker="page_0003.md"');
    expect(html).toContain('data-page-index="1"');
    expect(html).toContain('id="tripwire-1-page_0003"');
    expect(html).not.toContain('@@@');
  });

  it('replaces markers inside table cells', () => {
    const md = '| a | b |\n|---|---|\n| 1 | 2 @@@ File: page_0007.md@@@ |\n';
    const html = transform(md);
    expect(html).toContain('data-page-marker="page_0007.md"');
    expect(html).not.toContain('@@@');
  });
});
