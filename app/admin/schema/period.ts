import { z } from "zod";
import { PeriodOptionalDefaultsSchema } from "@/prisma/generated/zod/modelSchema/PeriodSchema";
import { slugField, i18nRecord } from "./shared";

export const periodSchema = PeriodOptionalDefaultsSchema
  .omit({ id: true, createdAt: true })
  .extend({
    slug: slugField,
    nameI18n: i18nRecord,
    dateStart: z.string().optional().nullable(),
    dateEnd: z.string().optional().nullable(),
  });

export type PeriodFormValues = z.infer<typeof periodSchema>;
