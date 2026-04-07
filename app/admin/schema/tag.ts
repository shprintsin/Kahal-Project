import { z } from "zod";
import { TagOptionalDefaultsSchema } from "@/prisma/generated/zod/modelSchema/TagSchema";
import { slugField } from "./shared";

export const tagSchema = TagOptionalDefaultsSchema
  .omit({ id: true, createdAt: true })
  .extend({
    slug: slugField,
    nameI18n: z.object({
      en: z.string().nullable().optional(),
      he: z.string().nullable().optional(),
      pl: z.string().nullable().optional(),
    }).refine(
      (val) => val.en || val.he || val.pl,
      { message: "At least one name translation is required" }
    ),
  });

export type TagFormValues = z.infer<typeof tagSchema>;
