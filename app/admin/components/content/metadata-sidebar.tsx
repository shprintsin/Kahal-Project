"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Calendar, User, Tag, FileText, Shield, Hash, Paperclip, Image as ImageIcon, Trash2 } from "lucide-react";
import type { ContentStatus } from "@/app/admin/types/content-system.types";
import { SearchableSelect, TagInput } from "./searchable-select";
import { FileUploadWidget } from "./file-upload-widget";
import { AdminSidebarCard, AdminFieldLabel, AdminDarkInput } from "@/app/admin/components/ui/admin-sidebar-card";

/**
 * MetadataSidebar - Right sidebar with metadata cards (Loop style)
 */

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  file?: File;
}

interface MetadataSidebarProps {
  // Status
  status?: ContentStatus;
  onStatusChange?: (status: ContentStatus) => void;

  // Category
  category: string;
  onCategoryChange?: (category: string) => void;
  categoryOptions?: { value: string; label: string }[];
  onCreateCategory?: (name: string) => Promise<void>;

  // Author (readonly)
  author?: string;

  // Dates (readonly)
  createdAt: string;
  updatedAt?: string;

  // Tags
  tags?: string[];
  onTagsChange?: (tags: string[]) => void;
  tagSuggestions?: string[];
  onCreateTag?: (tag: string) => Promise<void>;

  // Attachments/Resources
  attachments?: UploadedFile[];
  onAttachmentsChange?: (files: UploadedFile[]) => void;

  // Visibility
  isPublic?: boolean;
  onVisibilityChange?: (isPublic: boolean) => void;

  // License
  license?: string;
  onLicenseChange?: (license: string) => void;
  licenseOptions?: { value: string; label: string }[];
  
  // Thumbnail
  thumbnailUrl?: string | null;
  onThumbnailChange?: (file: File) => Promise<void>;
  onThumbnailRemove?: () => void; // Actually, onThumbnailChange(null) can handle remove, but explicit is nicer.
  // Wait, let's keep it simple.

  // Dataset specific (optional)
  maturity?: string;
  onMaturityChange?: (value: string) => void;
  version?: string;
  onVersionChange?: (value: string) => void;
  minYear?: number | null;
  onMinYearChange?: (value: number | null) => void;
  maxYear?: number | null;
  onMaxYearChange?: (value: number | null) => void;

  className?: string;
}

