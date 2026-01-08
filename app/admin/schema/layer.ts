import { z } from "zod";

export const layerSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  name: z.string().min(1, "Name is required"),
  name_i18n: z.record(z.string(), z.string()).optional(),
  description: z.string().optional(),
  description_i18n: z.record(z.string(), z.string()).optional(),
  status: z.enum(["draft", "published", "archived"]),
  version: z.string().optional(),
  categoryId: z.string().optional(),
  type: z.enum(["POINTS", "POLYGONS", "POLYLINES", "MULTI_POLYGONS", "RASTER"]),
  citationText: z.string().optional(),
  citation_text_i18n: z.record(z.string(), z.string()).optional(),
  codebookText: z.string().optional(),
  codebook_text_i18n: z.record(z.string(), z.string()).optional(),
  sources: z.string().optional(),
  sources_i18n: z.record(z.string(), z.string()).optional(),
  license: z.string().optional(),
  maturity: z.enum(["Raw", "Preliminary", "Provisional", "Validated"]).optional(),
  minYear: z.number().optional(),
  maxYear: z.number().optional(),
  sourceType: z.enum(["url", "database", "inline"]).optional(),
  sourceUrl: z.string().optional(),
  downloadUrl: z.string().optional(),
  geoJsonData: z.any().optional(),
  styleConfig: z.any().optional(),
  tagIds: z.array(z.string()).optional(),
  regionIds: z.array(z.string()).optional(),
});

export type LayerFormValues = z.infer<typeof layerSchema>;
