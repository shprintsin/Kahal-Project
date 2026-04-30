// Server-only by convention: the only callers are the deploy handler and the
// backfill script. The `server-only` runtime guard is intentionally omitted so
// node-only entrypoints (scripts/) can import this module without the Next.js
// shim. Don't import this from client code.
import { createHash } from 'node:crypto';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import type { Plugin } from 'unified';
import type { Element, Root } from 'hast';
import { visit, SKIP } from 'unist-util-visit';
import { rehypePageMarkers } from './rehype-page-markers';
import { PAGE_MARKER_REGEX } from './parse-document';

/**
 * Per-page derivation pipeline used at deploy time. The reader doesn't consume
 * `html` yet (it still parses the source markdown client-side) — but populating
 * these columns now means the next migration only has to flip the read path.
 */
export interface DerivedPage {
  pageNumber: number;
  filename: string;
  /** The markdown slice for this page — what `document_v2_page_text.text` already stored. */
  text: string;
  /** Sanitized HTML, rendered with the same plugin chain the client uses today. */
  html: string;
  /** Plaintext extracted from the rendered HTML, used for content_hash + future search. */
  plaintext: string;
  /** Heading breadcrumb that leads into this page, e.g. `["Chapter II", "Section 3"]`. */
  headingPath: string[];
  /** Start offset of `text` within the concatenated lang body (sum of prior page lengths + separators). */
  charStart: number;
  /** Exclusive end offset; `charEnd - charStart === text.length`. */
  charEnd: number;
  /** sha1(text) — used by the highlight anchor system to detect drift across re-deploys. */
  contentHash: string;
}

