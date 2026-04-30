import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import { toString as nodeToString } from 'mdast-util-to-string';
import GithubSlugger from 'github-slugger';
import {
  DOCUMENT_V2_LOCALES,
  DocumentV2Frontmatter,
  DocumentV2Locale,
  DocumentV2Meta,
  DocumentV2Scans,
  DocumentV2Translation,
  PageMarker,
  ParsedDocumentV2,
  TocEntry,
  markerDomId,
  resolveMarkerImageUrl,
} from '@/types/document-v2';

// Accepts both `@@@ File: NAME.md @@@` (with closing fence) and `@@@ File: NAME.md`
// terminated by a newline. The `m` flag lets `$` match end-of-line so a marker can stand
// on its own line without the trailing fence.
export const PAGE_MARKER_REGEX = /@@@\s*File:\s*([^\s@]+?)\s*(?:@@@|$)/gm;

export class DocumentV2ParseError extends Error {}

function isLocale(value: unknown): value is DocumentV2Locale {
  return typeof value === 'string' && (DOCUMENT_V2_LOCALES as readonly string[]).includes(value);
}

function validateFrontmatter(data: Record<string, unknown>): DocumentV2Frontmatter {
  const slug = data.slug;
  if (typeof slug !== 'string' || !slug) {
    throw new DocumentV2ParseError('Frontmatter is missing required "slug".');
  }
  const title = data.title;
  if (!title || typeof title !== 'object') {
    throw new DocumentV2ParseError('Frontmatter "title" must be an i18n object.');
  }
  const lang = data.lang;
  if (!isLocale(lang)) {
    throw new DocumentV2ParseError(`Frontmatter "lang" must be one of ${DOCUMENT_V2_LOCALES.join(', ')}.`);
  }
  const scansRaw = data.scans;
  const scans =
    scansRaw && typeof scansRaw === 'object' && typeof (scansRaw as { baseUrl?: unknown }).baseUrl === 'string'
      ? (scansRaw as DocumentV2Frontmatter['scans'])
      : undefined;

  return {
    slug,
    title: title as DocumentV2Frontmatter['title'],
    description: data.description as DocumentV2Frontmatter['description'],
    lang,
    year: typeof data.year === 'number' ? data.year : undefined,
    archive: data.archive as DocumentV2Frontmatter['archive'],
    scans,
    license: typeof data.license === 'string' ? data.license : undefined,
  };
}

export function extractToc(markdown: string): TocEntry[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const slugger = new GithubSlugger();
  const entries: TocEntry[] = [];
  visit(tree, 'heading', (node: { depth: number }) => {
    if (node.depth < 1 || node.depth > 3) return;
    const text = nodeToString(node as never);
    if (!text) return;
    entries.push({
      id: slugger.slug(text),
      text,
      level: node.depth as 1 | 2 | 3,
    });
  });
  return entries;
}

export function extractMarkers(
  markdown: string,
  scans: DocumentV2Frontmatter['scans'] | undefined,
): PageMarker[] {
  const markers: PageMarker[] = [];
  let pageNumber = 0;
  for (const match of markdown.matchAll(PAGE_MARKER_REGEX)) {
    const filename = match[1];
    pageNumber += 1;
    markers.push({
      pageNumber,
      filename,
      imageUrl: resolveMarkerImageUrl(scans, filename),
      domId: markerDomId(filename, pageNumber),
    });
  }
  return markers;
}

export interface ParseDocumentInput {
  id: string;
  source: string;
  updatedAt?: string;
  translations?: DocumentV2Translation[];
}

export function parseDocumentV2({
  id,
  source,
  updatedAt,
  translations = [],
}: ParseDocumentInput): ParsedDocumentV2 {
  const { data, content } = matter(source);
  const frontmatter = validateFrontmatter(data);
  const meta: DocumentV2Meta = {
    ...frontmatter,
    id,
    updatedAt: updatedAt ?? new Date(0).toISOString(),
  };
  return {
    meta,
    markdown: content,
    toc: extractToc(content),
    markers: extractMarkers(content, frontmatter.scans),
    translations,
  };
}

/**
 * Parse a translation sibling that may have no frontmatter — only the markdown body matters,
 * since metadata (slug, scans, archive…) is owned by the original.
 */
export function parseTranslationBody(
  source: string,
  lang: DocumentV2Locale,
  scans: DocumentV2Scans,
): DocumentV2Translation {
  const { content } = matter(source);
  return {
    lang,
    markdown: content,
    toc: extractToc(content),
    markers: extractMarkers(content, scans),
  };
}
