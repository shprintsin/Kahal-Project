"use client";

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
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FastEditCell } from "./fast-edit-cell";
import { TablePagination } from "./table-pagination";
import type { ContentTableColumn } from "@/app/admin/types/content-system.types";

interface ContentTableProps<T extends { id: string }> {
  data: T[];
  columns: ContentTableColumn<T>[];
  // Fast Edit
  fastEditEnabled?: boolean;
  onCellChange?: (rowId: string, field: string, value: unknown) => void;
  // Selection
  selectedRows?: string[];
  onSelectionChange?: (ids: string[]) => void;
  // Navigation
  onRowClick?: (row: T) => void;
  onRowDelete?: (rowId: string) => void; // New prop
  // Pagination
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
  // Styling
  emptyText?: string;
  rowClassName?: (row: T) => string | undefined;
  className?: string;
}

export function ContentTable<T extends { id: string }>({
  data,
  columns,
  fastEditEnabled = false,
  onCellChange,
  selectedRows = [],
  onSelectionChange,
  onRowClick,
  onRowDelete,
  pagination,
  emptyText = "No content found.",
  rowClassName,
  className,
}: ContentTableProps<T>) {
  const isSelectable = !!onSelectionChange;
  const hasDelete = !!onRowDelete;

  // Handle select all (current page)
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageIds = data.map((row) => row.id);
      const newSelection = [...new Set([...selectedRows, ...currentPageIds])];
      onSelectionChange?.(newSelection);
    } else {
      const currentPageIds = new Set(data.map((row) => row.id));
      onSelectionChange?.(selectedRows.filter((id) => !currentPageIds.has(id)));
    }
  };

  // Handle individual row selection
  const handleRowSelect = (rowId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedRows, rowId]);
    } else {
      onSelectionChange?.(selectedRows.filter((id) => id !== rowId));
    }
  };

  // Get cell value from accessor
  const getCellValue = (row: T, accessor: ContentTableColumn<T>["accessor"]): unknown => {
    if (typeof accessor === "function") {
      return accessor(row);
    }
    return row[accessor];
  };

  // Handle row click (navigate to editor)
  const handleRowClick = (row: T, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("input") ||
      target.closest("button") ||
      target.closest("select") ||
      target.closest('[role="checkbox"]') ||
      target.closest("a")
    ) {
      return;
    }
    onRowClick?.(row);
  };

  // Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!fastEditEnabled) return;

    const target = e.target as HTMLElement;
    const currentRow = target.getAttribute("data-grid-row");
    const currentCol = target.getAttribute("data-grid-col");

    if (!currentRow || !currentCol) return;

    const r = parseInt(currentRow);
    const c = parseInt(currentCol);

    let nextR = r;
    let nextC = c;

    switch (e.key) {
      case "ArrowUp":
        if (target.tagName === "SELECT") return; // Let select handle up/down
        nextR = Math.max(0, r - 1);
        e.preventDefault();
        break;
      case "ArrowDown":
        if (target.tagName === "SELECT") return;
        nextR = Math.min(data.length - 1, r + 1);
        e.preventDefault();
        break;
      case "ArrowLeft":
        if (target.tagName === "INPUT") {
             const input = target as HTMLInputElement;
             if (input.selectionStart !== 0 || input.selectionEnd !== 0) return;
        }
        // Find previous editable col? Simplified: just use DOM order for now or try c-1
        // Since we explicitly want to support standard nav, let's keep it simple
        // Usually Tab is for Horizontal
        return; 
      case "ArrowRight":
         if (target.tagName === "INPUT") {
            const input = target as HTMLInputElement;
            if (input.selectionStart !== input.value.length) return;
        }
        return;
      default:
        return;
    }

    if (nextR !== r || nextC !== c) {
      const nextInput = document.querySelector(
        `[data-grid-row="${nextR}"][data-grid-col="${nextC}"]`
      ) as HTMLElement;
      nextInput?.focus();
    }
  };

  const currentPageIds = new Set(data.map((row) => row.id));
  const selectedOnPage = selectedRows.filter((id) => currentPageIds.has(id));
  const allSelected = data.length > 0 && selectedOnPage.length === data.length;
  const someSelected = selectedOnPage.length > 0 && selectedOnPage.length < data.length;

  return (
    <div className={cn("w-full p-1", className)} onKeyDown={handleKeyDown}>
      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-muted/50 border-b border-border">
              {/* Selection Checkbox Column */}
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

              {/* Data Columns */}
              {columns.map((col) => (
                <TableHead
                  key={col.id}
                  className={cn(
                    "text-xs font-semibold text-foreground/80 uppercase tracking-wider py-4",
                    col.width,
                    col.className,
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center"
                  )}
                >
                  {col.header}
                </TableHead>
              ))}

              {/* Delete Column */}
              {hasDelete && <TableHead className="w-[50px]"></TableHead>}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (isSelectable ? 1 : 0) + (hasDelete ? 1 : 0)}
                  className="text-center py-16 text-muted-foreground"
                >
                  {emptyText}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => {
                const isSelected = selectedRows.includes(row.id);

                return (
                  <TableRow
                    key={row.id}
                    className={cn(
                      "border-b border-border transition-colors",
                      onRowClick && "cursor-pointer",
                      isSelected && "bg-primary/10 hover:bg-primary/20",
                      !isSelected && "hover:bg-muted/50",
                      rowClassName?.(row)
                    )}
                    onClick={(e) => handleRowClick(row, e)}
                  >
                    {/* Selection Checkbox */}
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

                    {/* Data Cells */}
                    {columns.map((col, colIndex) => {
                      const value = getCellValue(row, col.accessor);
                      const stringValue = String(value ?? "");
                      const isTitleColumn = col.id === "title";
                      const isEditable = (col.editable && fastEditEnabled && !isTitleColumn) || false;

                      return (
                        <TableCell
                          key={col.id}
                          className={cn(
                            "py-3",
                            col.width,
                            col.className,
                            col.align === "right" && "text-right",
                            col.align === "center" && "text-center"
                          )}
                        >
                          {col.render ? (
                            col.render(row, isEditable)
                          ) : isTitleColumn && onRowClick ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRowClick(row);
                              }}
                              className="text-sm font-semibold text-white hover:text-primary hover:underline text-right w-full"
                            >
                              {stringValue || "Untitled"}
                            </button>
                          ) : isEditable ? (
                            <FastEditCell
                              value={stringValue}
                              editMode={true}
                              onChange={(v) =>
                                onCellChange?.(
                                  row.id,
                                  typeof col.accessor === "string"
                                    ? col.accessor
                                    : col.id,
                                  v
                                )
                              }
                              type={col.editType as any}
                              options={col.editOptions}
                              data-grid-row={rowIndex}
                              data-grid-col={colIndex}
                            />
                          ) : (
                            <span className={cn(
                              "text-sm",
                              !stringValue && "text-muted-foreground/40"
                            )}>
                              {stringValue || "—"}
                            </span>
                          )}
                        </TableCell>
                      );
                    })}

                    {/* Delete Action */}
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

      {/* Pagination Footer */}
      {pagination && pagination.totalItems > 0 && (
        <TablePagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
        />
      )}
    </div>
  );
}
