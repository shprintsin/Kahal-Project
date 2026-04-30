import { PAGE_MARKER_REGEX } from './parse-document';

export interface PageChunk {
  /** 1-based page index — matches the running marker count emitted by rehype-page-markers. */
  pageNumber: number;
  /** Source filename declared by the marker (e.g. `page_0003.md`). `null` for the trailing chunk after the final marker. */
  filename: string | null;
  /** Markdown text from the end of the previous marker through (and including) this chunk's marker. */
  text: string;
}

/**
 * Split a markdown source into per-page chunks by `@@@ File: page_NNNN.md@@@` markers.
 *
 * Each chunk owns the text leading up to and including its closing marker. A trailing chunk
 * is emitted for any content after the last marker (so rejoining all chunks reproduces the
 * original source verbatim).
 */
export function splitByPages(markdown: string): PageChunk[] {
  const chunks: PageChunk[] = [];
  let cursor = 0;
  let pageNumber = 0;

  PAGE_MARKER_REGEX.lastIndex = 0;
  for (const match of markdown.matchAll(PAGE_MARKER_REGEX)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    pageNumber += 1;
    chunks.push({
      pageNumber,
      filename: match[1],
      text: markdown.slice(cursor, end),
    });
    cursor = end;
  }

  if (cursor < markdown.length) {
    const trailing = markdown.slice(cursor);
    if (trailing.trim().length > 0) {
      chunks.push({
        pageNumber: pageNumber + 1,
        filename: null,
        text: trailing,
      });
    }
  }

  if (chunks.length === 0) {
    chunks.push({ pageNumber: 1, filename: null, text: markdown });
  }

  return chunks;
}
