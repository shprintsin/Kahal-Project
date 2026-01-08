import { z } from "zod";

export const tagSchema = z.object({
  slug: z.string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  nameI18n: z.object({
    en: z.string().optional().nullable(),
    he: z.string().optional().nullable(),
    pl: z.string().optional().nullable(),
  }).refine(
    (val) => val.en || val.he || val.pl,
    { message: "At least one name translation is required" }
  ),
});

export type TagFormValues = z.infer<typeof tagSchema>;
