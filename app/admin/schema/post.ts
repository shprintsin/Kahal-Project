import { z } from "zod";
import { PostOptionalDefaultsSchema } from "@/prisma/generated/zod/modelSchema/PostSchema";
import { slugField } from "./shared";

export const postSchema = PostOptionalDefaultsSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    slug: slugField,
    categoryIds: z.array(z.string()).optional(),
    regionIds: z.array(z.string()).optional(),
    tagNames: z.array(z.string()).optional(),
  });

export type PostFormValues = typeof postSchema._type;
