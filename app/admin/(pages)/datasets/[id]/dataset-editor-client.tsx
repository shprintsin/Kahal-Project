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
import { SidebarCard, SidebarField } from "@/app/admin/components/content/loop-style-editor";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ContentLanguage, ContentStatus } from "@/app/admin/types/content-system.types";
import type { FileTreeItem } from "@/app/admin/components/content/file-tree";
import { createDataset, updateDataset } from "@/app/admin/actions/datasets";
import { uploadMedia } from "@/app/admin/actions/posts";
import { Image as ImageIcon, Trash2 } from "lucide-react";
import { uploadResourceFile, createDatasetResource, deleteDatasetResource } from "@/app/admin/actions/datasets";

interface DatasetEditorClientProps {
  dataset: any;
  tags: any[];
  datasets: any[];
  categories: any[];
  regions: any[];
  isNew: boolean;
}

function buildI18nObject(
  translations: Record<ContentLanguage, Record<string, unknown>>,
  field: string
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [lang, data] of Object.entries(translations)) {
    const val = data[field];
    if (typeof val === "string" && val.trim()) {
      result[lang] = val;
    }
  }
  return result;
}

function EditorInner({ dataset, tags, datasets, categories, regions, isNew }: DatasetEditorClientProps) {
  const router = useRouter();
  const datasetId = dataset?.id;

  const {
    currentLanguage,
    setLanguage,
    getTranslation,
    updateField,
    translations,
    setTranslations,
  } = useContentLanguage();

  const [isDirty, setIsDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);

  const [status, setStatus] = React.useState<ContentStatus>(dataset?.status || "draft");
  const [allTags] = React.useState(tags.map((t: any) => t.name));
  const [datasetTags, setDatasetTags] = React.useState(dataset?.tags?.map((t: any) => t.name) || []);
  const [createdAt] = React.useState(dataset ? new Date(dataset.createdAt).toLocaleDateString() : "");
  const [updatedAt] = React.useState(dataset ? new Date(dataset.updatedAt).toLocaleDateString() : "");

  const [categoryId, setCategoryId] = React.useState(dataset?.categoryId || "");
  const [maturity, setMaturity] = React.useState(dataset?.maturity || "Provisional");
  const [version, setVersion] = React.useState(dataset?.version || "1.0.0");
  const [minYear, setMinYear] = React.useState(dataset?.minYear?.toString() || "");
  const [maxYear, setMaxYear] = React.useState(dataset?.maxYear?.toString() || "");
  const [license, setLicense] = React.useState(dataset?.license || "");
  const [citationText, setCitationText] = React.useState(dataset?.citationText || "");
  const [isVisible, setIsVisible] = React.useState(dataset?.isVisible ?? true);
  const [regionIds, setRegionIds] = React.useState<string[]>(dataset?.regions?.map((r: any) => r.id) || []);
  const initialResourceIds = React.useRef<Set<string>>(
    new Set((dataset?.resources || []).map((r: any) => r.id))
  );
  const [attachments, setAttachments] = React.useState<any[]>(
    (dataset?.resources || []).map((r: any) => ({
      id: r.id,
      name: r.name || r.filename || "file",
      size: 0,
      type: r.mimeType || "",
      url: r.url,
    }))
  );

  const [thumbnailId, setThumbnailId] = React.useState<string | undefined>(dataset?.thumbnail?.id);
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string | null>(dataset?.thumbnail?.url || null);

  React.useEffect(() => {
    if (!dataset) return;

    const titleI18n = (dataset.titleI18n as Record<string, string>) || {};
    const descI18n = (dataset.descriptionI18n as Record<string, string>) || {};
    const codebookI18n = (dataset.codebookTextI18n as Record<string, string>) || {};
    const srcI18n = (dataset.sourcesI18n as Record<string, string>) || {};

    const heData: Record<string, unknown> = {
      title: dataset.title || titleI18n.he || "",
      slug: dataset.slug || "",
      content: dataset.description || descI18n.he || "",
      codebookText: dataset.codebookText || codebookI18n.he || "",
      sources: dataset.sources || srcI18n.he || "",
    };
    setTranslations("he", heData);

    for (const lang of ["en", "pl"] as ContentLanguage[]) {
      const langData: Record<string, unknown> = {};
      if (titleI18n[lang]) langData.title = titleI18n[lang];
      if (descI18n[lang]) langData.content = descI18n[lang];
      if (codebookI18n[lang]) langData.codebookText = codebookI18n[lang];
      if (srcI18n[lang]) langData.sources = srcI18n[lang];
      if (Object.keys(langData).length > 0) {
        langData.slug = dataset.slug || "";
        setTranslations(lang, langData);
      }
    }
  }, [datasetId]);

  const title = getTranslation<string>("title", "") ?? "";
  const slug = getTranslation<string>("slug", "") ?? "";
  const content = getTranslation<string>("content", "") ?? "";
  const codebookText = (getTranslation<string>("codebookText", "") ?? "");
  const sources = (getTranslation<string>("sources", "") ?? "");

  const handleFieldChange = (field: string, value: string) => {
    updateField(field, value);
    setIsDirty(true);
  };

  const markDirty = () => setIsDirty(true);

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

  const buildSaveData = (overrideStatus?: ContentStatus) => {
    const titleI18n = buildI18nObject(translations, "title");
    const descriptionI18n = buildI18nObject(translations, "content");
    const codebookTextI18n = buildI18nObject(translations, "codebookText");
    const sourcesI18n = buildI18nObject(translations, "sources");

    return {
      title: titleI18n,
      slug,
      description: descriptionI18n,
      status: overrideStatus || status,
      tagNames: datasetTags,
      categoryId: categoryId || null,
      maturity,
      version,
      minYear: minYear ? parseInt(minYear, 10) : null,
      maxYear: maxYear ? parseInt(maxYear, 10) : null,
      license: license || null,
      citationText: citationText || null,
      codebookText: codebookTextI18n,
      sources: sourcesI18n,
      isVisible,
      regions: regionIds,
      thumbnailId: thumbnailId || null,
    };
  };

  const syncResources = async (targetDatasetId: string) => {
    const currentIds = new Set(attachments.filter(a => !a.file).map(a => a.id));
    const removedIds = [...initialResourceIds.current].filter(id => !currentIds.has(id));

    for (const id of removedIds) {
      try {
        await deleteDatasetResource(id);
      } catch (err) {
        console.error(`Delete resource failed:`, err);
        toast.error("Failed to remove a resource");
      }
    }

    const newFiles = attachments.filter(a => a.file);
    for (const attachment of newFiles) {
      try {
        const fd = new FormData();
        fd.append("file", attachment.file!);
        fd.append("datasetId", targetDatasetId);
        const result = await uploadResourceFile(fd);

        await createDatasetResource(targetDatasetId, {
          name: result.name,
          slug: result.slug,
          url: result.url,
          filename: result.filename,
          mimeType: result.mimeType,
          sizeBytes: result.sizeBytes,
          format: result.format,
          isMainFile: false,
        });
      } catch (err) {
        console.error(`Upload failed for ${attachment.name}:`, err);
        toast.error(`Failed to upload ${attachment.name}`);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = buildSaveData();
      if (isNew) {
        const newDataset = await createDataset(data);
        await syncResources(newDataset.id);
        toast.success("Created successfully");
        router.push(`/admin/datasets/${newDataset.id}`);
      } else {
        await updateDataset(datasetId, data);
        await syncResources(datasetId);
        toast.success("Saved successfully");
        router.refresh();
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
      if (isNew) {
        const newDataset = await createDataset(data);
        await syncResources(newDataset.id);
        toast.success("Published!");
        router.push(`/admin/datasets/${newDataset.id}`);
      } else {
        await updateDataset(datasetId, data);
        await syncResources(datasetId);
        setStatus("published");
        toast.success("Published!");
        router.refresh();
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

  const categoryOptions = categories.map((c: any) => ({
    value: c.id,
    label: c.title || c.name || "Untitled",
  }));

  const fileTree = (
    <FileTree
      items={fileTreeItems}
      currentFileId={datasetId}
      onFileSelect={(item: FileTreeItem) => item.path && router.push(`/admin${item.path}`)}
      onFileCreate={() => router.push("/admin/datasets/new")}
    />
  );

  const resources = dataset?.resources || [];

  const sidebar = (
    <div className="space-y-0">
      <MetadataSidebar
        status={status}
        onStatusChange={(s) => { setStatus(s); markDirty(); }}
        category={categoryId}
        onCategoryChange={(c) => { setCategoryId(c); markDirty(); }}
        categoryOptions={categoryOptions}
        createdAt={createdAt}
        updatedAt={updatedAt}
        isPublic={isVisible}
        onVisibilityChange={(v) => { setIsVisible(v); markDirty(); }}
        tags={datasetTags}
        onTagsChange={(t) => { setDatasetTags(t); markDirty(); }}
        tagSuggestions={allTags}
        attachments={attachments}
        onAttachmentsChange={(files) => { setAttachments(files); markDirty(); }}
        attachmentsAccept="*/*"
        thumbnailUrl={thumbnailUrl}
        onThumbnailChange={handleThumbnailChange}
        onThumbnailRemove={handleThumbnailRemove}
      />

      <SidebarCard title="Thumbnail">
        <div className="space-y-2">
          {thumbnailUrl ? (
            <div className="relative group">
              <img src={thumbnailUrl} alt="Thumbnail" className="w-full rounded border border-border object-cover max-h-32" />
              <button
                type="button"
                onClick={handleThumbnailRemove}
                className="absolute top-1 right-1 p-1 bg-destructive/80 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-1 p-4 border border-dashed border-border rounded cursor-pointer hover:bg-muted/50 transition-colors">
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Upload thumbnail</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleThumbnailChange(file);
                }}
              />
            </label>
          )}
        </div>
      </SidebarCard>

      <SidebarCard title="Data Quality">
        <div className="space-y-3">
          <SidebarField label="Maturity">
            <Select value={maturity} onValueChange={(v) => { setMaturity(v); markDirty(); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Raw">Raw</SelectItem>
                <SelectItem value="Preliminary">Preliminary</SelectItem>
                <SelectItem value="Provisional">Provisional</SelectItem>
                <SelectItem value="Validated">Validated</SelectItem>
              </SelectContent>
            </Select>
          </SidebarField>
          <SidebarField label="Version">
            <Input value={version} onChange={(e) => { setVersion(e.target.value); markDirty(); }} placeholder="1.0.0" />
          </SidebarField>
          <SidebarField label="License">
            <Input value={license} onChange={(e) => { setLicense(e.target.value); markDirty(); }} placeholder="CC-BY-4.0" />
          </SidebarField>
        </div>
      </SidebarCard>

      <SidebarCard title="Temporal Coverage">
        <div className="space-y-3">
          <SidebarField label="Min Year">
            <Input type="number" value={minYear} onChange={(e) => { setMinYear(e.target.value); markDirty(); }} placeholder="1750" />
          </SidebarField>
          <SidebarField label="Max Year">
            <Input type="number" value={maxYear} onChange={(e) => { setMaxYear(e.target.value); markDirty(); }} placeholder="1939" />
          </SidebarField>
        </div>
      </SidebarCard>

      <SidebarCard title="Regions">
        <div className="space-y-2">
          {regions.map((r: any) => (
            <label key={r.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={regionIds.includes(r.id)}
                onChange={(e) => {
                  setRegionIds(prev =>
                    e.target.checked ? [...prev, r.id] : prev.filter(id => id !== r.id)
                  );
                  markDirty();
                }}
                className="rounded border-border"
              />
              {r.name}
            </label>
          ))}
          {regions.length === 0 && <p className="text-xs text-muted-foreground">No regions available</p>}
        </div>
      </SidebarCard>

    </div>
  );

  return (
    <LoopStyleEditor
      backHref="/admin/datasets"
      backLabel="Datasets"
      onBack={() => router.push("/admin/datasets")}
      previewHref={!isNew && slug ? `/data/${slug}` : undefined}
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
            description=""
            onDescriptionChange={() => {}}
            descriptionPlaceholder=""
            content={content}
            onContentChange={(v) => handleFieldChange("content", v)}
            contentPlaceholder="Describe this dataset..."
          />

          <div className="mt-8 space-y-6 max-w-3xl mx-auto px-12">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Citation
              </label>
              <Textarea
                value={citationText}
                onChange={(e) => { setCitationText(e.target.value); markDirty(); }}
                placeholder="How should this dataset be cited..."
                className="min-h-[80px] bg-transparent border-border resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Codebook
              </label>
              <Textarea
                value={codebookText}
                onChange={(e) => { handleFieldChange("codebookText", e.target.value); }}
                placeholder="Describe the data structure, columns, and coding..."
                className="min-h-[80px] bg-transparent border-border resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Sources
              </label>
              <Textarea
                value={sources}
                onChange={(e) => { handleFieldChange("sources", e.target.value); }}
                placeholder="Original data sources and references..."
                className="min-h-[80px] bg-transparent border-border resize-none"
              />
            </div>

          </div>
        </div>
      </EditorContextMenu>
    </LoopStyleEditor>
  );
}

export function DatasetEditorClient(props: DatasetEditorClientProps) {
  return (
    <ContentLanguageProvider defaultLanguage="he">
      <EditorInner {...props} />
    </ContentLanguageProvider>
  );
}
