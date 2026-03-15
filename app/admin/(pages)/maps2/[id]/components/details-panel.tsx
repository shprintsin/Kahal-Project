"use client";

import { useRef } from "react";
import { useMapStudio, type ReferenceLink } from "../store";
import {
  AdminSidebarCard,
  AdminFieldLabel,
  AdminDarkInput,
} from "@/app/admin/components/ui/admin-sidebar-card";
import { SearchableSelect, TagInput } from "@/app/admin/components/content/searchable-select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { uploadMediaFile } from "@/app/admin/actions/media";
import { toast } from "sonner";

interface DetailsPanelProps {
  categories: { value: string; label: string }[];
  tags: { id: string; name: string }[];
  regions: { id: string; name: string }[];
}

export function DetailsPanel({ categories, tags, regions }: DetailsPanelProps) {
  const { state, dispatch } = useMapStudio();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!state.rightPanelOpen || state.rightPanelMode !== "details") return null;

  const tagNames = tags.map((t) => t.name);
  const selectedTagNames = state.tagIds
    .map((id) => tags.find((t) => t.id === id)?.name)
    .filter(Boolean) as string[];

  const regionNames = regions.map((r) => r.name);
  const selectedRegionNames = state.regionIds
    .map((id) => regions.find((r) => r.id === id)?.name)
    .filter(Boolean) as string[];

  const handleTagsChange = (names: string[]) => {
    const ids = names
      .map((name) => tags.find((t) => t.name === name)?.id)
      .filter(Boolean) as string[];
    dispatch({ type: "SET_TAGS", tagIds: ids });
  };

  const handleRegionsChange = (names: string[]) => {
    const ids = names
      .map((name) => regions.find((r) => r.name === name)?.id)
      .filter(Boolean) as string[];
    dispatch({ type: "SET_REGIONS", regionIds: ids });
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadMediaFile(file);
      dispatch({
        type: "SET_THUMBNAIL",
        thumbnailId: result.id,
        thumbnailUrl: result.url,
      });
      toast.success("Thumbnail uploaded");
    } catch {
      toast.error("Failed to upload thumbnail");
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddLink = () => {
    dispatch({
      type: "SET_REFERENCE_LINKS",
      referenceLinks: [...state.referenceLinks, { title: "", url: "" }],
    });
  };

  const handleUpdateLink = (index: number, updates: Partial<ReferenceLink>) => {
    const updated = state.referenceLinks.map((link, i) =>
      i === index ? { ...link, ...updates } : link
    );
    dispatch({ type: "SET_REFERENCE_LINKS", referenceLinks: updated });
  };

  const handleRemoveLink = (index: number) => {
    dispatch({
      type: "SET_REFERENCE_LINKS",
      referenceLinks: state.referenceLinks.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="w-[320px] border-l border-border bg-card flex-shrink-0 flex flex-col">
      <div className="p-3 border-b border-border flex items-center gap-2">
        <span className="text-sm font-medium flex-1">Map Details</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => dispatch({ type: "TOGGLE_RIGHT_PANEL" })}
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 p-3">
        <AdminSidebarCard title="Content">
          <div className="space-y-3">
            <div className="space-y-1">
              <AdminFieldLabel>Slug</AdminFieldLabel>
              <AdminDarkInput
                value={state.slug}
                onChange={(e) => dispatch({ type: "SET_SLUG", slug: e.target.value })}
                placeholder="map-slug"
              />
            </div>
            <div className="space-y-1">
              <AdminFieldLabel>Description</AdminFieldLabel>
              <textarea
                value={state.description}
                onChange={(e) => dispatch({ type: "SET_DESCRIPTION", description: e.target.value })}
                placeholder="Map description..."
                rows={3}
                className="w-full bg-muted border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
          </div>
        </AdminSidebarCard>

        <AdminSidebarCard title="Classification">
          <div className="space-y-3">
            <div className="space-y-1">
              <AdminFieldLabel>Category</AdminFieldLabel>
              <SearchableSelect
                value={state.categoryId}
                onValueChange={(v) => dispatch({ type: "SET_CATEGORY", categoryId: v })}
                options={categories}
                placeholder="Select category..."
              />
            </div>
            <div className="space-y-1">
              <AdminFieldLabel>Tags</AdminFieldLabel>
              <TagInput
                value={selectedTagNames}
                onChange={handleTagsChange}
                suggestions={tagNames}
                placeholder="Add tags..."
              />
            </div>
            <div className="space-y-1">
              <AdminFieldLabel>Regions</AdminFieldLabel>
              <TagInput
                value={selectedRegionNames}
                onChange={handleRegionsChange}
                suggestions={regionNames}
                placeholder="Add regions..."
              />
            </div>
          </div>
        </AdminSidebarCard>

        <AdminSidebarCard title="Temporal">
          <div className="space-y-3">
            <div className="space-y-1">
              <AdminFieldLabel>Year</AdminFieldLabel>
              <AdminDarkInput
                type="number"
                value={state.year ?? ""}
                onChange={(e) =>
                  dispatch({ type: "SET_YEAR", year: e.target.value ? parseInt(e.target.value) : null })
                }
                placeholder="e.g. 1900"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <AdminFieldLabel>Year Min</AdminFieldLabel>
                <AdminDarkInput
                  type="number"
                  value={state.yearMin ?? ""}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_YEAR_RANGE",
                      yearMin: e.target.value ? parseInt(e.target.value) : null,
                      yearMax: state.yearMax,
                    })
                  }
                  placeholder="From"
                />
              </div>
              <div className="space-y-1">
                <AdminFieldLabel>Year Max</AdminFieldLabel>
                <AdminDarkInput
                  type="number"
                  value={state.yearMax ?? ""}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_YEAR_RANGE",
                      yearMin: state.yearMin,
                      yearMax: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  placeholder="To"
                />
              </div>
            </div>
            <div className="space-y-1">
              <AdminFieldLabel>Period</AdminFieldLabel>
              <AdminDarkInput
                value={state.period}
                onChange={(e) => dispatch({ type: "SET_PERIOD", period: e.target.value })}
                placeholder="e.g. Interwar"
              />
            </div>
          </div>
        </AdminSidebarCard>

        <AdminSidebarCard title="Details">
          <div className="space-y-3">
            <div className="space-y-1">
              <AdminFieldLabel>Version</AdminFieldLabel>
              <AdminDarkInput
                value={state.version}
                onChange={(e) => dispatch({ type: "SET_VERSION", version: e.target.value })}
                placeholder="1.0.0"
              />
            </div>
            <div className="space-y-1">
              <AdminFieldLabel>Thumbnail</AdminFieldLabel>
              {state.thumbnailUrl ? (
                <div className="relative group">
                  <img
                    src={state.thumbnailUrl}
                    alt="Thumbnail"
                    className="w-full h-24 object-cover rounded border border-border"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => dispatch({ type: "SET_THUMBNAIL", thumbnailId: null, thumbnailUrl: null })}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 gap-1.5 text-xs"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Thumbnail
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="hidden"
              />
            </div>
          </div>
        </AdminSidebarCard>

        <AdminSidebarCard title="Reference Links">
          <div className="space-y-2">
            {state.referenceLinks.map((link, i) => (
              <div key={i} className="space-y-1 p-2 bg-muted/50 rounded border border-border">
                <div className="flex items-center gap-1">
                  <AdminDarkInput
                    value={link.title}
                    onChange={(e) => handleUpdateLink(i, { title: e.target.value })}
                    placeholder="Link title"
                    className="text-xs"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={() => handleRemoveLink(i)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <AdminDarkInput
                  value={link.url}
                  onChange={(e) => handleUpdateLink(i, { url: e.target.value })}
                  placeholder="https://..."
                  className="text-xs"
                />
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full h-7 gap-1 text-xs"
              onClick={handleAddLink}
            >
              <Plus className="w-3 h-3" />
              Add Link
            </Button>
          </div>
        </AdminSidebarCard>
      </div>
    </div>
  );
}
