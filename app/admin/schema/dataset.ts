import { z } from "zod";
import { ResearchDatasetOptionalDefaultsSchema } from "@/prisma/generated/zod/modelSchema/ResearchDatasetSchema";
import { slugField } from "./shared";

const i18nOrString = z.union([
  z.string(),
  z.record(z.string(), z.string()),
]).optional().nullable();

export const datasetSchema = ResearchDatasetOptionalDefaultsSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    slug: slugField,
    title: i18nOrString,
    description: i18nOrString,
    sources: i18nOrString,
    codebookText: i18nOrString,
    regions: z.array(z.string()).default([]),
  });

export const datasetUpdateSchema = datasetSchema.partial();

export type DatasetFormValues = typeof datasetSchema._type;
