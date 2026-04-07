import type { Prisma } from '@prisma/client';

/**
 * Narrow, named, greppable cast for Prisma JSON columns.
 *
 * Prisma's `Json` columns expect `Prisma.InputJsonValue`, which is structurally
 * compatible with most plain objects but TypeScript can't always infer that
 * relationship — especially after a Zod parse where the inferred type contains
 * optional fields or unions. Use this helper instead of bare `as any` so the
 * intent is documented and the cast is greppable across the codebase.
 *
 * The runtime is identical to `as unknown as Prisma.InputJsonValue`.
 */
export function asJson<T>(v: T): Prisma.InputJsonValue {
  return v as unknown as Prisma.InputJsonValue;
}
