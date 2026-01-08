"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trash2, X, Archive, Send } from "lucide-react";
import type { ContentStatus } from "@/app/admin/types/content-system.types";

/**
 * BulkActionsBar - Floating bar for bulk operations
 * Only visible when rows are selected
 * Fixed position at bottom with fade-in animation
 */

interface BulkActionsBarProps {
  selectedCount: number;
  onDelete?: () => void;
  onStatusChange?: (status: ContentStatus) => void;
  onExport?: () => void;
  onClose?: () => void;
  visible?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  onDelete,
  onStatusChange,
  onExport,
  onClose,
  visible = true,
}: BulkActionsBarProps) {
  const isVisible = visible && selectedCount > 0;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        "bg-background/95 backdrop-blur-sm",
        "shadow-lg px-6 py-3",
        "flex items-center gap-4",
        "transition-all duration-300",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none"
      )}
    >
      {/* Selection Count */}
      <span className="text-sm font-medium">
        {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
      </span>

      {/* Divider */}
      <span className="w-px h-6 bg-border" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {onStatusChange && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStatusChange("published")}
              className="gap-1.5"
            >
              <Send className="w-4 h-4" />
              Publish
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStatusChange("archived")}
              className="gap-1.5"
            >
              <Archive className="w-4 h-4" />
              Archive
            </Button>
          </>
        )}

        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        )}
      </div>

      {/* Close Button */}
      {onClose && (
        <>
          <span className="w-px h-6 bg-border" />
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  );
}
