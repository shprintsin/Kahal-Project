import { z } from "zod";
import { ArtifactOptionalDefaultsSchema } from "@/prisma/generated/zod/modelSchema/ArtifactSchema";
import { slugField } from "./shared";

export const artifactSchema = ArtifactOptionalDefaultsSchema
  .omit({ id: true, createdAt: true })
  .extend({
    slug: slugField,
    dateSort: z.string().nullable().optional(),
    placeIds: z.array(z.string()).default([]),
    periodIds: z.array(z.string()).default([]),
    regionIds: z.array(z.string()).default([]),
    tagIds: z.array(z.string()).default([]),
    pageIds: z.array(z.string()).default([]),
  });

export type ArtifactFormValues = typeof artifactSchema._type;
