'use client';

/**
 * Range ↔ flat-text-offset conversion for the document reader.
 *
 * Hot-path performance: we cache a `FlatTextIndex` per (container, content
 * version). Building the index walks the article's text-node tree once;
 * after that, `rangeToOffsets` is O(1) (single Map lookup) and
 * `offsetsToRange` is O(log M) (binary search on cumulative starts). The
 * naive previous implementation walked the tree on every call, which was
 * O(N · M) when restoring N saved highlights into M text nodes.
 */

interface FlatTextIndex {
  /** Accepted text nodes in document order. */
  nodes: Text[];
  /** `starts[i]` = total characters before `nodes[i]` in the flat walk. */
  starts: Uint32Array;
  /** `nodes[i]` → `i`. Lets `rangeToOffsets` resolve a known node in O(1). */
  nodeIndex: Map<Text, number>;
  /** Sum of all node lengths — handy for clamping and end-of-doc selections. */
  totalLength: number;
}

/** WeakMap so the entry is GC'd when the article element unmounts. The inner
 *  `version` is the content fingerprint (e.g. the active markdown string) —
 *  switching languages bumps it and forces a rebuild. */
const indexCache = new WeakMap<HTMLElement, { version: unknown; index: FlatTextIndex }>();

/** Same accept filter `useDocumentSearch` uses, so highlights and search
 *  agree on what counts as content. Page-marker badges are layout chrome. */
function makeWalker(container: HTMLElement): TreeWalker {
  return document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      const parent = (n as Text).parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (parent.closest('.page-marker')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
}

function buildIndex(container: HTMLElement): FlatTextIndex {
  const nodes: Text[] = [];
  const startsList: number[] = [];
  const nodeIndex = new Map<Text, number>();
  let cursor = 0;
  const walker = makeWalker(container);
  let n: Node | null;
  while ((n = walker.nextNode())) {
    const text = n as Text;
    const len = text.nodeValue?.length ?? 0;
    if (len === 0) continue; // skip empty text nodes — they pollute lookups
    nodeIndex.set(text, nodes.length);
    nodes.push(text);
    startsList.push(cursor);
    cursor += len;
  }
  // Uint32Array is faster to binary-search and uses less memory than a number[].
  return {
    nodes,
    starts: Uint32Array.from(startsList),
    nodeIndex,
    totalLength: cursor,
  };
}

/** Get the cached index, rebuilding when the content version changes. */
export function getIndex(container: HTMLElement, contentVersion: unknown): FlatTextIndex {
  const hit = indexCache.get(container);
  if (hit && hit.version === contentVersion) return hit.index;
  const index = buildIndex(container);
  indexCache.set(container, { version: contentVersion, index });
  return index;
}

/** Binary-search `starts` for the highest entry ≤ `offset`. Returns the node
 *  index. If `offset` exactly equals `totalLength`, returns the last node so
 *  end-of-document selections still resolve. */
function locate(index: FlatTextIndex, offset: number): number {
  const { starts, nodes } = index;
  if (nodes.length === 0) return -1;
  if (offset <= 0) return 0;
  let lo = 0;
  let hi = starts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >>> 1; // upper-half bias
    if (starts[mid] <= offset) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/** Convert a Range into flat-text `{ start, end }` offsets. */
export function rangeToOffsets(
  container: HTMLElement,
  range: Range,
  index: FlatTextIndex,
): { start: number; end: number } | null {
  if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) {
    return null;
  }
  const startNode = range.startContainer;
  const endNode = range.endContainer;
  // The selection endpoints must land on text nodes (which is the case for
  // any user-driven selection since we walked text nodes only).
  if (!(startNode instanceof Text) || !(endNode instanceof Text)) return null;
  const startIdx = index.nodeIndex.get(startNode);
  const endIdx = index.nodeIndex.get(endNode);
  if (startIdx === undefined || endIdx === undefined) return null;
  const start = index.starts[startIdx] + range.startOffset;
  const end = index.starts[endIdx] + range.endOffset;
  if (end <= start) return null;
  return { start, end };
}

/** Build a Range from flat-text offsets via binary search. */
export function offsetsToRange(
  container: HTMLElement,
  start: number,
  end: number,
  index: FlatTextIndex,
): Range | null {
  if (end <= start || index.nodes.length === 0) return null;
  if (end > index.totalLength) return null;
  const startIdx = locate(index, start);
  const endIdx = locate(index, end);
  if (startIdx < 0 || endIdx < 0) return null;
  const startNode = index.nodes[startIdx];
  const endNode = index.nodes[endIdx];
  const startOffset = start - index.starts[startIdx];
  const endOffset = end - index.starts[endIdx];
  try {
    const range = document.createRange();
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);
    return range;
  } catch {
    return null;
  }
}

/** True when a click landed inside any of the supplied range's line rects. */
export function rangeContainsPoint(range: Range, x: number, y: number): boolean {
  const rects = range.getClientRects();
  for (const rect of Array.from(rects)) {
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) return true;
  }
  return false;
}
