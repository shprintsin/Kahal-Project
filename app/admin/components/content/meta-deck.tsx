"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { GhostTextarea } from "./ghost-input";

/**
 * MetaDeck - Collapsible excerpt/description drawer
 * Collapsed by default with minimal height preview
 * Expands on focus or click
 * Supports inline markdown only (bold/italic/code)
 */

interface MetaDeckProps {
  excerpt?: string;
  description?: string;
  onExcerptChange?: (value: string) => void;
  onDescriptionChange?: (value: string) => void;
  excerptPlaceholder?: string;
  descriptionPlaceholder?: string;
  defaultExpanded?: boolean;
  className?: string;
}

export function MetaDeck({
  excerpt = "",
  description = "",
  onExcerptChange,
  onDescriptionChange,
  excerptPlaceholder = "Write a brief excerpt for previews...",
  descriptionPlaceholder = "Meta description for SEO (max 160 chars)...",
  defaultExpanded = false,
  className,
}: MetaDeckProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  const [focusedField, setFocusedField] = React.useState<string | null>(null);

  // Auto-expand when a field is focused
  const isOpen = isExpanded || focusedField !== null;

  // Preview text when collapsed
  const hasContent = excerpt || description;
  const previewText = excerpt || description || "Add excerpt & meta description...";

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-out",
        "bg-muted/10 dark:bg-muted/5",
        "-mx-2 px-2",
        className
      )}
    >
      {/* Collapsed Header / Toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between gap-3",
          "py-3 text-left",
          "hover:bg-muted/20 transition-colors -mx-2 px-2",
          "group"
        )}
      >
        <div className="flex-1 min-w-0">
          {isOpen ? (
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Meta Information
            </span>
          ) : (
            <span className={cn(
              "text-sm truncate block",
              hasContent ? "text-muted-foreground" : "text-muted-foreground/50 italic"
            )}>
              {previewText}
            </span>
          )}
        </div>
        <span className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors flex-shrink-0">
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </span>
      </button>

      {/* Expandable Content */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          isOpen 
            ? "grid-rows-[1fr] opacity-100 pb-4" 
            : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 pt-2">
            {/* Excerpt Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                Excerpt
              </label>
              <GhostTextarea
                value={excerpt}
                onChange={(e) => onExcerptChange?.(e.target.value)}
                onFocus={() => setFocusedField("excerpt")}
                onBlur={() => setFocusedField(null)}
                placeholder={excerptPlaceholder}
                rows={2}
                inputSize="sm"
              />
              <p className="text-[10px] text-muted-foreground/50">
                Shown in previews. Supports **bold**, *italic*, `code`.
              </p>
            </div>

            {/* Description Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                Meta Description
              </label>
              <GhostTextarea
                value={description}
                onChange={(e) => onDescriptionChange?.(e.target.value)}
                onFocus={() => setFocusedField("description")}
                onBlur={() => setFocusedField(null)}
                placeholder={descriptionPlaceholder}
                rows={2}
                maxLength={160}
                inputSize="sm"
              />
              <p className="text-[10px] text-muted-foreground/50">
                {description.length}/160 characters • Used for SEO
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
