import { FieldConfig } from "@/app/admin/components/editors/form-field-renderer";
import { PageFormValues } from "@/app/admin/schema/page";
import { EditorLayout } from "@/app/admin/configs/editor-layout-types";
import { extractI18nName } from "@/app/admin/utils/slug";

export const createPageFormConfig = (parentPages: any[]) => ({
  // These fields will be handled by custom components (SlugCard, MDEditor)
  // We don't need them in the standardform config
  
  pageSettings: [
    {
      name: "parent_id",
      label: "Parent Page",
      type: "select",
      options: [
        { value: "none", label: "No Parent" },
        ...parentPages.map((p) => ({
          value: p.id,
          label: extractI18nName(p.titleI18n, p.title),
        })),
      ],
    },
    {
      name: "menu_order",
      label: "Menu Order",
      type: "number",
      description: "Lower numbers appear first",
    },
    {
      name: "show_in_menu",
      label: "Show in Menu",
      type: "switch",
    },
  ] as FieldConfig<PageFormValues>[],

  seo: [
    {
      name: "meta_description",
      label: "Meta Description",
      type: "textarea",
      rows: 3,
      placeholder: "SEO description for search engines",
      description: "Character count shown below",
    },
  ] as FieldConfig<PageFormValues>[],
});

export const createPageEditorLayout = (
  parentPages: any[],
  authorName: string,
  authorEmail: string,
  formConfig: ReturnType<typeof createPageFormConfig>
): EditorLayout<PageFormValues> => ({
  main: [
    { type: "slug", title: "title", slug: "slug", slugPrefix: "/pages/" },
    { type: "textarea", field: "excerpt", title: "Excerpt", description: "Brief description for previews", rows: 3, placeholder: "Brief description for previews" },
    { type: "markdown", field: "content", title: "Content", description: "Write your page content in Markdown", height: 600 },
  ],
  sidebar: [
    { type: "publish", statusField: "status", languageField: "language", authorName, authorEmail },
    { type: "form", title: "Page Settings", fields: formConfig.pageSettings, columns: 1 },
    { type: "form", title: "SEO", fields: formConfig.seo, columns: 1 },
  ],
});
