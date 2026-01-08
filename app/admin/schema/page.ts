import { z } from "zod";

export const pageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  meta_description: z.string().optional(),
  language: z.enum(["EN", "HE", "PL"]).default("HE"),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  author_id: z.string(),
  parent_id: z.string().optional().nullable(),
  template: z.string().default("default"),
  menu_order: z.number().default(0),
  show_in_menu: z.boolean().default(true),
  translation_group_id: z.string(),
});

export type PageFormValues = z.infer<typeof pageSchema>;

// Placeholder default export so this file isn't treated as a missing page by Next.js.
export default function AdminSchemaPagePlaceholder() {
  return null;
}
