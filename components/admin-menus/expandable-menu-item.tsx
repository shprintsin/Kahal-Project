"use client";

import React, { useState, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuickIconPicker } from "./quick-icon-picker";
import { PageSelector } from "./page-selector";
import { GripVertical, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuItem, ItemVariant } from "@/app/admin/types/menus";

interface ExpandableMenuItemProps {
  item: MenuItem;
  onChange: (item: MenuItem) => void;
  onDelete?: () => void;
  onAddChild?: () => void;
  allowNesting?: boolean;
  variantOptions?: ItemVariant[];
  isDragging?: boolean;
  isPlaceholder?: boolean;
}

export function ExpandableMenuItem({
  item,
  onChange,
  onDelete,
  onAddChild,
  allowNesting = false,
  variantOptions = ["DEFAULT"],
  isDragging = false,
  isPlaceholder = false,
}: ExpandableMenuItemProps) {
  const [linkType, setLinkType] = useState<"url" | "page">(
    item.pageId ? "page" : "url"
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id || `item-${Math.random()}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasChildren = item.children && item.children.length > 0;

  const updateField = (field: keyof MenuItem, value: any) => {
    onChange({ ...item, [field]: value });
  };

  // Auto-switch link type based on content
  useEffect(() => {
    if (item.pageId) setLinkType("page");
    else if (item.url) setLinkType("url");
  }, [item.pageId, item.url]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-menu-item
      className={cn(
        "group border rounded-lg bg-card transition-all hover:border-primary/50",
        isDragging && "opacity-50 shadow-lg",
        isPlaceholder && "border-dashed opacity-60"
      )}
    >
      {/* Main Row - All inline */}
      <div className="flex items-center gap-2 p-2">
        {/* Drag Handle */}
        {!isPlaceholder && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        {isPlaceholder && (
          <div className="p-1 w-6">
            <Plus className="h-4 w-4 text-muted-foreground" />
          </div>
        )}

        {/* Icon Picker */}
        <div className="shrink-0">
          <QuickIconPicker
            value={item.icon}
            onChange={(icon) => updateField("icon", icon)}
          />
        </div>

        {/* Label Input */}
        <Input
          value={item.label?.default || ""}
          onChange={(e) => updateField("label", { default: e.target.value, translations: item.label?.translations || {} })}
          placeholder={isPlaceholder ? "Press Enter to add item..." : "Menu item name"}
          className="flex-1 h-9 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          onKeyDown={(e) => {
            if (isPlaceholder && e.key === "Enter" && e.currentTarget.value.trim()) {
              e.preventDefault();
              // Focus will be handled by parent component
            }
          }}
        />

        {/* Link Input/Selector */}
        <div className="flex-1 max-w-xs">
          {linkType === "url" ? (
            <Input
              value={item.url || ""}
              onChange={(e) => {
                e.stopPropagation();
                updateField("url", e.target.value);
                updateField("pageId", undefined);
              }}
              placeholder="/path or https://..."
              className="h-9 text-sm border-input"
              onFocus={() => setLinkType("url")}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <PageSelector
              value={item.pageId || undefined}
              onChange={(pageId) => {
                updateField("pageId", pageId);
                updateField("url", undefined);
              }}
              placeholder="Select page..."
            />
          )}
        </div>

        {/* Link Type Toggle (subtle) */}
        <button
          type="button"
          onClick={() => setLinkType(linkType === "url" ? "page" : "url")}
          className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-colors"
          title={`Switch to ${linkType === "url" ? "page selector" : "URL input"}`}
        >
          {linkType === "url" ? "URL" : "Page"}
        </button>

        {/* Add Child Button (if nesting allowed) */}
        {allowNesting && onAddChild && !isPlaceholder && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onAddChild}
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Add sub-item"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}

        {/* Delete Button */}
        {onDelete && !isPlaceholder && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            type="button"
            title="Delete item"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Children (nested items) */}
      {allowNesting && hasChildren && !isPlaceholder && (
        <div className="pl-8 pb-2 pr-2 space-y-2 border-l-2 border-muted ml-4">
          {item.children?.map((child, index) => (
            <ExpandableMenuItem
              key={child.id}
              item={child}
              onChange={(updatedChild) => {
                const newChildren = [...(item.children || [])];
                newChildren[index] = updatedChild;
                updateField("children", newChildren);
              }}
              onDelete={() => {
                const newChildren = item.children?.filter(c => c.id !== child.id);
                updateField("children", newChildren);
              }}
              allowNesting={false}
              variantOptions={variantOptions}
            />
          ))}
        </div>
      )}
    </div>
  );
}
