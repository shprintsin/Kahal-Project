import { z } from "zod";
import { DatasetOptionalDefaultsSchema } from "@/prisma/generated/zod/modelSchema/DatasetSchema";
import { slugField } from "./shared";

const i18nOrString = z.union([
  z.string(),
  z.record(z.string(), z.string()),
]).optional().nullable();

export const datasetSchema = DatasetOptionalDefaultsSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    titleI18n: true,
    descriptionI18n: true,
    codebookTextI18n: true,
    sourcesI18n: true,
  })
  .extend({
    slug: slugField,
    title: i18nOrString,
    description: i18nOrString,
    summary: i18nOrString,
    sources: i18nOrString,
    codebookText: i18nOrString,
    regions: z.array(z.string()).default([]),
  });

export const datasetUpdateSchema = datasetSchema.partial();

export type DatasetFormValues = z.infer<typeof datasetSchema>;
