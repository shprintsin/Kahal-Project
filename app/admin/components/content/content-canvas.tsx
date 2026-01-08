"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";

/**
 * ContentCanvas - Infinite canvas for body content
 * Borderless, centered content area with max-width constraint
 * 
 * Features:
 * - Centered column with ~750px max-width for readability
 * - Drag-and-drop image upload
 * - Auto-resize textarea
 * - Markdown-ready styling
 */

interface ContentCanvasProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  maxWidth?: string;
  className?: string;
  onImageDrop?: (file: File) => Promise<string | void>;
}

export function ContentCanvas({
  value,
  onChange,
  placeholder = "Start writing...\n\nType / for commands",
  minHeight = "60vh",
  maxWidth = "750px",
  className,
  onImageDrop,
}: ContentCanvasProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  // Auto-resize textarea based on content
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const minHeightPx = typeof minHeight === "string" && minHeight.includes("vh")
        ? (parseInt(minHeight) / 100) * window.innerHeight
        : parseInt(minHeight);
      textarea.style.height = `${Math.max(textarea.scrollHeight, minHeightPx)}px`;
    }
  }, [value, minHeight]);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onImageDrop) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!onImageDrop) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((f) => f.type.startsWith("image/"));

    if (imageFile) {
      setIsUploading(true);
      try {
        const url = await onImageDrop(imageFile);
        if (url) {
          // Insert image markdown at cursor or end
          const textarea = textareaRef.current;
          if (textarea) {
            const cursorPos = textarea.selectionStart;
            const before = value.slice(0, cursorPos);
            const after = value.slice(cursorPos);
            const imageMarkdown = `\n![${imageFile.name}](${url})\n`;
            onChange(before + imageMarkdown + after);
          }
        }
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div
      className={cn(
        "w-full flex justify-center",
        "py-8 px-4",
        "relative",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary/5 border-2 border-dashed border-primary/30 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2 text-primary">
            <Upload className="w-8 h-8" />
            <span className="text-sm font-medium">Drop image here</span>
          </div>
        </div>
      )}

      {/* Upload indicator */}
      {isUploading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Uploading image...</span>
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="w-full" style={{ maxWidth }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full bg-transparent resize-none",
            "text-lg leading-[1.8] tracking-[-0.01em]",
            "border-none outline-none",
            "placeholder:text-muted-foreground/25",
            "focus:ring-0 focus:outline-none",
            // Smooth, readable font for content
            "font-[system-ui,_-apple-system,_sans-serif]"
          )}
          style={{ minHeight }}
        />
      </div>
    </div>
  );
}

/**
 * ContentCanvasPreview - Read-only rendered preview
 */
interface ContentCanvasPreviewProps {
  content: string;
  maxWidth?: string;
  className?: string;
}

export function ContentCanvasPreview({
  content,
  maxWidth = "750px",
  className,
}: ContentCanvasPreviewProps) {
  return (
    <div
      className={cn(
        "w-full flex justify-center",
        "py-8 px-4",
        className
      )}
    >
      <div
        className="w-full prose prose-slate dark:prose-invert prose-lg"
        style={{ maxWidth }}
      >
        <div className="whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  );
}
