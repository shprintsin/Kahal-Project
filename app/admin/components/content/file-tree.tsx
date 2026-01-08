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
  const [searchQuery, setSearchQuery] = React.useState("");
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(
    new Set()
  );
  
  // Selection Mode
  const [isSelectionMode, setIsSelectionMode] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  
  // Category Filter
  const [categoryFilter, setCategoryFilter] = React.useState<string | null>(null);

  // Get unique categories
  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    const traverse = (nodes: FileTreeItem[]) => {
      nodes.forEach(node => {
        if (node.category) cats.add(node.category);
        if (node.children) traverse(node.children);
      });
    };
    traverse(items);
    return Array.from(cats);
  }, [items]);

  // Filter items
  const filteredItems = React.useMemo(() => {
    if (!searchQuery.trim() && !categoryFilter) return items;
    
    const query = searchQuery.toLowerCase();
    
    // Helper to check if item matches filter
    const matchesFilter = (item: FileTreeItem) => {
      const matchesSearch = !query || 
        (item.slug || item.name).toLowerCase().includes(query);
      const matchesCategory = !categoryFilter || 
        item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    };

    const filterRecursive = (nodes: FileTreeItem[]): FileTreeItem[] => {
      return nodes.map(node => {
        // If it's a folder, check children first
        if (node.children) {
          const filteredChildren = filterRecursive(node.children);
          // If folder has matching children, return it with those children
          if (filteredChildren.length > 0) {
            return { ...node, children: filteredChildren };
          }
        }
        
        // If it's a file (or empty folder), check if it matches itself
        if (matchesFilter(node)) return node;
        
        return null;
      }).filter((n): n is FileTreeItem => n !== null);
    };
    
    return filterRecursive(items);
  }, [items, searchQuery, categoryFilter]);

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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
        <div className={cn("flex flex-col h-full bg-[#1a1a1a]", className)}>
          {/* Header */}
          <div className="p-3 border-b border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-white/50 uppercase tracking-wide">
                Files
              </span>
              <div className="flex items-center gap-1">
                {isSelectionMode && selectedIds.size > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBulkDelete}
                    className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-white/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
                {onFileCreate && !isSelectionMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onFileCreate()}
                    className="h-6 w-6 text-white/50 hover:text-white hover:bg-white/10"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Selection Mode Indicator */}
            {isSelectionMode && (
              <div className="flex items-center justify-between px-1 py-1 bg-white/5 rounded text-xs text-white/80">
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

            {/* Search & Filter */}
            <div className="flex gap-1">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search files..."
                  className="h-7 pl-7 pr-2 text-xs bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={cn(
                      "h-7 w-7 text-white/50 hover:text-white hover:bg-white/10",
                      categoryFilter && "text-blue-400 bg-blue-500/10"
                    )}
                  >
                    <Filter className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#252525] border-white/10 text-white min-w-[150px]" align="end">
                  <DropdownMenuLabel className="text-xs text-white/40">Filter by Category</DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={() => setCategoryFilter(null)}
                    className="text-xs cursor-pointer hover:bg-white/10 flex justify-between"
                  >
                    All
                    {!categoryFilter && <Check className="w-3 h-3 text-blue-400" />}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  {categories.map(cat => (
                    <DropdownMenuItem 
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className="text-xs cursor-pointer hover:bg-white/10 flex justify-between"
                    >
                      {cat}
                      {categoryFilter === cat && <Check className="w-3 h-3 text-blue-400" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
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
                  "hover:bg-white/10",
                  isDashboardActive ? "bg-blue-600/20 text-blue-400" : "text-white/80"
                )}
              >
                <span className={cn("text-white/50", isDashboardActive && "text-blue-400")}>
                  <LayoutDashboard className="w-4 h-4" />
                </span>
                <span className={isDashboardActive ? "font-medium" : ""}>
                  Dashboard
                </span>
              </button>
            )}

            <FileTreeList
              items={filteredItems}
              level={0}
              currentFileId={currentFileId}
              expandedFolders={expandedFolders}
              onToggleFolder={toggleFolder}
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
      <ContextMenuContent className="bg-[#252525] border-white/10 text-white w-48">
        <ContextMenuItem 
          onClick={toggleSelectionMode}
          className="hover:bg-white/10 cursor-pointer text-xs"
        >
          <CheckSquare className="w-3.5 h-3.5 mr-2" />
          {isSelectionMode ? "Exit Selection Mode" : "Select Items"}
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-white/10" />
        <ContextMenuItem 
          onClick={() => onFileCreate?.()}
          className="hover:bg-white/10 cursor-pointer text-xs"
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
  level: number;
  currentFileId?: string;
  expandedFolders: Set<string>;
  onToggleFolder: (id: string) => void;
  onFileSelect?: (item: FileTreeItem) => void;
  onFileDelete?: (ids: string[]) => void;
  onFileRename?: (id: string, newName: string) => void;
  isSelectionMode: boolean;
  selectedIds: Set<string>;
  onSelectionChange: (id: string, checked: boolean) => void;
}

