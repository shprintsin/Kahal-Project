"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Loader2, Save, Trash } from "lucide-react";
import { FormSection } from "./form-field-renderer";
import { EntityEditorDialogProps } from "@/app/admin/types/common";

/**
 * Unified dialog editor component with consistent layout and built-in CRUD buttons
 * Eliminates duplicate UI code across all dialog editors
 * 
 * @example
 * <EntityEditorDialog
 *   title="Edit Category"
 *   editor={editor}
 *   sections={[
 *     { title: "Details", fields: detailFields },
 *     { title: "Translations", fields: translationFields },
 *   ]}
 *   maxWidth="2xl"
 * />
 */
export function EntityEditorDialog({
  title,
  editor,
  sections,
  maxWidth = "2xl",
  className = "",
}: EntityEditorDialogProps) {
  const { form, loading, deleting, isNew, handleSubmit, handleDelete } = editor;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className={`${maxWidthClasses[maxWidth]} space-y-6 ${className}`}>
        {/* Sections */}
        {sections.map((section, index) => (
          <Card key={index}>
            {section.title && (
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
            )}
            <CardContent className={section.title ? "" : "pt-6"}>
              <FormSection
                control={form.control}
                fields={section.fields}
                columns={section.columns || 1}
              />
            </CardContent>
          </Card>
        ))}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button type="submit" disabled={loading || deleting}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {isNew ? `Create` : `Update`}
          </Button>

          {!isNew && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || loading}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