const HEADING_REGEX = /^(#{1,6})\s+(.+?)\s*#*\s*$/gm;

function slugifyHeading(line: string): string {
  return (
    line
      .replace(/^#+\s*/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'section'
  );
}

interface RawPage {
  pageNumber: number;
  filename: string;
  /** Offset in the original markdown where this page's text starts. Used for heading-path lookup. */
  sourceStart: number;
  text: string;
}

function splitIntoRawPages(markdown: string): RawPage[] {
  const markerMatches: Array<{ filename: string; start: number; end: number }> = [];
  for (const m of markdown.matchAll(PAGE_MARKER_REGEX)) {
    markerMatches.push({
      filename: m[1],
      start: m.index ?? 0,
      end: (m.index ?? 0) + m[0].length,
    });
  }
  if (markerMatches.length > 0) {
    return markerMatches.map((cur, i) => {
      const next = markerMatches[i + 1];
      const sliceStart = cur.end;
      const sliceEnd = next ? next.start : markdown.length;
      const text = markdown.slice(sliceStart, sliceEnd).trim();
      return {
        pageNumber: i + 1,
        filename: cur.filename,
        sourceStart: sliceStart,
        text,
      };
    });
  }

  const headingMatches: Array<{ line: string; start: number }> = [];
  // HEADING_REGEX has the `g` flag — reset lastIndex defensively.
  HEADING_REGEX.lastIndex = 0;
  for (const m of markdown.matchAll(/^# .+$/gm)) {
    headingMatches.push({ line: m[0], start: m.index ?? 0 });
  }
  if (headingMatches.length > 0) {
    return headingMatches.map((cur, i) => {
      const next = headingMatches[i + 1];
      const text = markdown.slice(cur.start, next ? next.start : markdown.length).trim();
      const seq = String(i + 1).padStart(4, '0');
      return {
        pageNumber: i + 1,
        filename: `section_${seq}_${slugifyHeading(cur.line)}.md`,
        sourceStart: cur.start,
        text,
      };
    });
  }

  const trimmed = markdown.trim();
  if (trimmed.length === 0) return [];
  return [
    {
      pageNumber: 1,
      filename: 'page_0001.md',
      sourceStart: 0,
      text: trimmed,
    },
  ];
}

/** Walk every heading in the source and, for each page, snapshot the heading path active at its start. */
function computeHeadingPaths(markdown: string, pages: RawPage[]): string[][] {
  const headings: Array<{ depth: number; text: string; offset: number }> = [];
  HEADING_REGEX.lastIndex = 0;
  for (const m of markdown.matchAll(HEADING_REGEX)) {
    headings.push({
      depth: m[1].length,
      text: m[2].trim(),
      offset: m.index ?? 0,
    });
  }

  return pages.map((p) => {
    // Active path = most recent heading at each depth seen *before* this page's start.
    const active: string[] = [];
    for (const h of headings) {
      if (h.offset >= p.sourceStart) break;
      // h.depth is 1-based; truncate any deeper entries on the path stack.
      active.length = h.depth - 1;
      active[h.depth - 1] = h.text;
    }
    // Strip trailing undefineds (e.g., if we have h1 then h3 with no h2 between).
    return active.filter((s): s is string => Boolean(s));
  });
}

/** Wrap every `<table>` in a scrollable div, matching the client's
 *  ReactMarkdown `components.table` override exactly so visual parity is
 *  preserved when we read precomputed HTML instead of re-parsing on the fly. */
const rehypeWrapTables: Plugin<[], Root> = () => (tree) => {
  visit(tree, 'element', (node: Element, index, parent) => {
    if (node.tagName !== 'table' || !parent || typeof index !== 'number') return;
    const wrapper: Element = {
      type: 'element',
      tagName: 'div',
      properties: {
        className: ['my-6', 'overflow-x-auto', 'border', 'border-border'],
      },
      children: [
        {
          ...node,
          properties: {
            ...(node.properties ?? {}),
            className: [
              ...(((node.properties?.className as string[] | undefined) ?? []) || []),
              'w-full',
              'border-collapse',
            ],
          },
        },
      ],
    };
    parent.children[index] = wrapper;
    return [SKIP, index + 1];
  });
};

/** Build the unified processor once; reuse across pages. */
function makeMarkdownProcessor() {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkMath)
    // `allowDangerousHtml` so raw HTML in archival markdown survives to rehypeRaw.
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypePageMarkers)
    .use(rehypeWrapTables)
    .use(rehypeStringify, { allowDangerousHtml: true });
}

function htmlToPlaintext(html: string): string {
  // Strip tags and decode the small handful of entities that remark-rehype emits.
  // We don't need DOM-grade decoding here — content_hash + search cope fine with
  // ASCII-clean output, and richer normalisation will land with the per-lang
  // tsvector work in Step 3.
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function derivePages(markdown: string): Promise<DerivedPage[]> {
  const raw = splitIntoRawPages(markdown);
  if (raw.length === 0) return [];

  const headingPaths = computeHeadingPaths(markdown, raw);
  const processor = makeMarkdownProcessor();

  // Cumulative offsets in the (lang) concat. We separate pages by a single
  // newline to keep the math simple and stable across re-deploys; this matches
  // what the highlight anchor system will reconstruct on the client.
  let cursor = 0;
  const out: DerivedPage[] = [];
  for (let i = 0; i < raw.length; i += 1) {
    const p = raw[i];
    const file = await processor.process(p.text);
    const html = String(file);
    const plaintext = htmlToPlaintext(html);
    const charStart = cursor;
    const charEnd = charStart + p.text.length;
    cursor = charEnd + 1; // +1 for the page separator newline

    out.push({
      pageNumber: p.pageNumber,
      filename: p.filename,
      text: p.text,
      html,
      plaintext,
      headingPath: headingPaths[i] ?? [],
      charStart,
      charEnd,
      contentHash: createHash('sha1').update(p.text).digest('hex'),
    });
  }
  return out;
}

/** Convenience for callers that don't need HTML — extracts markers without rendering. */
export function derivePageMetadata(markdown: string): Array<{
  pageNumber: number;
  filename: string;
  text: string;
  headingPath: string[];
  charStart: number;
  charEnd: number;
  contentHash: string;
}> {
  const raw = splitIntoRawPages(markdown);
  if (raw.length === 0) return [];
  const headingPaths = computeHeadingPaths(markdown, raw);
  let cursor = 0;
  return raw.map((p, i) => {
    const charStart = cursor;
    const charEnd = charStart + p.text.length;
    cursor = charEnd + 1;
    return {
      pageNumber: p.pageNumber,
      filename: p.filename,
      text: p.text,
      headingPath: headingPaths[i] ?? [],
      charStart,
      charEnd,
      contentHash: createHash('sha1').update(p.text).digest('hex'),
    };
  });
}

