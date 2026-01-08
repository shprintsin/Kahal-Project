import { z } from "zod";

export const periodSchema = z.object({
  slug: z.string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  name: z.string().optional(), // Fallback name
  nameI18n: z.object({
    en: z.string().optional().nullable(),
    he: z.string().optional().nullable(),
    pl: z.string().optional().nullable(),
  }),
  dateStart: z.string().optional().nullable(),
  dateEnd: z.string().optional().nullable(),
});

export type PeriodFormValues = z.infer<typeof periodSchema>;
