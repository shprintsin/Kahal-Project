// Re-exports from app/lib/shared-schemas. The schemas were originally
// duplicated in mapstudio/packages/shared/src/schemas/ — they are now lifted
// here as the source of truth. See app/lib/shared-schemas/README.md.
//
// This file is a thin shim kept around so existing imports of
// `@/types/map-config` keep resolving. New code should import from
// `@/lib/shared-schemas` directly.

export * from '@/lib/shared-schemas';

// ── Backwards-compatible aliases ────────────────────────────────────────
// The shared schemas name the behaviors block `Behaviors` (and infer it as
// optional because of how it is wrapped in MapConfigSchema). The pre-lift
// app code referenced it as `BehaviorsConfig` and treated it as a
// non-undefined object. Re-export the inner non-optional shape under the
// historical name so existing imports continue to compile.
import type { Behaviors } from '@/lib/shared-schemas';
export type BehaviorsConfig = NonNullable<Behaviors>;
