"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";

/**
 * TablePagination - Footer pagination for content tables
 * Shows "Showing 1-10 of 50" with prev/next controls
 */

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className,
}: TablePaginationProps) {
  const { isRtl } = useLanguage();
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-3 px-1",
        "text-sm text-muted-foreground",
        className
      )}
    >
      {/* Items count */}
      <div className="flex-shrink-0">
        <span>
          Showing{" "}
          <span className="font-medium text-foreground">{startItem}</span>
          {" - "}
          <span className="font-medium text-foreground">{endItem}</span>
          {" of "}
          <span className="font-medium text-foreground">{totalItems}</span>
        </span>
      </div>

      {/* Page size selector */}
      {onPageSizeChange && (
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 px-2 text-sm bg-transparent border-none focus:ring-0 cursor-pointer"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrev}
          className="h-8 w-8 p-0"
        >
          <PrevIcon className="w-4 h-4" />
        </Button>

        {/* Page numbers - show max 5 */}
        <div className="hidden sm:flex items-center gap-0.5">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            return (
              <Button
                key={pageNum}
                variant={pageNum === currentPage ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  "h-8 w-8 p-0 text-xs",
                  pageNum === currentPage && "pointer-events-none"
                )}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        {/* Mobile: show current/total */}
        <span className="sm:hidden text-xs px-2">
          {currentPage} / {totalPages}
        </span>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          className="h-8 w-8 p-0"
        >
          <NextIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