function FileTreeList({
  items,
  level,
  currentFileId,
  expandedFolders,
  onToggleFolder,
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
          level={level}
          isActive={currentFileId === item.id}
          isExpanded={expandedFolders.has(item.id)}
          onToggle={() => onToggleFolder(item.id)}
          onSelect={() => onFileSelect?.(item)}
          onDelete={() => onFileDelete?.([item.id])} // Wrap single ID in array
          onRename={(newName) => onFileRename?.(item.id, newName)}
          expandedFolders={expandedFolders}
          onToggleFolder={onToggleFolder}
          onFileSelect={onFileSelect}
          onFileDelete={onFileDelete}
          onFileRename={onFileRename}
          currentFileId={currentFileId}
          isSelectionMode={isSelectionMode}
          isSelected={selectedIds.has(item.id)}
          onSelectionChange={onSelectionChange}
          selectedIds={selectedIds}
        />
      ))}
    </div>
  );
}

interface FileTreeNodeProps {
  item: FileTreeItem;
  level: number;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
  expandedFolders: Set<string>;
  onToggleFolder: (id: string) => void;
  onFileSelect?: (item: FileTreeItem) => void;
  onFileDelete?: (ids: string[]) => void;
  onFileRename?: (id: string, newName: string) => void;
  currentFileId?: string;
  isSelectionMode: boolean;
  isSelected: boolean;
  onSelectionChange: (id: string, checked: boolean) => void;
  selectedIds: Set<string>;
}

function FileTreeNode({
  item,
  level,
  isActive,
  isExpanded,
  onToggle,
  onSelect,
  onDelete,
  onRename,
  expandedFolders,
  onToggleFolder,
  onFileSelect,
  onFileDelete,
  onFileRename,
  currentFileId,
  isSelectionMode,
  isSelected,
  onSelectionChange,
  selectedIds,
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

  const isFolder = item.type === "folder";
  const hasChildren = item.children && item.children.length > 0;
  
  // Display Name: prefer slug, fallback to name
  const displayName = item.slug || item.name;

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={cn(
              "group flex items-center gap-1 py-1 px-2 rounded text-sm transition-colors cursor-pointer",
              "hover:bg-white/10",
              isActive && !isSelectionMode && "bg-blue-600/20 text-blue-400",
              isSelected && isSelectionMode && "bg-blue-600/20"
            )}
            style={{ paddingLeft: `${isSelectionMode ? 8 : level * 12 + 8}px` }}
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
                  className="border-white/20 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
              </div>
            )}

            {/* Expand/Collapse Icon */}
            {isFolder && !isSelectionMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
                className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-white/40 hover:text-white"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            )}

            {/* Icon & Status */}
            <div className="relative flex-shrink-0">
              <span className={cn("text-white/50", isActive && "text-blue-400")}>
                {isFolder ? (
                  isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
              </span>
              {/* Status Dot Indicator for files */}
              {item.status && !isFolder && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-[#1a1a1a] rounded-full p-[1px]">
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
                className="flex-1 bg-white/10 border border-white/20 rounded px-1 text-xs text-white outline-none ml-1 h-5"
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
                  "flex-1 text-left truncate transition-colors ml-1 select-none",
                  isActive ? "text-blue-400 font-medium" : "text-white/80"
                )}
              >
                {displayName}
              </div>
            )}

            {/* Inline Actions (only when not in selection mode and not renaming) */}
            {!isSelectionMode && !isRenaming && (
              <div className="opacity-0 group-hover:opacity-100 flex items-center ml-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRenaming(true);
                  }}
                  className="h-5 w-5 text-white/40 hover:text-white hover:bg-white/10"
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-[#252525] border-white/10 text-white w-48">
          <ContextMenuItem 
            onClick={() => setIsRenaming(true)}
            className="hover:bg-white/10 cursor-pointer text-xs"
          >
            <Edit2 className="w-3.5 h-3.5 mr-2" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem 
            onClick={onDelete}
            className="hover:bg-white/10 cursor-pointer text-xs text-red-400 focus:text-red-400"
          >
            <Trash2 className="w-3.5 h-3.5 mr-2" />
            Delete
          </ContextMenuItem>
          <ContextMenuSeparator className="bg-white/10" />
          <ContextMenuItem 
            onClick={() => onSelectionChange(item.id, true)}
            className="hover:bg-white/10 cursor-pointer text-xs"
          >
            <CheckSquare className="w-3.5 h-3.5 mr-2" />
            Select
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Children */}
      {isFolder && isExpanded && hasChildren && (
        <FileTreeList
          items={item.children!}
          level={level + 1}
          currentFileId={currentFileId}
          expandedFolders={expandedFolders}
          onToggleFolder={onToggleFolder}
          onFileSelect={onFileSelect}
          onFileDelete={onFileDelete}
          onFileRename={onFileRename}
          isSelectionMode={isSelectionMode}
          selectedIds={selectedIds}
          onSelectionChange={onSelectionChange}
        />
      )}
    </div>
  );
}
