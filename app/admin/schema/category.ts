import { z } from "zod";

export const categorySchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  titleI18n: z.record(z.string(), z.string().nullable().optional()).optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
