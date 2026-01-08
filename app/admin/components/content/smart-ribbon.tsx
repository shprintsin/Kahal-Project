"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { InlineField } from "./inline-field";
import type { SmartRibbonField } from "@/app/admin/types/content-system.types";

/**
 * SmartRibbon - Auto-fitting metadata grid for editors (Bento Box style)
 * Organizes metadata in a horizontal, auto-fitting grid layout
 * 
 * Layout:
 * - Row 1 (Tinies): Slug (flex), Category (fixed), Status (fixed)
 * - Row 2 (Tinies): Author, Date, License
 * - Mobile: Fields stack vertically
 * - Desktop: Dense 1-2 row layout
 */

interface SmartRibbonProps {
  fields: SmartRibbonField[];
  onChange?: (key: string, value: string) => void;
  className?: string;
}

export function SmartRibbon({
  fields,
  onChange,
  className,
}: SmartRibbonProps) {
  return (
    <div
      className={cn(
        // Container styling - subtle visual separation
        "py-4 px-2 -mx-2",
        "bg-muted/20 dark:bg-muted/10",
        className
      )}
    >
      {/* Auto-fit grid for fields */}
      <div
        className={cn(
          "grid gap-x-8 gap-y-4",
          // Responsive columns: auto-fit with min 120px
          "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
        )}
      >
        {fields.map((field) => (
          <div
            key={field.key}
            className={cn(
              "min-w-0",
              // Flex fields span 2 columns on larger screens
              field.width === "flex" && "sm:col-span-2"
            )}
          >
            <InlineField
              label={field.label}
              value={field.value}
              editable={field.type !== "readonly"}
              onChange={(v) => onChange?.(field.key, v)}
              type={field.type}
              options={field.options}
              placeholder={field.placeholder || "—"}
              variant="compact"
              dir={field.dir}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * SmartRibbonDivided - Two-row variant for dense metadata
 */
interface SmartRibbonDividedProps {
  row1: SmartRibbonField[];
  row2: SmartRibbonField[];
  onChange?: (key: string, value: string) => void;
  className?: string;
}

export function SmartRibbonDivided({
  row1,
  row2,
  onChange,
  className,
}: SmartRibbonDividedProps) {
  return (
    <div
      className={cn(
        "py-3 px-2 -mx-2",
        "bg-muted/20 dark:bg-muted/10",
        "space-y-3",
        className
      )}
    >
      {/* Row 1 */}
      <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
        {row1.map((field) => (
          <div
            key={field.key}
            className={cn(
              "min-w-0",
              field.width === "flex" && "flex-1 min-w-[200px]",
              field.width === "fixed" && "flex-shrink-0",
              field.width === "auto" && "flex-shrink-0"
            )}
          >
            <InlineField
              label={field.label}
              value={field.value}
              editable={field.type !== "readonly"}
              onChange={(v) => onChange?.(field.key, v)}
              type={field.type}
              options={field.options}
              placeholder={field.placeholder || "—"}
              variant="compact"
              dir={field.dir}
            />
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-border/50" />

      {/* Row 2 */}
      <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
        {row2.map((field) => (
          <div
            key={field.key}
            className={cn(
              "min-w-0 flex-shrink-0"
            )}
          >
            <InlineField
              label={field.label}
              value={field.value}
              editable={field.type !== "readonly"}
              onChange={(v) => onChange?.(field.key, v)}
              type={field.type}
              options={field.options}
              placeholder={field.placeholder || "—"}
              variant="compact"
              dir={field.dir}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * SmartRibbonRow - Single row variant for simpler layouts
 */
interface SmartRibbonRowProps {
  children: React.ReactNode;
  className?: string;
}

export function SmartRibbonRow({ children, className }: SmartRibbonRowProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start gap-x-8 gap-y-3",
        "py-3 px-2 -mx-2",
        "bg-muted/20 dark:bg-muted/10",
        className
      )}
    >
      {children}
    </div>
  );
}
