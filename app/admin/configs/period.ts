import { FieldConfig } from "@/app/admin/components/editors/form-field-renderer";
import { PeriodFormValues } from "@/app/admin/schema/period";

export const createPeriodFormConfig = () => ({
  details: [
    {
      name: "slug",
      label: "Slug",
      type: "text",
      required: true,
      placeholder: "period-slug",
      description: "URL-friendly identifier (lowercase, hyphens only)",
    },
    {
      name: "dateStart",
      label: "Start Date",
      type: "date",
    },
    {
      name: "dateEnd",
      label: "End Date",
      type: "date",
    },
  ] as FieldConfig<PeriodFormValues>[],

  translations: [
    {
      name: "nameI18n.en",
      label: "🇺🇸 English",
      type: "text",
      placeholder: "Post WWI",
    },
    {
      name: "nameI18n.he",
      label: "🇮🇱 Hebrew (עברית)",
      type: "text",
      placeholder: "אחרי מלחמת העולם הראשונה",
    },
  ] as FieldConfig<PeriodFormValues>[],
});
