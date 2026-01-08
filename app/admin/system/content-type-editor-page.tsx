"use client";

/**
 * ContentTypeEditorPage
 * 
 * A ready-to-use editor page component for any content type.
 * Renders a full-featured editor with auto-save, delete, and navigation.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { ContentTypeDefinition } from "./content-type-registry";
import { DynamicEditor } from "./dynamic-editor";
import type { GenericActions } from "./create-generic-actions";

interface ContentTypeEditorPageProps<T extends { id?: string }> {
  contentType: ContentTypeDefinition;
  entity?: T | null;
  actions: GenericActions<T>;
}

export function ContentTypeEditorPage<T extends { id?: string }>({
  contentType,
  entity,
  actions,
}: ContentTypeEditorPageProps<T>) {
  const router = useRouter();
  const isNew = !entity?.id;
  
  // State
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [isDirty, setIsDirty] = React.useState(false);
  
  // Handle save
  const handleSave = async (data: any) => {
    setSaving(true);
    try {
      if (isNew) {
        const created = await actions.create(data);
        router.push(`/admin/${contentType.slug}/${created.id}`);
      } else {
        await actions.update(entity!.id!, data);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };
  
  // Handle delete
  const handleDelete = async () => {
    if (!entity?.id) return;
    
    setDeleting(true);
    try {
      await actions.delete(entity.id);
      router.push(`/admin/${contentType.slug}`);
    } finally {
      setDeleting(false);
    }
  };
  
  // Warn on unsaved changes
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/admin/${contentType.slug}`)}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <div className="flex-1">
          <h1 className="text-lg font-semibold">
            {isNew ? `New ${contentType.name}` : `Edit ${contentType.name}`}
          </h1>
          {isDirty && (
            <p className="text-xs text-muted-foreground">Unsaved changes</p>
          )}
        </div>
        
        {saving && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </div>
        )}
      </div>
      
      {/* Editor */}
      <div className="flex-1 overflow-auto p-6">
        <DynamicEditor
          contentType={contentType}
          entity={entity}
          onSave={handleSave}
          onDelete={!isNew ? handleDelete : undefined}
          saving={saving}
          deleting={deleting}
          onDirtyChange={setIsDirty}
        />
      </div>
    </div>
  );
}
