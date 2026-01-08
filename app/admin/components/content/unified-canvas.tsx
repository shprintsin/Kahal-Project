"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * UnifiedCanvas - Seamless document editor where everything flows as one
 * 
 * Structure:
 * - Title (large H1)
 * - Slug with prefix (e.g., "/posts/")
 * - Description (subtle divider before content)
 * - Content (main body)
 * 
 * All fields feel like one continuous text document
 */

interface UnifiedCanvasProps {
  // Title
  title: string;
  onTitleChange: (value: string) => void;
  titlePlaceholder?: string;

  // Slug
  slug: string;
  onSlugChange: (value: string) => void;
  slugPrefix?: string;
  slugPlaceholder?: string;

  // Description (excerpt)
  description: string;
  onDescriptionChange: (value: string) => void;
  descriptionPlaceholder?: string;

  // Content
  content: string;
  onContentChange: (value: string) => void;
  contentPlaceholder?: string;

  // Key navigation callback
  onFieldNavigate?: (from: string, direction: "up" | "down") => void;

  className?: string;
}

export interface UnifiedCanvasSeparatorProps {
  label?: string;
  className?: string;
}

export function UnifiedCanvasSeparator({ label, className }: UnifiedCanvasSeparatorProps) {
  return (
    <div className={cn("flex items-center gap-3 py-4", className)}>
      <div className="flex-1 h-px bg-border/20" />
      {label && (
        <span className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-semibold">
          {label}
        </span>
      )}
      <div className="flex-1 h-px bg-border/20" />
    </div>
  );
}

export function UnifiedCanvas({
  title,
  onTitleChange,
  titlePlaceholder = "Untitled",
  slug,
  onSlugChange,
  slugPrefix = "/posts/",
  slugPlaceholder = "post-slug",
  description,
  onDescriptionChange,
  descriptionPlaceholder = "Write a brief description...",
  content,
  onContentChange,
  contentPlaceholder = "Start writing...\n\nType / for commands",
  onFieldNavigate,
  className,
}: UnifiedCanvasProps) {
  // Refs for key navigation
  const titleRef = React.useRef<HTMLInputElement>(null);
  const slugRef = React.useRef<HTMLInputElement>(null);
  const descRef = React.useRef<HTMLTextAreaElement>(null);
  const contentRef = React.useRef<HTMLTextAreaElement>(null);

  const fieldOrder = ["title", "slug", "description", "content"];
  const refMap = {
    title: titleRef,
    slug: slugRef,
    description: descRef,
    content: contentRef,
  };

  // Handle key navigation between fields
  const handleKeyDown = (
    e: React.KeyboardEvent,
    field: string,
    isAtStart: boolean,
    isAtEnd: boolean
  ) => {
    const currentIndex = fieldOrder.indexOf(field);

    // Arrow Up at start of field → go to previous field
    if (e.key === "ArrowUp" && isAtStart && currentIndex > 0) {
      e.preventDefault();
      const prevField = fieldOrder[currentIndex - 1] as keyof typeof refMap;
      refMap[prevField].current?.focus();
      onFieldNavigate?.(field, "up");
    }

    // Arrow Down at end of field → go to next field
    if (e.key === "ArrowDown" && isAtEnd && currentIndex < fieldOrder.length - 1) {
      e.preventDefault();
      const nextField = fieldOrder[currentIndex + 1] as keyof typeof refMap;
      refMap[nextField].current?.focus();
      onFieldNavigate?.(field, "down");
    }

    // Tab → go to next field
    if (e.key === "Tab" && !e.shiftKey && currentIndex < fieldOrder.length - 1) {
      e.preventDefault();
      const nextField = fieldOrder[currentIndex + 1] as keyof typeof refMap;
      refMap[nextField].current?.focus();
    }

    // Shift+Tab → go to previous field
    if (e.key === "Tab" && e.shiftKey && currentIndex > 0) {
      e.preventDefault();
      const prevField = fieldOrder[currentIndex - 1] as keyof typeof refMap;
      refMap[prevField].current?.focus();
    }

    // Enter on title/slug → go to next field
    if (e.key === "Enter" && (field === "title" || field === "slug")) {
      e.preventDefault();
      const nextField = fieldOrder[currentIndex + 1] as keyof typeof refMap;
      refMap[nextField].current?.focus();
    }
  };

  // Auto-resize textareas
  const autoResize = (el: HTMLTextAreaElement | null, minHeight: number = 60) => {
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
    }
  };

  React.useEffect(() => {
    autoResize(descRef.current, 40);
  }, [description]);

  React.useEffect(() => {
    autoResize(contentRef.current, 300);
  }, [content]);

  return (
    <div className={cn("space-y-0", className)}>
      {/* Title - Large H1 */}
      {/* ... (title input) */}
      <input
        ref={titleRef}
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e, "title", true, true)}
        placeholder={titlePlaceholder}
        className={cn(
          "w-full bg-transparent border-none outline-none",
          "text-4xl sm:text-5xl font-bold text-foreground",
          "placeholder:text-muted-foreground/50",
          "py-2 focus:ring-0"
        )}
      />

      {/* Slug with prefix */}
      <div className="flex items-center py-2" dir="ltr">
        <span className="text-muted-foreground/60 text-sm font-mono select-none">
          {slugPrefix}
        </span>
        <input
          ref={slugRef}
          type="text"
          value={slug}
          onChange={(e) => onSlugChange(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
          onKeyDown={(e) => handleKeyDown(e, "slug", e.currentTarget.selectionStart === 0, e.currentTarget.selectionStart === slug.length)}
          placeholder={slugPlaceholder}
          className={cn(
            "flex-1 bg-transparent border-none outline-none",
            "text-sm font-mono text-foreground/80",
            "placeholder:text-muted-foreground/40",
            "focus:ring-0"
          )}
        />
      </div>

      {/* Visual divider */}
      <div className="h-px bg-border/40 my-4" />

      {/* Description/Excerpt */}
      <textarea
        ref={descRef}
        value={description}
        onChange={(e) => {
          onDescriptionChange(e.target.value);
          autoResize(e.target, 40);
        }}
        onKeyDown={(e) => {
          const el = e.currentTarget;
          handleKeyDown(
            e,
            "description",
            el.selectionStart === 0,
            el.selectionStart === description.length
          );
        }}
        placeholder={descriptionPlaceholder}
        rows={1}
        className={cn(
          "w-full bg-transparent border-none outline-none resize-none",
          "text-lg text-muted-foreground italic",
          "placeholder:text-muted-foreground/30 placeholder:italic",
          "focus:ring-0 leading-relaxed min-h-[40px]"
        )}
      />

      {/* Content Separator */}
      <UnifiedCanvasSeparator label="Content" />

      {/* Main Content */}
      <textarea
        ref={contentRef}
        value={content}
        onChange={(e) => {
          onContentChange(e.target.value);
          autoResize(e.target, 300);
        }}
        onKeyDown={(e) => {
          const el = e.currentTarget;
          handleKeyDown(
            e,
            "content",
            el.selectionStart === 0,
            el.selectionStart === content.length
          );
        }}
        placeholder={contentPlaceholder}
        className={cn(
          "w-full bg-transparent border-none outline-none resize-none",
          "text-base text-foreground leading-[1.8]",
          "placeholder:text-muted-foreground/30",
          "focus:ring-0 min-h-[300px]",
          "font-[system-ui,_-apple-system,_sans-serif]"
        )}
      />
    </div>
  );
}
