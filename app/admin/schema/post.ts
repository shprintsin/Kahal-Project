import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  content: z.string().optional(),
  language: z.enum(["EN", "HE", "PL"]).default("HE"),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  author_id: z.string(),
  thumbnail_id: z.string().optional().nullable(),
  translation_group_id: z.string(),
  category_id: z.string().optional().nullable(),
});

export type PostFormValues = z.infer<typeof postSchema>;
