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
import { Switch } from "@/components/ui/switch";
import type { ContentLanguage, ContentStatus } from "@/app/admin/types/content-system.types";
import type { FileTreeItem } from "@/app/admin/components/content/file-tree";
import { createDataset, updateDataset } from "@/app/admin/actions/datasets";

interface DatasetEditorClientProps {
  dataset: any;
  tags: any[];
  datasets: any[];
  categories: any[];
  regions: any[];
  isNew: boolean;
}

function EditorInner({ dataset, tags, datasets, categories, regions, isNew }: DatasetEditorClientProps) {
  const router = useRouter();
  const datasetId = dataset?.id;

  const {
    currentLanguage,
    setLanguage,
    getTranslation,
    updateField,
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
  const [codebookText, setCodebookText] = React.useState(dataset?.codebookText || "");
  const [sources, setSources] = React.useState(dataset?.sources || "");
  const [isVisible, setIsVisible] = React.useState(dataset?.isVisible ?? true);
  const [regionIds, setRegionIds] = React.useState<string[]>(dataset?.regions?.map((r: any) => r.id) || []);
  const [attachments, setAttachments] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (dataset) {
      updateField("title", dataset.title || "");
      updateField("slug", dataset.slug || "");
      updateField("content", dataset.description || "");
      updateField("excerpt", dataset.excerpt || "");
    }
  }, [datasetId]);

  const title = getTranslation<string>("title", "") ?? "";
  const slug = getTranslation<string>("slug", "") ?? "";
  const content = getTranslation<string>("content", "") ?? "";
  const excerpt = getTranslation<string>("excerpt", "") ?? "";

  const handleFieldChange = (field: string, value: string) => {
    updateField(field, value);
    setIsDirty(true);
  };

  const markDirty = () => setIsDirty(true);

  const buildSaveData = (overrideStatus?: ContentStatus) => ({
    title,
    slug,
    description: content,
    excerpt,
    status: overrideStatus || status,
    tagNames: datasetTags,
    categoryId: categoryId || null,
    maturity,
    version,
    minYear: minYear ? parseInt(minYear, 10) : null,
    maxYear: maxYear ? parseInt(maxYear, 10) : null,
    license: license || null,
    citationText: citationText || null,
    codebookText: codebookText || null,
    sources: sources || null,
    isVisible,
    regionIds,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = buildSaveData();
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
      const data = buildSaveData("published");
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
        onAttachmentsChange={setAttachments}
      />

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
                onChange={(e) => { setCodebookText(e.target.value); markDirty(); }}
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
                onChange={(e) => { setSources(e.target.value); markDirty(); }}
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
    <ContentLanguageProvider defaultLanguage="en">
      <EditorInner {...props} />
    </ContentLanguageProvider>
  );
}
