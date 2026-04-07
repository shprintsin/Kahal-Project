/**
 * Helper for marking legacy public API routes as deprecated.
 *
 * The old `/api/maps`, `/api/layers`, `/api/posts`, etc. routes were
 * collapsed into the registry-driven `/api/v1/{type}` namespace in A-4.
 * For backward compatibility we keep the old routes serving the exact
 * legacy response shapes, but every response carries:
 *
 *   Deprecation: true
 *   Link: </api/v1/{successor}>; rel="successor-version"
 *
 * and a one-time `console.warn` so external consumers see a clear migration
 * signal without their integrations breaking.
 */

const warnedPaths = new Set<string>();

export function deprecationHeaders(successorPath: string): HeadersInit {
  return {
    Deprecation: "true",
    Link: `<${successorPath}>; rel="successor-version"`,
  };
}

export function warnDeprecated(legacyPath: string, successorPath: string): void {
  if (warnedPaths.has(legacyPath)) return;
  warnedPaths.add(legacyPath);
  console.warn(
    `[deprecated] ${legacyPath} is deprecated; use ${successorPath} instead`
  );
}
