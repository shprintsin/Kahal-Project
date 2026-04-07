# shared-schemas

Zod schemas that are the **single source of truth** for map / layer / dataset
configuration shapes used throughout the Next.js app.

## Source-of-truth relationship

Until the `mapstudio` CLI is fully merged into this repository, two physical
copies of the schemas exist:

- **This folder (`app/lib/shared-schemas/`) — the source of truth.**
- `mapstudio/packages/shared/src/schemas/` — a one-way mirror.

The `mapstudio` sibling repo keeps its own copy because it ships as a
standalone npm package (`@kahal/shared`) and cannot import from this app.
That copy is synced manually from this folder; it must not diverge.

When you change a schema here, propagate the same change to the matching
file in `mapstudio/packages/shared/src/schemas/`.

## Why this folder exists (Phase 0 of the unification)

Before this lift, `app/types/map-config.ts` contained hand-written
`interface` declarations that duplicated the Zod definitions in
`mapstudio/packages/shared/src/schemas/map-config.ts`. The two were kept in
sync via a `// keep in sync manually` comment, which is brittle.

Phase 0 moves the schemas into the app so:

- `app/types/map-config.ts` becomes a thin re-export shim.
- New code can `import { MapConfigSchema } from '@/lib/shared-schemas'` and
  validate runtime data with the same shapes the type system uses.
- There is one place to edit when a field is added or renamed.

## Compatibility notes

- The schemas use Zod v4 (`z.record(keyType, valueType)` form,
  `z.string().url()`, etc.).
- Inferred types use `z.infer<typeof Schema>` which produces the *parsed
  output* shape — fields with `.default(...)` are non-optional in the
  inferred type.
- `unified-config.ts` from the mapstudio sibling is intentionally not
  copied here: it depends on the `compiler/resolve` module that lives
  outside the schemas folder and is only used by the CLI compiler. If the
  app ever needs `UnifiedConfigSchema`, lift it together with its
  dependency tree.

## Layout

```
shared-schemas/
  enums.ts        — small enum schemas (status, basemap, geometry type, ...)
  map-config.ts   — TileConfig, LayerConfig, MapConfig, styles, behaviors, ...
  map-input.ts    — MapInputSchema (CLI deploy payload)
  layer-input.ts  — LayerInputSchema (CLI deploy payload)
  data-input.ts   — DatasetInputSchema and the minimal data.yaml shape
  index.ts        — barrel export
```