export function MetadataSidebar({
  status,
  onStatusChange,
  category,
  onCategoryChange,
  categoryOptions = [
    { value: "Tutorial", label: "Tutorial" },
    { value: "Guide", label: "Guide" },
    { value: "Design", label: "Design" },
    { value: "News", label: "News" },
  ],
  onCreateCategory,
  author,
  createdAt,
  updatedAt,
  tags = [],
  onTagsChange,
  tagSuggestions = [],
  onCreateTag,
  attachments = [],
  onAttachmentsChange,
  isPublic = true,
  onVisibilityChange,
  license,
  onLicenseChange,
  licenseOptions = [
    { value: "CC BY 4.0", label: "CC BY 4.0" },
    { value: "MIT", label: "MIT" },
    { value: "All Rights Reserved", label: "All Rights" },
  ],
  maturity,
  onMaturityChange,
  version,
  onVersionChange,
  minYear,
  onMinYearChange,
  maxYear,
  onMaxYearChange,
  className,
}: MetadataSidebarProps) {
  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" },
  ];

  const maturityOptions = [
    { value: "Raw", label: "Raw" },
    { value: "Preliminary", label: "Preliminary" },
    { value: "Provisional", label: "Provisional" },
    { value: "Validated", label: "Validated" },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Status Card */}
      {status && (
        <AdminSidebarCard title="Status" icon={<FileText className="w-3.5 h-3.5" />}>
          <SearchableSelect
            value={status}
            onValueChange={(v) => onStatusChange?.(v as ContentStatus)}
            options={statusOptions}
            placeholder="Select status"
          />
        </AdminSidebarCard>
      )}

      {/* Dataset Details Card */}
      {(maturity || version || (minYear !== undefined)) && (
        <AdminSidebarCard title="Data Details" icon={<Shield className="w-3.5 h-3.5" />}>
           <div className="space-y-3">
              {onMaturityChange && (
                  <div className="space-y-1">
                    <AdminFieldLabel>Maturity</AdminFieldLabel>
                    <SearchableSelect
                        value={maturity || "Raw"}
                        onValueChange={(v) => onMaturityChange(v)}
                        options={maturityOptions}
                        placeholder="Select maturity"
                    />
                  </div>
              )}
              {onVersionChange && (
                  <div className="space-y-1">
                    <AdminFieldLabel>Version</AdminFieldLabel>
                    <input 
                        type="text" 
                        value={version || ""} 
                        onChange={(e) => onVersionChange(e.target.value)}
                        className="w-full bg-muted border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-border"
                        placeholder="1.0.0"
                    />
                  </div>
              )}
              {(onMinYearChange || onMaxYearChange) && (
                  <div className="space-y-1">
                     <AdminFieldLabel>Year Range</AdminFieldLabel>
                     <div className="flex items-center gap-2">
                        <input
                           type="number"
                           value={minYear || ""}
                           onChange={(e) => onMinYearChange?.(e.target.value ? parseInt(e.target.value) : null)}
                           placeholder="Min"
                           className="w-full bg-muted border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-border"
                        />
                        <span className="text-muted-foreground">-</span>
                        <input
                           type="number"
                           value={maxYear || ""}
                           onChange={(e) => onMaxYearChange?.(e.target.value ? parseInt(e.target.value) : null)}
                           placeholder="Max"
                           className="w-full bg-muted border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-border"
                        />
                     </div>
                  </div>
              )}
           </div>
        </AdminSidebarCard>
      )}

      {/* Category Card */}
      <AdminSidebarCard title="Category" icon={<Hash className="w-3.5 h-3.5" />}>
        <SearchableSelect
          value={category}
          onValueChange={(v) => onCategoryChange?.(v)}
          options={categoryOptions}
          onCreateNew={onCreateCategory}
          placeholder="Select category"
          createText="Create category"
        />
      </AdminSidebarCard>

      {/* Tags Card */}
      {onTagsChange && (
        <AdminSidebarCard title="Tags" icon={<Tag className="w-3.5 h-3.5" />}>
          <TagInput
            value={tags}
            onChange={onTagsChange}
            suggestions={tagSuggestions}
            onCreateTag={onCreateTag}
            placeholder="Search or create tags..."
          />
        </AdminSidebarCard>
      )}

      {/* Attachments/Resources Card */}
      {onAttachmentsChange && (
        <AdminSidebarCard title="Resources" icon={<Paperclip className="w-3.5 h-3.5" />}>
          <FileUploadWidget
            files={attachments}
            onFilesChange={onAttachmentsChange}
            accept="image/*,application/pdf,.doc,.docx"
            maxFiles={10}
            maxSize={10 * 1024 * 1024}
          />
        </AdminSidebarCard>
      )}

      {/* Visibility Card */}
      {onVisibilityChange && (
        <AdminSidebarCard title="Visibility" icon={<Shield className="w-3.5 h-3.5" />}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {isPublic ? "Public" : "Private"}
            </span>
            <Switch
              checked={isPublic}
              onCheckedChange={onVisibilityChange}
              className="data-[state=checked]:bg-emerald-600"
            />
          </div>
        </AdminSidebarCard>
      )}

      {/* Author Card */}
      {author && (
        <AdminSidebarCard title="Author" icon={<User className="w-3.5 h-3.5" />}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-medium text-primary-foreground">
              {author.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <span className="text-sm text-foreground/80">{author}</span>
          </div>
        </AdminSidebarCard>
      )}

      {/* Dates Card */}
      <AdminSidebarCard title="Dates" icon={<Calendar className="w-3.5 h-3.5" />}>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span className="text-foreground/70">{createdAt}</span>
          </div>
          {updatedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Updated</span>
              <span className="text-foreground/70">{updatedAt}</span>
            </div>
          )}
        </div>
      </AdminSidebarCard>

      {/* License Card */}
      {onLicenseChange && license && (
        <AdminSidebarCard title="License" icon={<Shield className="w-3.5 h-3.5" />}>
          <SearchableSelect
            value={license}
            onValueChange={(v) => onLicenseChange?.(v)}
            options={licenseOptions}
            placeholder="Select license"
          />
        </AdminSidebarCard>
      )}
    </div>
  );
}

