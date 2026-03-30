import { z } from "zod";
import { DatasetOptionalDefaultsSchema } from "@/prisma/generated/zod/modelSchema/DatasetSchema";
import { slugField, i18nRecord } from "./shared";

export const mapSchema = DatasetOptionalDefaultsSchema
  .omit({ id: true, createdAt: true, updatedAt: true, title: true, description: true })
  .extend({
    slug: slugField,
    title_i18n: z.record(z.string(), z.string().nullable().optional()).refine(
      (val) => Object.keys(val).length > 0,
      { message: "At least one title translation is required" }
    ),
    description_i18n: i18nRecord,
    period_start_date: z.string().optional(),
    period_end_date: z.string().optional(),
    config: z.any().optional(),
    yearMin: z.string().optional(),
    yearMax: z.string().optional(),
    year: z.string().optional(),
    period: z.string().optional(),
    categoryId: z.string().optional(),
    tagIds: z.array(z.string()).optional(),
    regionIds: z.array(z.string()).optional(),
    globalStyleConfig: z.any().optional().nullable(),
    referenceLinks: z.array(z.unknown()).optional().nullable(),
  });

export type MapFormValues = typeof mapSchema._type;
