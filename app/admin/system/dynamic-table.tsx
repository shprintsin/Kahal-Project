"use client";

/**
 * DynamicTable
 * 
 * A field-driven table component that automatically generates columns
 * from ContentTypeDefinition fields. Supports fast-edit, selection,
 * deletion, and keyboard navigation.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { ContentTypeDefinition, FieldDefinition } from "./content-type-registry";
import { getListComponent, supportsFastEdit } from "./field-type-registry";

// ============================================
// Types
// ============================================

interface DynamicTableProps<T extends { id: string }> {
  contentType: ContentTypeDefinition;
  data: T[];
  
  // Fast Edit
  fastEditEnabled?: boolean;
  onCellChange?: (rowId: string, field: string, value: any) => void;
  
  // Selection
  selectedRows?: string[];
  onSelectionChange?: (ids: string[]) => void;
  
  // Actions
  onRowClick?: (row: T) => void;
  onRowDelete?: (rowId: string) => void;
  
  // Pagination (handled externally)
  className?: string;
}

// ============================================
// Component
// ============================================

export function DynamicTable<T extends { id: string }>({
  contentType,
  data,
  fastEditEnabled = false,
  onCellChange,
  selectedRows = [],
  onSelectionChange,
  onRowClick,
  onRowDelete,
  className,
}: DynamicTableProps<T>) {
  const isSelectable = !!onSelectionChange;
  const hasDelete = !!onRowDelete;
  
  // Get fields that should show in list
  const listFields = contentType.fields.filter(f => f.showInList !== false);
  
  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentIds = data.map((row) => row.id);
      const newSelection = [...new Set([...selectedRows, ...currentIds])];
      onSelectionChange?.(newSelection);
    } else {
      const currentIds = new Set(data.map((row) => row.id));
      onSelectionChange?.(selectedRows.filter((id) => !currentIds.has(id)));
    }
  };
  
  const handleRowSelect = (rowId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedRows, rowId]);
    } else {
      onSelectionChange?.(selectedRows.filter((id) => id !== rowId));
    }
  };
  
  // Row click handler
  const handleRowClick = (row: T, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("input") ||
      target.closest("button") ||
      target.closest("select") ||
      target.closest('[role="checkbox"]')
    ) {
      return;
    }
    onRowClick?.(row);
  };
  
  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!fastEditEnabled) return;
    
    const target = e.target as HTMLElement;
    const currentRow = target.getAttribute("data-grid-row");
    const currentCol = target.getAttribute("data-grid-col");
    
    if (!currentRow || !currentCol) return;
    
    const r = parseInt(currentRow);
    const c = parseInt(currentCol);
    let nextR = r;
    
    switch (e.key) {
      case "ArrowUp":
        if (target.tagName === "SELECT") return;
        nextR = Math.max(0, r - 1);
        e.preventDefault();
        break;
      case "ArrowDown":
        if (target.tagName === "SELECT") return;
        nextR = Math.min(data.length - 1, r + 1);
        e.preventDefault();
        break;
      default:
        return;
    }
    
    if (nextR !== r) {
      const nextInput = document.querySelector(
        `[data-grid-row="${nextR}"][data-grid-col="${c}"]`
      ) as HTMLElement;
      nextInput?.focus();
    }
  };
  
  // Computed values for selection state
  const currentIds = new Set(data.map((row) => row.id));
  const selectedOnPage = selectedRows.filter((id) => currentIds.has(id));
  const allSelected = data.length > 0 && selectedOnPage.length === data.length;
  const someSelected = selectedOnPage.length > 0 && selectedOnPage.length < data.length;
  
  // Get value from row by field key (supports nested paths)
  const getValue = (row: T, key: string): any => {
    return key.split(".").reduce((obj: any, k) => obj?.[k], row);
  };
  
  return (
    <div className={cn("w-full", className)} onKeyDown={handleKeyDown}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border/50">
              {isSelectable && (
                <TableHead className="w-[40px] pl-2">
                  <Checkbox
                    checked={allSelected}
                    // @ts-ignore
                    indeterminate={someSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              
              {listFields.map((field) => (
                <TableHead
                  key={field.key}
                  className={cn(
                    "text-xs font-medium text-muted-foreground/70 uppercase tracking-wide",
                    field.width
                  )}
                >
                  {field.label}
                </TableHead>
              ))}
              
              {hasDelete && <TableHead className="w-[50px]" />}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={listFields.length + (isSelectable ? 1 : 0) + (hasDelete ? 1 : 0)}
                  className="text-center py-16 text-muted-foreground"
                >
                  No {contentType.plural.toLowerCase()} found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => {
                const isSelected = selectedRows.includes(row.id);
                
                return (
                  <TableRow
                    key={row.id}
                    className={cn(
                      "border-b border-border/30 transition-colors",
                      onRowClick && "cursor-pointer",
                      isSelected && "bg-primary/5",
                      !isSelected && "hover:bg-muted/30"
                    )}
                    onClick={(e) => handleRowClick(row, e)}
                  >
                    {isSelectable && (
                      <TableCell className="w-[40px] pl-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleRowSelect(row.id, checked as boolean)
                          }
                          aria-label="Select row"
                        />
                      </TableCell>
                    )}
                    
                    {listFields.map((field, colIndex) => {
                      const value = getValue(row, field.key);
                      const isEditable = field.editable && fastEditEnabled && supportsFastEdit(field);
                      const ListComponent = getListComponent(field);
                      
                      return (
                        <TableCell key={field.key} className="py-3">
                          <ListComponent
                            value={value}
                            field={field}
                            row={row}
                            isEditing={isEditable}
                            onChange={(newValue) => onCellChange?.(row.id, field.key, newValue)}
                            {...(isEditable ? {
                              "data-grid-row": rowIndex,
                              "data-grid-col": colIndex,
                            } : {})}
                          />
                        </TableCell>
                      );
                    })}
                    
                    {hasDelete && (
                      <TableCell className="py-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRowDelete(row.id);
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
