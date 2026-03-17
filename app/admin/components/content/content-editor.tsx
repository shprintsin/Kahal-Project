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
import { uploadMedia } from "@/app/admin/actions/posts";
import { generateSlugFromTitle } from "@/app/admin/utils/slug-generator";

interface ListItem {
  id: string;
  title?: string;
  slug?: string;
  status?: string;
}

interface ContentEditorConfig {
  contentType: string;
  slugPrefix: string;
  backHref: string;
  backLabel: string;
  contentPlaceholder?: string;
  showPublish?: boolean;
}

interface ContentEditorProps {
  config: ContentEditorConfig;
  item: Record<string, unknown> | null;
  categories?: { id: string; title: string }[];
  tags?: { id: string; name: string; slug: string }[];
  siblings?: ListItem[];
  isNew: boolean;
  onSave: (data: Record<string, unknown>) => Promise<{ id: string }>;
}

function EditorInner({
  config,
  item,
  categories = [],
  tags = [],
  siblings = [],
  isNew,
  onSave,
}: ContentEditorProps) {
  const router = useRouter();
  const itemId = item?.id as string | undefined;

  const { currentLanguage, setLanguage, getTranslation, updateField } =
    useContentLanguage();

  const [isDirty, setIsDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);

  const [status, setStatus] = React.useState<ContentStatus>(
    (item?.status as ContentStatus) || "draft"
  );
  const [category, setCategory] = React.useState(
    (item?.categoryId as string) ||
      ((item?.categories as { id: string }[])?.[0]?.id) ||
      ""
  );
  const [itemTags, setItemTags] = React.useState<string[]>(
    (item?.tags as { name: string }[])?.map((t) => t.name) || []
  );
  const [thumbnailId, setThumbnailId] = React.useState<string | undefined>(
    (item?.thumbnail as { id: string })?.id
  );
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string | null>(
    (item?.thumbnail as { url: string })?.url || null
  );

  const categoryOptions = React.useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.title })),
    [categories]
  );
  const tagSuggestions = React.useMemo(
    () => tags.map((t) => t.name),
    [tags]
  );

  const author = (item?.author as { name: string })?.name || "";
  const createdAt = item?.createdAt
    ? new Date(item.createdAt as string).toLocaleDateString()
    : "";
  const updatedAt = item?.updatedAt
    ? new Date(item.updatedAt as string).toLocaleDateString()
    : "";

  React.useEffect(() => {
    if (item) {
      updateField("title", (item.title as string) || "");
      updateField("slug", (item.slug as string) || "");
      updateField("content", (item.content as string) || "");
      updateField("excerpt", (item.excerpt as string) || "");
    }
  }, [itemId]);

  const title = getTranslation<string>("title", "") ?? "";
  const slug = getTranslation<string>("slug", "") ?? "";
  const content = getTranslation<string>("content", "") ?? "";
  const excerpt = getTranslation<string>("excerpt", "") ?? "";

  const handleFieldChange = (field: string, value: string) => {
    updateField(field, value);
    if (field === "title" && (isNew || !slug)) {
      const autoSlug = generateSlugFromTitle(value);
      if (autoSlug) updateField("slug", autoSlug);
    }
    setIsDirty(true);
  };

  const buildSaveData = (overrideStatus?: ContentStatus) => ({
    title,
    slug,
    content,
    excerpt,
    status: overrideStatus || status,
    thumbnail_id: thumbnailId,
    categoryId: category || undefined,
    categoryIds: category ? [category] : [],
    tagNames: itemTags,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await onSave(buildSaveData());
      if (isNew) {
        toast.success("נוצר בהצלחה");
        router.push(`${config.backHref}/${result.id}`);
      } else {
        toast.success("נשמר בהצלחה");
      }
      setIsDirty(false);
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("שמירה נכשלה");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const result = await onSave(buildSaveData("published"));
      if (isNew) {
        router.push(`${config.backHref}/${result.id}`);
      }
      setStatus("published");
      toast.success("פורסם בהצלחה");
      setIsDirty(false);
    } catch (error) {
      console.error("Publish failed:", error);
      toast.error("פרסום נכשל");
    } finally {
      setPublishing(false);
    }
  };

  const handleThumbnailChange = async (file: File) => {
    try {
      const media = await uploadMedia(file);
      setThumbnailId(media.id);
      setThumbnailUrl(media.url);
      setIsDirty(true);
    } catch {
      toast.error("העלאה נכשלה");
    }
  };

  const handleThumbnailRemove = () => {
    setThumbnailId(undefined);
    setThumbnailUrl(null);
    setIsDirty(true);
  };

  const fileTreeItems: FileTreeItem[] = React.useMemo(
    () =>
      siblings.slice(0, 20).map((s) => ({
        id: s.id,
        name: s.title || s.slug || "Untitled",
        slug: s.slug,
        type: "file" as const,
        path: `/${config.contentType}/${s.id}`,
        status: s.status as ContentStatus,
      })),
    [siblings, config.contentType]
  );

  return (
    <LoopStyleEditor
      backHref={config.backHref}
      backLabel={config.backLabel}
      onBack={() => router.push(config.backHref)}
      previewHref={!isNew && slug ? `${config.slugPrefix}${slug}` : undefined}
      onSave={handleSave}
      onPublish={config.showPublish !== false ? handlePublish : undefined}
      saving={saving}
      publishing={publishing}
      isDirty={isDirty}
      currentLanguage={currentLanguage}
      onLanguageChange={(lang: ContentLanguage) => {
        setLanguage(lang);
        toast.info(`Switched to ${lang.toUpperCase()}`);
      }}
      showLanguageToggle={!isNew}
      fileTree={
        <FileTree
          items={fileTreeItems}
          currentFileId={itemId}
          onFileSelect={(item: FileTreeItem) => {
            if (item.path) router.push(`/admin${item.path}`);
          }}
          onFileCreate={() => router.push(`${config.backHref}/new`)}
        />
      }
      sidebar={
        <MetadataSidebar
          status={status}
          onStatusChange={setStatus}
          category={category}
          onCategoryChange={setCategory}
          categoryOptions={categoryOptions}
          author={author}
          createdAt={createdAt}
          updatedAt={updatedAt}
          tags={itemTags}
          onTagsChange={setItemTags}
          tagSuggestions={tagSuggestions}
          thumbnailUrl={thumbnailUrl}
          onThumbnailChange={handleThumbnailChange}
          onThumbnailRemove={handleThumbnailRemove}
        />
      }
    >
      <EditorContextMenu onAction={(action) => toast.info(`Action: ${action}`)}>
        <div>
          <UnifiedCanvas
            title={title}
            onTitleChange={(v) => handleFieldChange("title", v)}
            slug={slug}
            onSlugChange={(v) => handleFieldChange("slug", v)}
            slugPrefix={config.slugPrefix}
            description={excerpt}
            onDescriptionChange={(v) => handleFieldChange("excerpt", v)}
            content={content}
            onContentChange={(v) => handleFieldChange("content", v)}
            contentPlaceholder={config.contentPlaceholder || "התחל לכתוב..."}
          />
        </div>
      </EditorContextMenu>
    </LoopStyleEditor>
  );
}

export function ContentEditor(props: ContentEditorProps) {
  return (
    <ContentLanguageProvider defaultLanguage="he">
      <EditorInner {...props} />
    </ContentLanguageProvider>
  );
}
