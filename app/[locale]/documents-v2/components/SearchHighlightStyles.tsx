'use client';

import React from 'react';

// Inlined to bypass Lightning CSS — Next 16's CSS pipeline doesn't yet
// recognise the ::highlight() pseudo-element from the CSS Custom Highlight API.
// Hosts both the in-doc search overlay (`docSearch`/`docSearchActive`) and the
// persistent user highlights (`docUserHighlight`).
const STYLES = `
::highlight(docSearch) {
  background-color: rgb(254 240 138);
  color: rgb(20 20 20);
}
::highlight(docSearchActive) {
  background-color: rgb(251 146 60);
  color: rgb(20 20 20);
}
::highlight(docUserHighlight) {
  background-color: #ede4b8;
  color: inherit;
}
`;

export function SearchHighlightStyles() {
  return <style dangerouslySetInnerHTML={{ __html: STYLES }} />;
}
