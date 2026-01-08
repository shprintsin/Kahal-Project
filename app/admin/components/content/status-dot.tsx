"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * StatusDot - Minimal status indicator with colored dot
 * Replaces heavy badges with clean, minimal dots
 */

import type { ContentStatus } from "@/app/admin/types/content-system.types";

/**
 * StatusDot - Minimal status indicator with colored dot
 * Replaces heavy badges with clean, minimal dots
 */

interface StatusDotProps {
  status: ContentStatus;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string; // Add className prop support
}

const statusConfig: Record<ContentStatus, { color: string; label: string }> = {
  draft: {
    color: "bg-slate-400",
    label: "Draft",
  },
  published: {
    color: "bg-emerald-500",
    label: "Published",
  },
  archived: {
    color: "bg-amber-500",
    label: "Archived",
  },
  changes_requested: {
    color: "bg-rose-500",
    label: "Changes Requested",
  },
};

const sizeConfig = {
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
  lg: "w-2.5 h-2.5",
} as const;

export function StatusDot({
  status,
  showLabel = false,
  size = "md",
  className,
}: StatusDotProps) {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "rounded-full flex-shrink-0",
          config.color,
          sizeConfig[size]
        )}
        aria-hidden="true"
      />
      {showLabel && (
        <span className="text-sm text-muted-foreground">{config.label}</span>
      )}
    </span>
  );
}
