import { z } from "zod";
import { LayerOptionalDefaultsSchema } from "@/prisma/generated/zod/modelSchema/LayerSchema";
import { slugField, i18nRecord } from "./shared";

export const layerSchema = LayerOptionalDefaultsSchema
  .omit({ id: true, createdAt: true, updatedAt: true, thumbnail: true })
  .extend({
    slug: slugField,
    name_i18n: i18nRecord,
    description_i18n: i18nRecord,
    citation_text_i18n: i18nRecord,
    codebook_text_i18n: i18nRecord,
    sources_i18n: i18nRecord,
    geoJsonData: z.any().optional().nullable(),
    styleConfig: z.any().optional(),
    tagIds: z.array(z.string()).optional(),
    regionIds: z.array(z.string()).optional(),
  });

export type LayerFormValues = typeof layerSchema._type;
