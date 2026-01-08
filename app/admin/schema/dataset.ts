import { z } from "zod";

export const datasetSchema = z.object({
  // Title will now be an object in the form { he: "...", en: "..." }
  // We validate existence of 'he' (main title) in the resolver or custom check if needed, 
  // but z.any() allows the object to pass through to the server action.
  // Content fields - will handle both main (HE) and translations
  title: z.any(),
  slug: z.string().min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  description: z.any(),
  sources: z.any(),
  codebookText: z.any(),
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

export type DatasetFormValues = z.infer<typeof datasetSchema>;
