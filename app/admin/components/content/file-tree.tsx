"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Folder,
  FolderOpen,
  Search,
  Plus,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Filter,
  Check,
  Trash2,
  Edit2,
  CheckSquare,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import type { ContentStatus } from "@/app/admin/types/content-system.types";
import { StatusDot } from "./status-dot";

/**
 * FileTree - MS Loop / Obsidian style file navigation
 * Left sidebar with hierarchical file structure, filtering, and multi-select
 */

export interface FileTreeItem {
  id: string;
  name: string; // Used as fallback title
  slug?: string; // Displayed by default
  type: "file" | "folder";
  status?: ContentStatus;
  category?: string;
  children?: FileTreeItem[];
  path?: string;
}

interface FileTreeProps {
  items: FileTreeItem[];
  currentFileId?: string;
  onFileSelect?: (item: FileTreeItem) => void;
  onFileCreate?: (parentId?: string) => void;
  onFileDelete?: (ids: string[]) => void; // Changed to support multiple IDs
  onFileRename?: (id: string, newName: string) => void;
  onDashboardSelect?: () => void;
  isDashboardActive?: boolean;
  className?: string;
}

export function FileTree({
  items,
  currentFileId,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename,
  onDashboardSelect,
  isDashboardActive,
  className,
}: FileTreeProps) {
  // Flatten items recursively
  const flatItems = React.useMemo(() => {
    const results: FileTreeItem[] = [];
    const traverse = (nodes: FileTreeItem[]) => {
      nodes.forEach(node => {
        if (node.type === 'file') {
          results.push(node);
        }
        if (node.children) {
          traverse(node.children);
        }
      });
    };
    traverse(items);
    
    // Sort by slug or name
    return results.sort((a, b) => {
      const nameA = a.slug || a.name || '';
      const nameB = b.slug || b.name || '';
      return nameA.localeCompare(nameB);
    });
  }, [items]);

  // Selection Mode
  const [isSelectionMode, setIsSelectionMode] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  // Search
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter items
  const filteredItems = React.useMemo(() => {
    if (!searchQuery.trim()) return flatItems;
    
    const query = searchQuery.toLowerCase();
    return flatItems.filter(item => 
      (item.slug || item.name).toLowerCase().includes(query)
    );
  }, [flatItems, searchQuery]);

  const handleSelectionChange = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleBulkDelete = () => {
    if (onFileDelete && selectedIds.size > 0) {
      onFileDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
      setIsSelectionMode(false);
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds(new Set());
  };

  // Main Context Menu for Sidebar
  return (
    <ContextMenu>
      <ContextMenuTrigger className="block h-full">
        <div className={cn("flex flex-col h-full bg-card", className)}>
          {/* Header */}
          <div className="p-3 border-b border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Files
              </span>
              <div className="flex items-center gap-1">
                {isSelectionMode && selectedIds.size > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBulkDelete}
                    className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-accent"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
                {onFileCreate && !isSelectionMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onFileCreate()}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Selection Mode Indicator */}
            {isSelectionMode && (
              <div className="flex items-center justify-between px-1 py-1 bg-muted rounded text-xs text-foreground">
                <span>{selectedIds.size} selected</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 text-[10px]"
                  onClick={toggleSelectionMode}
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* Search */}
            <div className="flex gap-1">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search files..."
                  className="h-7 pl-7 pr-2 text-xs bg-muted border-border text-foreground placeholder:text-muted-foreground rounded-md"
                />
              </div>
            </div>
          </div>

          {/* File List */}
          <div className="flex-1 overflow-y-auto p-2">
            {/* Dashboard Item */}
            {onDashboardSelect && (
              <button
                onClick={onDashboardSelect}
                className={cn(
                  "w-full flex items-center gap-2 py-1 px-2 mb-1 rounded text-sm transition-colors",
                  "hover:bg-accent",
                  isDashboardActive ? "bg-blue-600/20 text-blue-400" : "text-foreground"
                )}
              >
                <span className={cn("text-muted-foreground", isDashboardActive && "text-blue-400")}>
                  <LayoutDashboard className="w-4 h-4" />
                </span>
                <span className={isDashboardActive ? "font-medium" : ""}>
                  Dashboard
                </span>
              </button>
            )}

            <FileTreeList
              items={filteredItems}
              currentFileId={currentFileId}
              onFileSelect={onFileSelect}
              onFileDelete={onFileDelete} // Pass original for single delete
              onFileRename={onFileRename}
              isSelectionMode={isSelectionMode}
              selectedIds={selectedIds}
              onSelectionChange={handleSelectionChange}
            />
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="bg-secondary border-border text-foreground w-48">
        <ContextMenuItem
          onClick={toggleSelectionMode}
          className="hover:bg-accent cursor-pointer text-xs"
        >
          <CheckSquare className="w-3.5 h-3.5 mr-2" />
          {isSelectionMode ? "Exit Selection Mode" : "Select Items"}
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-border" />
        <ContextMenuItem
          onClick={() => onFileCreate?.()}
          className="hover:bg-accent cursor-pointer text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-2" />
          New File
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

interface FileTreeListProps {
  items: FileTreeItem[];
  currentFileId?: string;
  onFileSelect?: (item: FileTreeItem) => void;
  onFileDelete?: (ids: string[]) => void;
  onFileRename?: (id: string, newName: string) => void;
  isSelectionMode: boolean;
  selectedIds: Set<string>;
  onSelectionChange: (id: string, checked: boolean) => void;
}

function FileTreeList({
  items,
  currentFileId,
  onFileSelect,
  onFileDelete,
  onFileRename,
  isSelectionMode,
  selectedIds,
  onSelectionChange,
}: FileTreeListProps) {
  return (
    <div className="space-y-0.5">
      {items.map((item) => (
        <FileTreeNode
          key={item.id}
          item={item}
          isActive={currentFileId === item.id}
          onSelect={() => onFileSelect?.(item)}
          onDelete={() => onFileDelete?.([item.id])} // Wrap single ID in array
          onRename={(newName) => onFileRename?.(item.id, newName)}
          isSelectionMode={isSelectionMode}
          isSelected={selectedIds.has(item.id)}
          onSelectionChange={onSelectionChange}
        />
      ))}
    </div>
  );
}

interface FileTreeNodeProps {
  item: FileTreeItem;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
  isSelectionMode: boolean;
  isSelected: boolean;
  onSelectionChange: (id: string, checked: boolean) => void;
}

function FileTreeNode({
  item,
  isActive,
  onSelect,
  onDelete,
  onRename,
  isSelectionMode,
  isSelected,
  onSelectionChange,
}: FileTreeNodeProps) {
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [renameName, setRenameName] = React.useState(item.slug || item.name);

  // Focus input when rename starts
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isRenaming]);

  const handleRename = () => {
    if (renameName.trim()) {
      onRename(renameName.trim());
    }
    setIsRenaming(false);
  };

  // Display Name: prefer slug, fallback to name
  // Truncate logic can reside in CSS
  const displayName = item.slug || item.name;

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={cn(
              "group flex items-center gap-2 py-1.5 px-3 rounded-md text-sm transition-all cursor-pointer",
              "hover:bg-muted",
              isActive && !isSelectionMode && "bg-blue-600/20 text-blue-400 shadow-sm",
              isSelected && isSelectionMode && "bg-blue-600/30"
            )}
            onClick={(e) => {
              // If selection mode, toggle selection
              if (isSelectionMode) {
                e.preventDefault();
                onSelectionChange(item.id, !isSelected);
              }
            }}
          >
            {/* Selection Checkbox */}
            {isSelectionMode && (
              <div className="mr-2">
                <Checkbox 
                  checked={isSelected}
                  onCheckedChange={(checked) => onSelectionChange(item.id, !!checked)}
                  className="border-border data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-3.5 w-3.5"
                />
              </div>
            )}

            {/* Icon & Status */}
            <div className="relative flex-shrink-0">
              <span className={cn("text-muted-foreground", isActive && "text-blue-400")}>
                 <FileText className="w-4 h-4" />
              </span>
              {/* Status Dot Indicator for files */}
              {item.status && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-card rounded-full p-[1px]">
                  <StatusDot status={item.status} size="sm" className="w-1.5 h-1.5" />
                </div>
              )}
            </div>

            {/* Name or Rename Input */}
            {isRenaming ? (
              <input
                ref={inputRef}
                type="text"
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
                  if (e.key === "Escape") setIsRenaming(false);
                }}
                className="flex-1 bg-accent border border-border rounded px-1.5 py-0.5 text-xs text-foreground outline-none h-6 w-full"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div 
                onClick={(e) => {
                  if (!isSelectionMode) {
                    e.stopPropagation();
                    onSelect();
                  }
                }}
                className={cn(
                  "flex-1 text-left truncate transition-colors select-none text-xs",
                  isActive ? "text-blue-400 font-medium" : "text-foreground/70 group-hover:text-foreground"
                )}
                title={displayName}
              >
                {displayName}
              </div>
            )}

            {/* Inline Actions (only when not in selection mode and not renaming) */}
            {!isSelectionMode && !isRenaming && (
              <div className="hidden group-hover:flex items-center ml-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRenaming(true);
                  }}
                  className="h-5 w-5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-sm"
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-secondary border-border text-foreground w-48 shadow-xl">
          <ContextMenuItem
            onClick={() => setIsRenaming(true)}
            className="hover:bg-accent cursor-pointer text-xs focus:bg-accent focus:text-foreground"
          >
            <Edit2 className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem 
            onClick={onDelete}
            className="hover:bg-accent cursor-pointer text-xs text-red-400 focus:text-red-400 focus:bg-accent"
          >
            <Trash2 className="w-3.5 h-3.5 mr-2" />
            Delete
          </ContextMenuItem>
          <ContextMenuSeparator className="bg-border" />
          <ContextMenuItem
            onClick={() => onSelectionChange(item.id, true)}
            className="hover:bg-accent cursor-pointer text-xs focus:bg-accent focus:text-foreground"
          >
            <CheckSquare className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            Select
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
