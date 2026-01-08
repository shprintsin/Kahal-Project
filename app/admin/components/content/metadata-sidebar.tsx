"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Calendar, User, Tag, FileText, Shield, Hash, Paperclip } from "lucide-react";
import type { ContentStatus } from "@/app/admin/types/content-system.types";
import { SearchableSelect, TagInput } from "./searchable-select";
import { FileUploadWidget } from "./file-upload-widget";

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
        <SidebarCard title="Status" icon={<FileText className="w-3.5 h-3.5" />}>
          <SearchableSelect
            value={status}
            onValueChange={(v) => onStatusChange?.(v as ContentStatus)}
            options={statusOptions}
            placeholder="Select status"
          />
        </SidebarCard>
      )}

      {/* Dataset Details Card */}
      {(maturity || version || (minYear !== undefined)) && (
        <SidebarCard title="Data Details" icon={<Shield className="w-3.5 h-3.5" />}>
           <div className="space-y-3">
              {onMaturityChange && (
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase">Maturity</label>
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
                    <label className="text-[10px] text-white/40 uppercase">Version</label>
                    <input 
                        type="text" 
                        value={version || ""} 
                        onChange={(e) => onVersionChange(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-white/20"
                        placeholder="1.0.0"
                    />
                  </div>
              )}
              {(onMinYearChange || onMaxYearChange) && (
                  <div className="space-y-1">
                     <label className="text-[10px] text-white/40 uppercase">Year Range</label>
                     <div className="flex items-center gap-2">
                        <input
                           type="number"
                           value={minYear || ""}
                           onChange={(e) => onMinYearChange?.(e.target.value ? parseInt(e.target.value) : null)}
                           placeholder="Min"
                           className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-white/20"
                        />
                        <span className="text-white/20">-</span>
                        <input
                           type="number"
                           value={maxYear || ""}
                           onChange={(e) => onMaxYearChange?.(e.target.value ? parseInt(e.target.value) : null)}
                           placeholder="Max"
                           className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-white/20"
                        />
                     </div>
                  </div>
              )}
           </div>
        </SidebarCard>
      )}

      {/* Category Card */}
      <SidebarCard title="Category" icon={<Hash className="w-3.5 h-3.5" />}>
        <SearchableSelect
          value={category}
          onValueChange={(v) => onCategoryChange?.(v)}
          options={categoryOptions}
          onCreateNew={onCreateCategory}
          placeholder="Select category"
          createText="Create category"
        />
      </SidebarCard>

      {/* Tags Card */}
      {onTagsChange && (
        <SidebarCard title="Tags" icon={<Tag className="w-3.5 h-3.5" />}>
          <TagInput
            value={tags}
            onChange={onTagsChange}
            suggestions={tagSuggestions}
            onCreateTag={onCreateTag}
            placeholder="Search or create tags..."
          />
        </SidebarCard>
      )}

      {/* Attachments/Resources Card */}
      {onAttachmentsChange && (
        <SidebarCard title="Resources" icon={<Paperclip className="w-3.5 h-3.5" />}>
          <FileUploadWidget
            files={attachments}
            onFilesChange={onAttachmentsChange}
            accept="image/*,application/pdf,.doc,.docx"
            maxFiles={10}
            maxSize={10 * 1024 * 1024}
          />
        </SidebarCard>
      )}

      {/* Visibility Card */}
      {onVisibilityChange && (
        <SidebarCard title="Visibility" icon={<Shield className="w-3.5 h-3.5" />}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">
              {isPublic ? "Public" : "Private"}
            </span>
            <Switch
              checked={isPublic}
              onCheckedChange={onVisibilityChange}
              className="data-[state=checked]:bg-emerald-600"
            />
          </div>
        </SidebarCard>
      )}

      {/* Author Card */}
      {author && (
        <SidebarCard title="Author" icon={<User className="w-3.5 h-3.5" />}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-medium text-white">
              {author.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <span className="text-sm text-white/80">{author}</span>
          </div>
        </SidebarCard>
      )}

      {/* Dates Card */}
      <SidebarCard title="Dates" icon={<Calendar className="w-3.5 h-3.5" />}>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/40">Created</span>
            <span className="text-white/70">{createdAt}</span>
          </div>
          {updatedAt && (
            <div className="flex justify-between">
              <span className="text-white/40">Updated</span>
              <span className="text-white/70">{updatedAt}</span>
            </div>
          )}
        </div>
      </SidebarCard>

      {/* License Card */}
      {onLicenseChange && license && (
        <SidebarCard title="License" icon={<Shield className="w-3.5 h-3.5" />}>
          <SearchableSelect
            value={license}
            onValueChange={(v) => onLicenseChange?.(v)}
            options={licenseOptions}
            placeholder="Select license"
          />
        </SidebarCard>
      )}
    </div>
  );
}

/**
 * SidebarCard - Card wrapper for sidebar sections
 */
interface SidebarCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function SidebarCard({ title, icon, children, className }: SidebarCardProps) {
  return (
    <div
      className={cn(
        "bg-[#1a1a1a] rounded-lg",
        "border border-white/5",
        "overflow-hidden",
        className
      )}
    >
      <div className="px-3 py-2 border-b border-white/5 flex items-center gap-2">
        {icon && <span className="text-white/40">{icon}</span>}
        <span className="text-[10px] font-medium text-white/50 uppercase tracking-wide">
          {title}
        </span>
      </div>
      <div className="p-3">
        {children}
      </div>
    </div>
  );
}
