import { ReactNode } from "react";
import { UseFormReturn } from "react-hook-form";
import { FieldConfig } from "@/app/admin/components/editors/form-field-renderer";

export type EditorBlock<TFormValues> =
  | { type: "slug"; title: string; slug: string; slugPrefix?: string }
  | { type: "markdown"; field: keyof TFormValues & string; title: string; description?: string; height?: number; placeholder?: string }
  | { type: "textarea"; field: keyof TFormValues & string; title: string; description?: string; rows?: number; placeholder?: string }
  | { type: "publish"; statusField: keyof TFormValues & string; languageField: keyof TFormValues & string; authorName: string; authorEmail: string }
  | { type: "form"; title: string; description?: string; fields: FieldConfig<any>[]; columns?: 1 | 2 }
  | { type: "featuredImage"; field: keyof TFormValues & string; mediaList: any[]; uploading: boolean; onUpload: (file: File) => Promise<any> }
  | { type: "tags"; tags: any[]; selectedTagIds: string[]; onChange: (ids: string[]) => void; onCreateTag: (slug: string) => Promise<any> }
  | { type: "category"; field: keyof TFormValues & string; categories: any[]; languageField?: keyof TFormValues & string; onCreateCategory?: (name: string, language: any) => Promise<any> }
  | { type: "custom"; render: (context: { form: UseFormReturn<any> }) => ReactNode };

export interface EditorLayout<TFormValues> {
  main: EditorBlock<TFormValues>[];
  sidebar: EditorBlock<TFormValues>[];
}
