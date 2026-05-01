import type { Plugin } from 'unified';
import type { Root, Element, Text } from 'hast';
import { visit, SKIP } from 'unist-util-visit';
import { markerDomId } from '@/types/document-v2';

// Accepts both `@@@ File: NAME.md @@@` (with closing fence) and `@@@ File: NAME.md`
// terminated by a newline. The `m` flag lets `$` match end-of-line.
export const PAGE_MARKER_REGEX = /@@@\s*File:\s*([^\s@]+?)\s*(?:@@@|$)/gm;

function buildPageMarker(filename: string, pageNumber: number): Element {
  const id = markerDomId(filename, pageNumber);
  return {
    type: 'element',
    tagName: 'span',
    properties: {
      'data-page-marker': filename,
      'data-page-index': String(pageNumber),
      id,
      className: ['page-marker'],
    },
    children: [
      {
        type: 'element',
        tagName: 'a',
        properties: {
          href: `#${id}`,
          className: ['page-marker-num'],
          'data-page-number': String(pageNumber),
          'aria-label': `Page ${pageNumber}`,
        },
        children: [{ type: 'text', value: String(pageNumber) }],
      },
    ],
  };
}

export const rehypePageMarkers: Plugin<[], Root> = () => (tree) => {
  let pageNumber = 0;
  visit(tree, 'text', (node: Text, index, parent) => {
    if (!parent || typeof index !== 'number') return;
    const value = node.value;
    PAGE_MARKER_REGEX.lastIndex = 0;
    if (!PAGE_MARKER_REGEX.test(value)) return;

    const replacements: (Text | Element)[] = [];
    let cursor = 0;
    PAGE_MARKER_REGEX.lastIndex = 0;
    for (const match of value.matchAll(PAGE_MARKER_REGEX)) {
      const start = match.index ?? 0;
      const end = start + match[0].length;
      if (start > cursor) {
        replacements.push({ type: 'text', value: value.slice(cursor, start) });
      }
      pageNumber += 1;
      replacements.push(buildPageMarker(match[1], pageNumber));
      cursor = end;
    }
    if (cursor < value.length) {
      replacements.push({ type: 'text', value: value.slice(cursor) });
    }

    parent.children.splice(index, 1, ...replacements);
    return [SKIP, index + replacements.length];
  });
};
