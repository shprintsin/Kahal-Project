// Source of truth for the API layer-input schema. Originally lived in
// mapstudio/packages/shared/src/schemas/layer-input.ts and was duplicated here
// as part of the Phase 0 lift.

import { z } from 'zod';
import { LayerTypeSchema, ContentStatusSchema } from './enums';

export const LayerInputSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().default(''),
  summary: z.string().optional(),
  type: LayerTypeSchema,
  status: ContentStatusSchema.default('draft'),
  geoJsonData: z.any(),
  style: z.any().optional(),
  labels: z.any().optional(),
  popup: z.any().optional(),
  filter: z.any().optional(),
  year: z.number().optional(),
});
export type LayerInput = z.infer<typeof LayerInputSchema>;
