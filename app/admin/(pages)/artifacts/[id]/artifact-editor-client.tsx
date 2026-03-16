"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  LoopStyleEditor,
  UnifiedCanvas,
  FileTree,
  ContentLanguageProvider,
  useContentLanguage,
  EditorContextMenu,
} from "@/app/admin/components/content";
import { SearchableSelect, TagInput } from "@/app/admin/components/content/searchable-select";
import {
  AdminSidebarCard,
  AdminFieldLabel,
  AdminDarkInput,
} from "@/app/admin/components/ui/admin-sidebar-card";
import { Switch } from "@/components/ui/switch";
import type { ContentLanguage, ContentStatus } from "@/app/admin/types/content-system.types";
import type { FileTreeItem } from "@/app/admin/components/content/file-tree";
import { createArtifact, updateArtifact } from "@/app/admin/actions/artifacts";

interface ArtifactEditorClientProps {
  artifact: any;
  categories: any[];
  periods: any[];
  places: any[];
  regions: any[];
  tags: any[];
  artifacts: any[];
  isNew: boolean;
}

function EditorInner({
  artifact,
  categories,
  periods,
  places,
  regions,
  tags,
  artifacts,
  isNew,
}: ArtifactEditorClientProps) {
  const router = useRouter();
  const artifactId = artifact?.id;

  const {
    currentLanguage,
    setLanguage,
    getTranslation,
    updateField,
  } = useContentLanguage();

  const [isDirty, setIsDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState<ContentStatus>(
    (artifact?.status as ContentStatus) || "draft"
  );

  const [category, setCategory] = React.useState(artifact?.artifactCategoryId || "");
  const [description, setDescription] = React.useState(artifact?.description || "");
  const [year, setYear] = React.useState<number | "">(artifact?.year || "");
  const [dateDisplay, setDateDisplay] = React.useState(artifact?.dateDisplay || "");
  const [dateSort, setDateSort] = React.useState(
    artifact?.dateSort ? new Date(artifact.dateSort).toISOString().split("T")[0] : ""
  );
  const [displayScans, setDisplayScans] = React.useState(artifact?.displayScans ?? true);
  const [displayTexts, setDisplayTexts] = React.useState(artifact?.displayTexts ?? true);
  const [sources, setSources] = React.useState<string[]>(
    Array.isArray(artifact?.sources) ? artifact.sources : []
  );

  const [tagIds, setTagIds] = React.useState<string[]>(
    artifact?.tags?.map((t: any) => t.id) || []
  );
  const [regionIds, setRegionIds] = React.useState<string[]>(
    artifact?.regions?.map((r: any) => r.id) || []
  );
  const [periodIds, setPeriodIds] = React.useState<string[]>(
    artifact?.periods?.map((p: any) => p.id) || []
  );
  const [placeIds, setPlaceIds] = React.useState<string[]>(
    artifact?.places?.map((p: any) => p.id) || []
  );

  const categoryOptions = React.useMemo(
    () => categories.map((c: any) => ({ value: c.id, label: c.title })),
    [categories]
  );

  const tagNames = React.useMemo(() => tags.map((t: any) => t.name), [tags]);
  const selectedTagNames = React.useMemo(
    () =>
      tagIds
        .map((id) => tags.find((t: any) => t.id === id)?.name)
        .filter(Boolean) as string[],
    [tagIds, tags]
  );

  const regionNames = React.useMemo(() => regions.map((r: any) => r.name), [regions]);
  const selectedRegionNames = React.useMemo(
    () =>
      regionIds
        .map((id) => regions.find((r: any) => r.id === id)?.name)
        .filter(Boolean) as string[],
    [regionIds, regions]
  );

  const periodNames = React.useMemo(() => periods.map((p: any) => p.name || p.title), [periods]);
  const selectedPeriodNames = React.useMemo(
    () =>
      periodIds
        .map((id) => periods.find((p: any) => p.id === id)?.name || periods.find((p: any) => p.id === id)?.title)
        .filter(Boolean) as string[],
    [periodIds, periods]
  );

  const placeNames = React.useMemo(() => places.map((p: any) => p.name || p.geoname), [places]);
  const selectedPlaceNames = React.useMemo(
    () =>
      placeIds
        .map((id) => {
          const p = places.find((p: any) => p.id === id);
          return p?.name || p?.geoname;
        })
        .filter(Boolean) as string[],
    [placeIds, places]
  );

  React.useEffect(() => {
    if (artifact) {
      updateField("title", artifact.title || "");
      updateField("slug", artifact.slug || "");
      updateField("content", artifact.content || "");
      updateField("excerpt", artifact.excerpt || "");
    }
  }, [artifactId]);

  const title = getTranslation<string>("title", "") ?? "";
  const slug = getTranslation<string>("slug", "") ?? "";
  const content = getTranslation<string>("content", "") ?? "";
  const excerpt = getTranslation<string>("excerpt", "") ?? "";

  const handleFieldChange = (field: string, value: string) => {
    updateField(field, value);
    setIsDirty(true);
  };

  const markDirty = () => setIsDirty(true);

  const handleTagsChange = (names: string[]) => {
    const ids = names
      .map((name) => tags.find((t: any) => t.name === name)?.id)
      .filter(Boolean) as string[];
    setTagIds(ids);
    markDirty();
  };

  const handleRegionsChange = (names: string[]) => {
    const ids = names
      .map((name) => regions.find((r: any) => r.name === name)?.id)
      .filter(Boolean) as string[];
    setRegionIds(ids);
    markDirty();
  };

  const handlePeriodsChange = (names: string[]) => {
    const ids = names
      .map((name) => periods.find((p: any) => (p.name || p.title) === name)?.id)
      .filter(Boolean) as string[];
    setPeriodIds(ids);
    markDirty();
  };

  const handlePlacesChange = (names: string[]) => {
    const ids = names
      .map((name) => places.find((p: any) => (p.name || p.geoname) === name)?.id)
      .filter(Boolean) as string[];
    setPlaceIds(ids);
    markDirty();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        title,
        slug,
        content,
        contentI18n: {},
        titleI18n: {},
        description: description || undefined,
        descriptionI18n: {},
        excerpt: excerpt || undefined,
        excerptI18n: {},
        year: year === "" ? undefined : Number(year),
        dateDisplay: dateDisplay || undefined,
        dateSort: dateSort || undefined,
        displayScans,
        displayTexts,
        sources,
        artifactCategoryId: category || undefined,
        tagIds,
        regionIds,
        periodIds,
        placeIds,
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
    <div className="space-y-3">
      <AdminSidebarCard title="Status">
        <SearchableSelect
          value={status}
          onValueChange={(v) => { setStatus(v as ContentStatus); markDirty(); }}
          options={[
            { value: "draft", label: "Draft" },
            { value: "published", label: "Published" },
            { value: "archived", label: "Archived" },
          ]}
          placeholder="Select status..."
        />
      </AdminSidebarCard>

      <AdminSidebarCard title="Category">
        <SearchableSelect
          value={category}
          onValueChange={(v) => { setCategory(v); markDirty(); }}
          options={categoryOptions}
          placeholder="Select category..."
        />
      </AdminSidebarCard>

      <AdminSidebarCard title="Year & Date">
        <div className="space-y-2">
          <div>
            <AdminFieldLabel>Year</AdminFieldLabel>
            <AdminDarkInput
              type="number"
              value={year}
              onChange={(e) => { setYear(e.target.value === "" ? "" : Number(e.target.value)); markDirty(); }}
              placeholder="e.g. 1850"
            />
          </div>
          <div>
            <AdminFieldLabel>Date Display</AdminFieldLabel>
            <AdminDarkInput
              type="text"
              value={dateDisplay}
              onChange={(e) => { setDateDisplay(e.target.value); markDirty(); }}
              placeholder="e.g. circa 1850"
            />
          </div>
          <div>
            <AdminFieldLabel>Date Sort</AdminFieldLabel>
            <AdminDarkInput
              type="date"
              value={dateSort}
              onChange={(e) => { setDateSort(e.target.value); markDirty(); }}
            />
          </div>
        </div>
      </AdminSidebarCard>

      <AdminSidebarCard title="Description">
        <textarea
          value={description}
          onChange={(e) => { setDescription(e.target.value); markDirty(); }}
          placeholder="Short description..."
          rows={3}
          className="w-full bg-muted border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-border resize-y"
        />
      </AdminSidebarCard>

      <AdminSidebarCard title="Display Options">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <AdminFieldLabel>Display Scans</AdminFieldLabel>
            <Switch
              checked={displayScans}
              onCheckedChange={(v) => { setDisplayScans(v); markDirty(); }}
            />
          </div>
          <div className="flex items-center justify-between">
            <AdminFieldLabel>Display Texts</AdminFieldLabel>
            <Switch
              checked={displayTexts}
              onCheckedChange={(v) => { setDisplayTexts(v); markDirty(); }}
            />
          </div>
        </div>
      </AdminSidebarCard>

      <AdminSidebarCard title="Sources">
        <div className="space-y-2">
          {sources.map((src, i) => (
            <div key={i} className="flex gap-1">
              <AdminDarkInput
                value={src}
                onChange={(e) => {
                  const updated = [...sources];
                  updated[i] = e.target.value;
                  setSources(updated);
                  markDirty();
                }}
                placeholder="Source reference"
              />
              <button
                type="button"
                onClick={() => { setSources(sources.filter((_, j) => j !== i)); markDirty(); }}
                className="text-muted-foreground hover:text-foreground px-1"
              >
                x
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => { setSources([...sources, ""]); markDirty(); }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            + Add source
          </button>
        </div>
      </AdminSidebarCard>

      <AdminSidebarCard title="Tags" collapsible defaultOpen>
        <TagInput
          value={selectedTagNames}
          onChange={handleTagsChange}
          suggestions={tagNames}
          placeholder="Add tags..."
        />
      </AdminSidebarCard>

      <AdminSidebarCard title="Regions" collapsible defaultOpen>
        <TagInput
          value={selectedRegionNames}
          onChange={handleRegionsChange}
          suggestions={regionNames}
          placeholder="Add regions..."
        />
      </AdminSidebarCard>

      <AdminSidebarCard title="Periods" collapsible defaultOpen>
        <TagInput
          value={selectedPeriodNames}
          onChange={handlePeriodsChange}
          suggestions={periodNames}
          placeholder="Add periods..."
        />
      </AdminSidebarCard>

      <AdminSidebarCard title="Places" collapsible defaultOpen>
        <TagInput
          value={selectedPlaceNames}
          onChange={handlePlacesChange}
          suggestions={placeNames}
          placeholder="Add places..."
        />
      </AdminSidebarCard>
    </div>
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
    <ContentLanguageProvider defaultLanguage="he">
      <EditorInner {...props} />
    </ContentLanguageProvider>
  );
}
