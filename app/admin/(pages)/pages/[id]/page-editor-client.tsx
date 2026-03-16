"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AppLanguage } from "@prisma/client";
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
import type { PageForEditor, TagOption, PageListItem } from "@/app/admin/types/editor-data";
import { createPage, updatePage } from "@/app/admin/actions/pages";
import { uploadMedia } from "@/app/admin/actions/posts";
import { generateSlugFromTitle } from "@/app/admin/utils/slug-generator";
import { Textarea } from "@/components/ui/textarea";
import {
  AdminSidebarCard,
  AdminFieldLabel,
  AdminDarkInput,
} from "@/app/admin/components/ui/admin-sidebar-card";

type RegionItem = { id: string; name: string; slug: string };

interface PageEditorClientProps {
  page: PageForEditor | null;
  tags: TagOption[];
  pages: PageListItem[];
  regions: RegionItem[];
  isNew: boolean;
}

function EditorInner({ page, tags, pages, regions, isNew }: PageEditorClientProps) {
  const router = useRouter();
  const pageId = page?.id;

  const {
    currentLanguage,
    setLanguage,
    getTranslation,
    updateField,
  } = useContentLanguage();

  const [isDirty, setIsDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);

  const [status, setStatus] = React.useState<ContentStatus>(page?.status || "draft");
  const [template, setTemplate] = React.useState(page?.template || "default");
  const [allTags] = React.useState(tags.map((t) => t.name));
  const [pageTags, setPageTags] = React.useState(page?.tags?.map((t) => t.name) || []);
  const [author] = React.useState(page?.author?.name || "");
  const [createdAt] = React.useState(page ? new Date(page.createdAt).toLocaleDateString() : "");
  const [updatedAt] = React.useState(page ? new Date(page.updatedAt).toLocaleDateString() : "");
  const [isPublic, setIsPublic] = React.useState(true);
  const [license, setLicense] = React.useState("");
  const [attachments, setAttachments] = React.useState<{ id: string; name: string; size: number; type: string; url?: string }[]>([]);

  const [sources, setSources] = React.useState(page?.sources || "");
  const [citations, setCitations] = React.useState(page?.citations || "");
  const [language, setPageLanguage] = React.useState<AppLanguage>(page?.language || "HE");
  const [parentId, setParentId] = React.useState<string | null>(page?.parentId || null);
  const [metaDescription, setMetaDescription] = React.useState(page?.metaDescription || "");
  const [metaKeywords, setMetaKeywords] = React.useState(page?.metaKeywords || "");
  const [menuOrder, setMenuOrder] = React.useState(page?.menuOrder || 0);
  const [showInMenu, setShowInMenu] = React.useState(page?.showInMenu ?? true);
  const [regionIds, setRegionIds] = React.useState<string[]>(page?.regions?.map((r) => r.id) || []);

  const [thumbnailId, setThumbnailId] = React.useState<string | undefined>(page?.thumbnail?.id);
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string | null>(page?.thumbnail?.url || null);

  React.useEffect(() => {
    if (page) {
      updateField("title", page.title || "");
      updateField("slug", page.slug || "");
      updateField("content", page.content || "");
      updateField("excerpt", page.excerpt || "");
    }
  }, [pageId]);

  const title = getTranslation<string>("title", "") ?? "";
  const slug = getTranslation<string>("slug", "") ?? "";
  const content = getTranslation<string>("content", "") ?? "";
  const excerpt = getTranslation<string>("excerpt", "") ?? "";

  const handleFieldChange = (field: string, value: string) => {
    updateField(field, value);

    if (field === "title") {
      const autoSlug = generateSlugFromTitle(value);
      if (autoSlug) {
        if (isNew || !slug) {
          updateField("slug", autoSlug);
        }
      }
    }

    setIsDirty(true);
  };

  const handleThumbnailChange = async (file: File) => {
    try {
      const media = await uploadMedia(file);
      setThumbnailId(media.id);
      setThumbnailUrl(media.url);
      toast.success("Thumbnail uploaded");
      setIsDirty(true);
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    }
  };

  const handleThumbnailRemove = () => {
    setThumbnailId(undefined);
    setThumbnailUrl(null);
    setIsDirty(true);
  };

  const buildSaveData = (overrideStatus?: ContentStatus) => ({
    title,
    slug,
    content,
    excerpt,
    sources: sources || null,
    citations: citations || null,
    status: overrideStatus || status,
    language,
    template,
    menuOrder,
    showInMenu,
    parent_id: parentId,
    metaDescription: metaDescription || null,
    metaKeywords: metaKeywords || null,
    thumbnail_id: thumbnailId,
  });

  const resolveTagIds = () => {
    return pageTags
      .map((name) => tags.find((t) => t.name === name)?.id)
      .filter((id): id is string => !!id);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = buildSaveData();
      const tagIdList = resolveTagIds();

      if (isNew) {
        const newPage = await createPage(data, tagIdList, regionIds);
        toast.success("Created successfully");
        router.push(`/admin/pages/${newPage.id}`);
      } else {
        await updatePage(pageId!, data, tagIdList, regionIds);
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
      const data = buildSaveData("published");
      const tagIdList = resolveTagIds();

      if (isNew) {
        const newPage = await createPage(data, tagIdList, regionIds);
        toast.success("Published!");
        router.push(`/admin/pages/${newPage.id}`);
      } else {
        await updatePage(pageId!, data, tagIdList, regionIds);
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

  const handleRegionToggle = (regionId: string) => {
    setRegionIds((prev) =>
      prev.includes(regionId) ? prev.filter((id) => id !== regionId) : [...prev, regionId]
    );
    setIsDirty(true);
  };

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
          status: p.status as ContentStatus,
        })),
      }));
  }, [pages]);

  const handleFileSelect = (item: FileTreeItem) => {
    if (item.path) {
      router.push(`/admin${item.path}`);
    }
  };

  const parentOptions = React.useMemo(() => {
    return pages.filter((p) => p.id !== pageId);
  }, [pages, pageId]);

  const fileTree = (
    <FileTree
      items={fileTreeItems}
      currentFileId={pageId}
      onFileSelect={handleFileSelect}
      onFileCreate={() => router.push("/admin/pages/new")}
    />
  );

  const sidebar = (
    <div className="space-y-4">
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
        thumbnailUrl={thumbnailUrl}
        onThumbnailChange={handleThumbnailChange}
        onThumbnailRemove={handleThumbnailRemove}
      />

      <AdminSidebarCard title="Page Settings" collapsible defaultOpen>
        <div className="space-y-3">
          <div className="space-y-1">
            <AdminFieldLabel>Language</AdminFieldLabel>
            <select
              value={language}
              onChange={(e) => { setPageLanguage(e.target.value as AppLanguage); setIsDirty(true); }}
              className="w-full bg-muted border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none"
            >
              <option value="HE">Hebrew</option>
              <option value="PL">Polish</option>
              <option value="EN">English</option>
            </select>
          </div>

          <div className="space-y-1">
            <AdminFieldLabel>Parent Page</AdminFieldLabel>
            <select
              value={parentId || ""}
              onChange={(e) => { setParentId(e.target.value || null); setIsDirty(true); }}
              className="w-full bg-muted border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none"
            >
              <option value="">None (root page)</option>
              {parentOptions.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <AdminFieldLabel>Menu Order</AdminFieldLabel>
            <AdminDarkInput
              type="number"
              value={menuOrder}
              onChange={(e) => { setMenuOrder(parseInt(e.target.value) || 0); setIsDirty(true); }}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showInMenu"
              checked={showInMenu}
              onChange={(e) => { setShowInMenu(e.target.checked); setIsDirty(true); }}
              className="rounded border-border"
            />
            <label htmlFor="showInMenu" className="text-sm text-foreground">
              Show in Menu
            </label>
          </div>
        </div>
      </AdminSidebarCard>

      <AdminSidebarCard title="SEO / Meta" collapsible defaultOpen={false}>
        <div className="space-y-3">
          <div className="space-y-1">
            <AdminFieldLabel>Meta Description</AdminFieldLabel>
            <textarea
              value={metaDescription}
              onChange={(e) => { setMetaDescription(e.target.value); setIsDirty(true); }}
              placeholder="Page description for search engines..."
              rows={3}
              className="w-full bg-muted border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none resize-none"
            />
          </div>

          <div className="space-y-1">
            <AdminFieldLabel>Meta Keywords</AdminFieldLabel>
            <AdminDarkInput
              value={metaKeywords}
              onChange={(e) => { setMetaKeywords(e.target.value); setIsDirty(true); }}
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>
        </div>
      </AdminSidebarCard>

      {regions.length > 0 && (
        <AdminSidebarCard title="Regions" collapsible defaultOpen={false}>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {regions.map((region) => (
              <div key={region.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`region-${region.id}`}
                  checked={regionIds.includes(region.id)}
                  onChange={() => handleRegionToggle(region.id)}
                  className="rounded border-border"
                />
                <label htmlFor={`region-${region.id}`} className="text-sm text-foreground">
                  {region.name}
                </label>
              </div>
            ))}
          </div>
        </AdminSidebarCard>
      )}
    </div>
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

          <div className="mt-8 space-y-6 max-w-3xl mx-auto px-12">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Sources
              </label>
              <Textarea
                value={sources}
                onChange={(e) => { setSources(e.target.value); setIsDirty(true); }}
                placeholder="References and sources..."
                className="min-h-[80px] bg-transparent border-border resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Citations
              </label>
              <Textarea
                value={citations}
                onChange={(e) => { setCitations(e.target.value); setIsDirty(true); }}
                placeholder="Citations and references..."
                className="min-h-[80px] bg-transparent border-border resize-none"
              />
            </div>
          </div>
        </div>
      </EditorContextMenu>
    </LoopStyleEditor>
  );
}

export function PageEditorClient(props: PageEditorClientProps) {
  return (
    <ContentLanguageProvider defaultLanguage="he">
      <EditorInner {...props} />
    </ContentLanguageProvider>
  );
}
