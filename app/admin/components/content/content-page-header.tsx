"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Zap, Plus, Filter, X } from "lucide-react";
import type { ContentStatus } from "@/app/admin/types/content-system.types";

/**
 * ContentPageHeader - Header component with search, filters, and toggles
 * 
 * Layout:
 * - Title row: Title, subtitle, primary action (New button)
 * - Controls row: Search, Status filter, Date filter, Fast Edit toggle
 */

interface ContentPageHeaderProps {
  title: string;
  subtitle?: string;
  // Search
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  // Filters
  statusFilter?: ContentStatus | "all";
  onStatusFilterChange?: (status: ContentStatus | "all") => void;
  dateFilter?: string;
  onDateFilterChange?: (date: string) => void;
  showFilters?: boolean;
  // Fast Edit
  fastEditEnabled?: boolean;
  onFastEditToggle?: () => void;
  showFastEditToggle?: boolean;
  // Actions
  actions?: React.ReactNode;
  onNewClick?: () => void;
  newButtonLabel?: string;
}

export function ContentPageHeader({
  title,
  subtitle,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  statusFilter = "all",
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange,
  showFilters = true,
  fastEditEnabled = false,
  onFastEditToggle,
  showFastEditToggle = true,
  actions,
  onNewClick,
  newButtonLabel = "New",
}: ContentPageHeaderProps) {
  const hasActiveFilters = statusFilter !== "all" || dateFilter;

  return (
    <div className="space-y-4 mb-6">
      {/* Title Row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground text-sm mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Primary Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
          {onNewClick && (
            <Button onClick={onNewClick} size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              {newButtonLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        {onSearchChange && (
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
            <Input
              type="search"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-8 h-9 text-sm bg-muted/30"
            />
          </div>
        )}

        {/* Status Filter */}
        {showFilters && onStatusFilterChange && (
          <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as ContentStatus | "all")}>
            <SelectTrigger className="w-[130px] h-9 text-sm bg-muted/30">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Date Filter */}
        {showFilters && onDateFilterChange && (
          <Select value={dateFilter || "all"} onValueChange={(v) => onDateFilterChange(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[130px] h-9 text-sm bg-muted/30">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onStatusFilterChange?.("all");
              onDateFilterChange?.("");
            }}
            className="h-9 text-muted-foreground hover:text-foreground gap-1"
          >
            <X className="w-3 h-3" />
            Clear
          </Button>
        )}

        {/* Spacer */}
        <div className="flex-1 hidden md:block" />

        {/* Fast Edit Toggle */}
        {showFastEditToggle && onFastEditToggle && (
          <div className="flex items-center gap-2 ml-auto">
            <Switch
              id="fast-edit"
              checked={fastEditEnabled}
              onCheckedChange={onFastEditToggle}
              className="data-[state=checked]:bg-amber-500"
            />
            <Label
              htmlFor="fast-edit"
              className={cn(
                "flex items-center gap-1 cursor-pointer text-sm transition-colors",
                fastEditEnabled ? "text-amber-600 dark:text-amber-400 font-medium" : "text-muted-foreground"
              )}
            >
              <Zap className={cn("w-3.5 h-3.5", fastEditEnabled && "fill-current")} />
              Fast Edit
            </Label>
          </div>
        )}
      </div>
    </div>
  );
}
