import { z } from "zod";

export const mapSchema = z.object({
  title_i18n: z.record(z.string(), z.string().nullable().optional()).refine(
    (val) => Object.keys(val).length > 0,
    { message: "At least one title translation is required" }
  ),
  description_i18n: z.record(z.string(), z.string().nullable().optional()).optional(),
  slug: z.string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  status: z.enum(["draft", "published", "archived"]).optional(),
  period_start_date: z.string().optional(),
  period_end_date: z.string().optional(),
  config: z.any().optional(), // Map configuration (layers, tiles, etc.)
});

export type MapFormValues = z.infer<typeof mapSchema>;
