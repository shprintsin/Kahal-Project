import { z } from "zod";
import { PageOptionalDefaultsSchema } from "@/prisma/generated/zod/modelSchema/PageSchema";
import { slugField } from "./shared";

export const pageSchema = PageOptionalDefaultsSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    slug: slugField,
    tagIds: z.array(z.string()).optional(),
    regionIds: z.array(z.string()).optional(),
  });

export type PageFormValues = z.infer<typeof pageSchema>;

export default function AdminSchemaPagePlaceholder() {
  return null;
}
