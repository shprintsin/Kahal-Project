/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import {
  getIndex,
  offsetsToRange,
  rangeToOffsets,
} from '../anchor';

function build(html: string): HTMLElement {
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
  return div;
}

describe('FlatTextIndex', () => {
  it('round-trips a Range across paragraphs', () => {
    const root = build(`
      <article>
        <p>Hello <strong>brave</strong> world.</p>
        <p>Second paragraph here.</p>
      </article>
    `);
    const idx = getIndex(root, 'v1');
    // pick "brave" — wholly inside the strong tag
    const strong = root.querySelector('strong')!;
    const textNode = strong.firstChild as Text;
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 5);

    const offsets = rangeToOffsets(root, range, idx);
    expect(offsets).not.toBeNull();
    expect(offsets!.end - offsets!.start).toBe(5);

    const restored = offsetsToRange(root, offsets!.start, offsets!.end, idx);
    expect(restored).not.toBeNull();
    expect(restored!.toString()).toBe('brave');
  });

  it('handles selections that span multiple text nodes', () => {
    const root = build(`<p>Alpha <em>beta</em> gamma</p>`);
    const idx = getIndex(root, 'v1');
    const alphaNode = root.querySelector('p')!.firstChild as Text; // "Alpha "
    const gammaNode = (root.querySelector('p')!.lastChild as Text); // " gamma"
    const range = document.createRange();
    range.setStart(alphaNode, 6); // start at "beta"-ish — actually after "Alpha "
    range.setEnd(gammaNode, 6); // end at end of " gamma"
    const offsets = rangeToOffsets(root, range, idx);
    expect(offsets).not.toBeNull();
    const restored = offsetsToRange(root, offsets!.start, offsets!.end, idx);
    expect(restored).not.toBeNull();
    expect(restored!.toString()).toBe('beta gamma');
  });

  it('skips text inside .page-marker chrome', () => {
    // No whitespace between blocks — react-markdown's output is similarly
    // dense, with only inline text in the accepted text-node walk.
    const root = build(
      `<article><p>before</p>` +
        `<span class="page-marker"><span class="page-marker-num">— 1 —</span></span>` +
        `<p>after</p></article>`,
    );
    const idx = getIndex(root, 'v1');
    expect(idx.totalLength).toBe('before'.length + 'after'.length);
    const r = offsetsToRange(root, 'before'.length, 'before'.length + 5, idx);
    expect(r).not.toBeNull();
    expect(r!.toString()).toBe('after');
  });

  it('caches per (container, contentVersion) and rebuilds on version change', () => {
    const root = build(`<p>One</p>`);
    const idx1 = getIndex(root, 'v1');
    const idx1Again = getIndex(root, 'v1');
    expect(idx1Again).toBe(idx1); // same reference — cached
    const idx2 = getIndex(root, 'v2');
    expect(idx2).not.toBe(idx1); // bumped version invalidates
  });

  it('returns null when offsets exceed the document length', () => {
    const root = build(`<p>Short</p>`);
    const idx = getIndex(root, 'v1');
    expect(offsetsToRange(root, 0, 9999, idx)).toBeNull();
  });

  it('binary-search locate is correct on many text nodes', () => {
    // 200 paragraphs, each "abc" → 600 chars, 200 nodes.
    const html = Array.from({ length: 200 }, (_, i) => `<p>${i.toString().padStart(3, '0')}</p>`).join('');
    const root = build(html);
    const idx = getIndex(root, 'v1');
    expect(idx.nodes.length).toBe(200);
    expect(idx.totalLength).toBe(200 * 3);
    // Pick the 137th paragraph: starts at 137*3.
    const offset = 137 * 3;
    const r = offsetsToRange(root, offset, offset + 3, idx);
    expect(r).not.toBeNull();
    expect(r!.toString()).toBe('137');
  });
});
