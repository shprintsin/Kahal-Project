import { z } from "zod";

export const artifactSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  artifactCategoryId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  descriptionI18n: z.any().optional(),
  content: z.string().optional().nullable(),
  contentI18n: z.any().optional(),
  year: z.coerce.number().optional().nullable(),
  dateDisplay: z.string().optional().nullable(),
  dateSort: z.string().optional().nullable(),
  excerpt: z.string().optional().nullable(),
  excerptI18n: z.any().optional(),
  displayScans: z.boolean().default(true),
  displayTexts: z.boolean().default(true),
  sources: z.array(z.string()).default([]),
  placeIds: z.array(z.string()).default([]),
  periodIds: z.array(z.string()).default([]),
  titleI18n: z.any().optional(),
});

export type ArtifactFormValues = z.infer<typeof artifactSchema>;
