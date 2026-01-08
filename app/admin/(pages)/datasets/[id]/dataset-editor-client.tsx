"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  LoopStyleEditor,
  UnifiedCanvas,
  MetadataSidebar,
  FileTree,
  ContentLanguageProvider,
  useContentLanguage,
  EditorContextMenu,
} from "@/app/admin/components/content";
import type { ContentLanguage, ContentStatus } from "@/app/admin/types/content-system.types";
import type { FileTreeItem } from "@/app/admin/components/content/file-tree";
import { createDataset, updateDataset } from "@/app/admin/actions/datasets";

interface DatasetEditorClientProps {
  dataset: any;
  tags: any[];
  datasets: any[];
  isNew: boolean;
}

function EditorInner({ dataset, tags, datasets, isNew }: DatasetEditorClientProps) {
  const router = useRouter();
  const datasetId = dataset?.id;

  const {
    currentLanguage,
    setLanguage,
    getTranslation,
    updateField,
  } = useContentLanguage();

  // Form state
  const [isDirty, setIsDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);

  // Metadata
  const [status, setStatus] = React.useState<ContentStatus>(dataset?.status || "draft");
  const [allTags] = React.useState(tags.map((t: any) => t.name));
  const [datasetTags, setDatasetTags] = React.useState(dataset?.tags?.map((t: any) => t.name) || []);
  const [createdAt] = React.useState(dataset ? new Date(dataset.createdAt).toLocaleDateString() : "");
  const [updatedAt] = React.useState(dataset ? new Date(dataset.updatedAt).toLocaleDateString() : "");
  const [isPublic, setIsPublic] = React.useState(true);
  const [license, setLicense] = React.useState("");
  const [attachments, setAttachments] = React.useState<any[]>([]);

  // Initialize dataset data in language provider - only once per ID
  React.useEffect(() => {
    if (dataset) {
      updateField("title", dataset.title || "");
      updateField("slug", dataset.slug || "");
      updateField("content", dataset.description || "");
      updateField("excerpt", dataset.excerpt || "");
    }
  }, [datasetId]);

  // Translated values
  const title = getTranslation<string>("title", "") ?? "";
  const slug = getTranslation<string>("slug", "") ?? "";
  const content = getTranslation<string>("content", "") ?? "";
  const excerpt = getTranslation<string>("excerpt", "") ?? "";

  // Handlers
  const handleFieldChange = (field: string, value: string) => {
    updateField(field, value);
    setIsDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        title,
        slug,
        description: content,
        excerpt,
        status,
        tagNames: datasetTags,
      };

      if (isNew) {
        const newDataset = await createDataset(data);
        toast.success("Created successfully");
        router.push(`/admin/datasets/${newDataset.id}`);
      } else {
        await updateDataset(datasetId, data);
        toast.success("Saved successfully");
      }
      setIsDirty(false);
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const data = {
        title,
        slug,
        description: content,
        excerpt,
        status: "published" as ContentStatus,
      };

      if (isNew) {
        const newDataset = await createDataset(data);
        toast.success("Published!");
        router.push(`/admin/datasets/${newDataset.id}`);
      } else {
        await updateDataset(datasetId, data);
        setStatus("published");
        toast.success("Published!");
      }
      setIsDirty(false);
    } catch (error) {
      console.error("Publish failed:", error);
      toast.error("Failed to publish");
    } finally {
      setPublishing(false);
    }
  };

  const handleLanguageChange = (lang: ContentLanguage) => {
    setLanguage(lang);
    toast.info(`Switched to ${lang.toUpperCase()}`);
  };

  // File tree from datasets
  const fileTreeItems: FileTreeItem[] = React.useMemo(() => {
    return datasets.slice(0, 20).map((d: any) => ({
      id: d.id,
      name: d.title || d.slug || "Untitled",
      slug: d.slug,
      type: "file" as const,
      path: `/datasets/${d.id}`,
      status: d.status,
    }));
  }, [datasets]);

  const handleFileSelect = (item: FileTreeItem) => {
    if (item.path) {
      router.push(`/admin${item.path}`);
    }
  };

  const fileTree = (
    <FileTree
      items={fileTreeItems}
      currentFileId={datasetId}
      onFileSelect={handleFileSelect}
      onFileCreate={() => router.push("/admin/datasets/new")}
    />
  );

  const sidebar = (
    <MetadataSidebar
      status={status}
      onStatusChange={setStatus}
      category=""
      onCategoryChange={() => {}}
      categoryOptions={[]}
      createdAt={createdAt}
      updatedAt={updatedAt}
      isPublic={isPublic}
      onVisibilityChange={setIsPublic}
      license={license}
      onLicenseChange={setLicense}
      tags={datasetTags}
      onTagsChange={setDatasetTags}
      tagSuggestions={allTags}
      attachments={attachments}
      onAttachmentsChange={setAttachments}
    />
  );

  return (
    <LoopStyleEditor
      backHref="/admin/datasets"
      backLabel="Datasets"
      onBack={() => router.push("/admin/datasets")}
      onSave={handleSave}
      onPublish={handlePublish}
      saving={saving}
      publishing={publishing}
      isDirty={isDirty}
      currentLanguage={currentLanguage}
      onLanguageChange={handleLanguageChange}
      showLanguageToggle={!isNew}
      fileTree={fileTree}
      sidebar={sidebar}
    >
      <EditorContextMenu onAction={(action) => toast.info(`Action: ${action}`)}>
        <div>
          <UnifiedCanvas
            title={title}
            onTitleChange={(v) => handleFieldChange("title", v)}
            slug={slug}
            onSlugChange={(v) => handleFieldChange("slug", v)}
            slugPrefix="/datasets/"
            description={excerpt}
            onDescriptionChange={(v) => handleFieldChange("excerpt", v)}
            content={content}
            onContentChange={(v) => handleFieldChange("content", v)}
            contentPlaceholder="Describe this dataset..."
          />
        </div>
      </EditorContextMenu>
    </LoopStyleEditor>
  );
}

export function DatasetEditorClient(props: DatasetEditorClientProps) {
  return (
    <ContentLanguageProvider defaultLanguage="en">
      <EditorInner {...props} />
    </ContentLanguageProvider>
  );
}
