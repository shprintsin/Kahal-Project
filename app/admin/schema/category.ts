import { CategoryOptionalDefaultsSchema } from "@/prisma/generated/zod/modelSchema/CategorySchema";
import { slugField } from "./shared";

export const categorySchema = CategoryOptionalDefaultsSchema
  .omit({ id: true, createdAt: true })
  .extend({ slug: slugField });

export type CategoryFormValues = typeof categorySchema._type;
