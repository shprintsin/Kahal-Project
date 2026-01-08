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
import { createArtifact, updateArtifact } from "@/app/admin/actions/artifacts";

interface ArtifactEditorClientProps {
  artifact: any;
  categories: any[];
  periods: any[];
  tags: any[];
  artifacts: any[];
  isNew: boolean;
}

function EditorInner({ artifact, categories, periods, tags, artifacts, isNew }: ArtifactEditorClientProps) {
  const router = useRouter();
  const artifactId = artifact?.id;

  const {
    currentLanguage,
    setLanguage,
    getTranslation,
    updateField,
  } = useContentLanguage();

  // Form state
  const [isDirty, setIsDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState<ContentStatus>(artifact?.status as ContentStatus || "draft");

  // Metadata
  const [categoryOptions] = React.useState(categories.map((c: any) => ({ value: c.id, label: c.title })));
  const [category, setCategory] = React.useState(artifact?.artifactCategoryId || "");
  const [allTags] = React.useState(tags.map((t: any) => t.name));
  const [artifactTags, setArtifactTags] = React.useState(artifact?.tags?.map((t: any) => t.name) || []);
  const [createdAt] = React.useState(artifact ? new Date(artifact.createdAt).toLocaleDateString() : "");
  const [updatedAt] = React.useState(artifact ? new Date(artifact.updatedAt).toLocaleDateString() : "");
  const [isPublic, setIsPublic] = React.useState(true);
  const [license, setLicense] = React.useState("");
  const [attachments, setAttachments] = React.useState<any[]>([]);

  // Initialize artifact data in language provider - only once per ID
  React.useEffect(() => {
    if (artifact) {
      updateField("title", artifact.title || "");
      updateField("slug", artifact.slug || "");
      updateField("content", artifact.content || "");
      updateField("excerpt", artifact.excerpt || "");
    }
  }, [artifactId]);

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
        content,
        contentI18n: {},
        excerpt,
        artifactCategoryId: category || undefined,
        tagNames: artifactTags,
      };

      if (isNew) {
        const newArtifact = await createArtifact(data);
        toast.success("Created successfully");
        router.push(`/admin/artifacts/${newArtifact.id}`);
      } else {
        await updateArtifact(artifactId, data);
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

  const handleLanguageChange = (lang: ContentLanguage) => {
    setLanguage(lang);
    toast.info(`Switched to ${lang.toUpperCase()}`);
  };

  // File tree from artifacts
  const fileTreeItems: FileTreeItem[] = React.useMemo(() => {
    return artifacts.slice(0, 20).map((a: any) => ({
      id: a.id,
      name: a.title || a.slug || "Untitled",
      slug: a.slug,
      type: "file" as const,
      path: `/artifacts/${a.id}`,
    }));
  }, [artifacts]);

  const handleFileSelect = (item: FileTreeItem) => {
    if (item.path) {
      router.push(`/admin${item.path}`);
    }
  };

  const fileTree = (
    <FileTree
      items={fileTreeItems}
      currentFileId={artifactId}
      onFileSelect={handleFileSelect}
      onFileCreate={() => router.push("/admin/artifacts/new")}
    />
  );

  const sidebar = (
    <MetadataSidebar
      status={status}
      onStatusChange={setStatus}
      category={category}
      onCategoryChange={setCategory}
      categoryOptions={categoryOptions}
      createdAt={createdAt}
      updatedAt={updatedAt}
      isPublic={isPublic}
      onVisibilityChange={setIsPublic}
      license={license}
      onLicenseChange={setLicense}
      tags={artifactTags}
      onTagsChange={setArtifactTags}
      tagSuggestions={allTags}
      attachments={attachments}
      onAttachmentsChange={setAttachments}
    />
  );

  return (
    <LoopStyleEditor
      backHref="/admin/artifacts"
      backLabel="Artifacts"
      onBack={() => router.push("/admin/artifacts")}
      onSave={handleSave}
      saving={saving}
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
            slugPrefix="/artifacts/"
            description={excerpt}
            onDescriptionChange={(v) => handleFieldChange("excerpt", v)}
            content={content}
            onContentChange={(v) => handleFieldChange("content", v)}
            contentPlaceholder="Describe this artifact..."
          />
        </div>
      </EditorContextMenu>
    </LoopStyleEditor>
  );
}

export function ArtifactEditorClient(props: ArtifactEditorClientProps) {
  return (
    <ContentLanguageProvider defaultLanguage="en">
      <EditorInner {...props} />
    </ContentLanguageProvider>
  );
}
