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
import { createPage, updatePage } from "@/app/admin/actions/pages";

interface PageEditorClientProps {
  page: any;
  tags: any[];
  pages: any[];
  isNew: boolean;
}

function EditorInner({ page, tags, pages, isNew }: PageEditorClientProps) {
  const router = useRouter();
  const pageId = page?.id;

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
  const [status, setStatus] = React.useState<ContentStatus>(page?.status || "draft");
  const [template, setTemplate] = React.useState(page?.template || "default");
  const [allTags] = React.useState(tags.map((t: any) => t.name));
  const [pageTags, setPageTags] = React.useState(page?.tags?.map((t: any) => t.name) || []);
  const [author] = React.useState(page?.author?.name || "");
  const [createdAt] = React.useState(page ? new Date(page.createdAt).toLocaleDateString() : "");
  const [updatedAt] = React.useState(page ? new Date(page.updatedAt).toLocaleDateString() : "");
  const [isPublic, setIsPublic] = React.useState(true);
  const [license, setLicense] = React.useState("");
  const [attachments, setAttachments] = React.useState<any[]>([]);

  // Initialize page data in language provider - only once per ID
  React.useEffect(() => {
    if (page) {
      updateField("title", page.title || "");
      updateField("slug", page.slug || "");
      updateField("content", page.content || "");
      updateField("excerpt", page.excerpt || "");
    }
  }, [pageId]);

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
        excerpt,
        status,
        template,
        tagNames: pageTags,
      };

      if (isNew) {
        const newPage = await createPage(data);
        toast.success("Created successfully");
        router.push(`/admin/pages/${newPage.id}`);
      } else {
        await updatePage(pageId, data);
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
        content,
        excerpt,
        status: "published" as ContentStatus,
        template,
      };

      if (isNew) {
        const newPage = await createPage(data);
        toast.success("Published!");
        router.push(`/admin/pages/${newPage.id}`);
      } else {
        await updatePage(pageId, data);
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

  // File tree from pages
  const fileTreeItems: FileTreeItem[] = React.useMemo(() => {
    const byTemplate: Record<string, any[]> = {};
    pages.forEach(p => {
      const t = p.template || "default";
      if (!byTemplate[t]) byTemplate[t] = [];
      byTemplate[t].push(p);
    });
    
    return Object.entries(byTemplate)
      .filter(([_, items]) => items.length > 0)
      .map(([t, items]) => ({
        id: t,
        name: t.charAt(0).toUpperCase() + t.slice(1),
        type: "folder" as const,
        children: items.slice(0, 8).map(p => ({
          id: p.id,
          name: p.title,
          slug: p.slug,
          type: "file" as const,
          path: `/pages/${p.id}`,
          status: p.status,
        })),
      }));
  }, [pages]);

  const handleFileSelect = (item: FileTreeItem) => {
    if (item.path) {
      router.push(`/admin${item.path}`);
    }
  };

  const fileTree = (
    <FileTree
      items={fileTreeItems}
      currentFileId={pageId}
      onFileSelect={handleFileSelect}
      onFileCreate={() => router.push("/admin/pages/new")}
    />
  );

  const sidebar = (
    <MetadataSidebar
      status={status}
      onStatusChange={setStatus}
      category={template}
      onCategoryChange={setTemplate}
      categoryOptions={[
        { value: "default", label: "Default" },
        { value: "landing", label: "Landing" },
        { value: "sidebar", label: "Sidebar" },
        { value: "full-width", label: "Full Width" },
      ]}
      author={author}
      createdAt={createdAt}
      updatedAt={updatedAt}
      isPublic={isPublic}
      onVisibilityChange={setIsPublic}
      license={license}
      onLicenseChange={setLicense}
      tags={pageTags}
      onTagsChange={setPageTags}
      tagSuggestions={allTags}
      attachments={attachments}
      onAttachmentsChange={setAttachments}
    />
  );

  return (
    <LoopStyleEditor
      backHref="/admin/pages"
      backLabel="Pages"
      onBack={() => router.push("/admin/pages")}
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
            slugPrefix="/pages/"
            description={excerpt}
            onDescriptionChange={(v) => handleFieldChange("excerpt", v)}
            content={content}
            onContentChange={(v) => handleFieldChange("content", v)}
            contentPlaceholder="Start writing your page content..."
          />
        </div>
      </EditorContextMenu>
    </LoopStyleEditor>
  );
}

export function PageEditorClient(props: PageEditorClientProps) {
  return (
    <ContentLanguageProvider defaultLanguage="en">
      <EditorInner {...props} />
    </ContentLanguageProvider>
  );
}
