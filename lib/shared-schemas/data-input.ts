// Source of truth for the dataset/data-input schemas. Originally lived in
// mapstudio/packages/shared/src/schemas/data-input.ts and was duplicated here
// as part of the Phase 0 lift.

import { z } from 'zod';
import { ContentStatusSchema, DataMaturitySchema, ResourceTypeSchema } from './enums';

// ── Resource inside data.yaml (what the user writes) ────────────
export const MinimalDataResourceSchema = z.object({
  file: z.string().min(1),
  name: z.string().optional(),
  format: ResourceTypeSchema.optional(),
  isMainFile: z.boolean().default(false),
  excerpt: z.string().optional(),
});
export type MinimalDataResource = z.infer<typeof MinimalDataResourceSchema>;

// ── MinimalDataYamlSchema (what the user writes in data.yaml) ───
export const MinimalDataYamlSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(1),
  description: z.string().default(''),
  summary: z.string().optional(),
  maturity: DataMaturitySchema.default('Raw'),
  version: z.string().default('1.0.0'),
  license: z.string().optional(),
  citationText: z.string().optional(),
  minYear: z.number().int().optional(),
  maxYear: z.number().int().optional(),
  category: z.string().optional(),
  regions: z.array(z.string()).default([]),
  resources: z.array(MinimalDataResourceSchema).default([]),
});
export type MinimalDataYaml = z.infer<typeof MinimalDataYamlSchema>;

// ── Resource in API payload (after upload, has URL) ─────────────
export const DatasetResourceInputSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  url: z.string().min(1),
  filename: z.string().optional(),
  mimeType: z.string().optional(),
  format: ResourceTypeSchema.default('UNKNOWN'),
  sizeBytes: z.number().optional(),
  isMainFile: z.boolean().default(false),
  excerptI18n: z.record(z.string(), z.string()).optional(),
});
export type DatasetResourceInput = z.infer<typeof DatasetResourceInputSchema>;

// ── DatasetInputSchema (API payload for deploying a dataset) ────
export const DatasetInputSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(1),
  description: z.string().default(''),
  summary: z.string().optional(),
  status: ContentStatusSchema.default('draft'),
  maturity: DataMaturitySchema.default('Raw'),
  version: z.string().default('1.0.0'),
  license: z.string().nullable().optional(),
  citationText: z.string().nullable().optional(),
  minYear: z.number().int().nullable().optional(),
  maxYear: z.number().int().nullable().optional(),
  isVisible: z.boolean().default(true),
  categorySlug: z.string().optional(),
  regionSlugs: z.array(z.string()).default([]),
  titleI18n: z.record(z.string(), z.string()).optional(),
  descriptionI18n: z.record(z.string(), z.string()).optional(),
  codebookTextI18n: z.record(z.string(), z.string()).optional(),
  sourcesI18n: z.record(z.string(), z.string()).optional(),
  thumbnailId: z.string().optional(),
  resources: z.array(DatasetResourceInputSchema).default([]),
  gitSha: z.string().optional(),
  cliVersion: z.string().optional(),
});
export type DatasetInput = z.infer<typeof DatasetInputSchema>;
