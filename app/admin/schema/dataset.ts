import { z } from "zod";

const i18nOrString = z.union([
  z.string(),
  z.record(z.string(), z.string()),
]).optional().nullable();

export const datasetSchema = z.object({
  title: i18nOrString,
  slug: z.string().min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  description: i18nOrString,
  sources: i18nOrString,
  codebookText: i18nOrString,
  citationText: z.string().optional(),

  categoryId: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  isVisible: z.boolean().default(true),
  maturity: z.enum(["Raw", "Preliminary", "Provisional", "Validated"]).default("Provisional"),
  version: z.string().default("1.0.0"),
  license: z.string().optional(),
  minYear: z.coerce.number().optional().nullable(),
  maxYear: z.coerce.number().optional().nullable(),

  thumbnailId: z.string().optional().nullable(),
  regions: z.array(z.string()).default([]),
});

export const datasetUpdateSchema = datasetSchema.partial();

export type DatasetFormValues = z.infer<typeof datasetSchema>;
