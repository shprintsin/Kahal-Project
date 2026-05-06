"use client";

import { useEntityEditor } from "@/app/admin/hooks/useEntityEditor";
import { EntityEditorDialog } from "@/app/admin/components/editors/EntityEditorDialog";
import { periodSchema } from "@/app/admin/schema/period";
import { createPeriodFormConfig } from "@/app/admin/configs/period";
import { createPeriod, updatePeriod, deletePeriod } from "../actions/periods";
import { PeriodEditorProps } from "@/app/admin/types/period";

/**
 * Period Editor - Refactored with config-driven architecture
 * 
 * Before: 214 lines with duplicate CRUD logic
 * After: 55 lines using shared infrastructure
 */
export function PeriodEditor({ period }: PeriodEditorProps) {
  const editor = useEntityEditor({
    entity: period,
    schema: periodSchema,
    actions: {
      create: createPeriod as any,
      update: updatePeriod as any,
      delete: deletePeriod,
    },
    config: {
      entityName: "Period",
      redirectPath: "/admin/periods",
      generateSlug: true,
      slugSource: "name.en",
    },
    defaultValues: {
      slug: period?.slug || "",
      name: {
        en: (period?.name as { en?: string })?.en || (period?.name_i18n as { en?: string })?.en || "",
        he: (period?.name as { he?: string })?.he || (period?.name_i18n as { he?: string })?.he || "",
      },
      dateStart: period?.dateStart
        ? new Date(period.dateStart).toISOString().split("T")[0]
        : "",
      dateEnd: period?.dateEnd
        ? new Date(period.dateEnd).toISOString().split("T")[0]
        : "",
    },
  });

  const formConfig = createPeriodFormConfig();

  return (
    <EntityEditorDialog
      title={period ? "Edit Period" : "New Period"}
      editor={editor}
      sections={[
        {
          title: "Period Details",
          fields: formConfig.details,
          columns: 1,
        },
        {
          title: "Translations",
          fields: formConfig.translations,
        },
      ]}
      maxWidth="2xl"
    />
  );
}
