"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * FastEditCell - Text/input swap component for Fast Edit mode
 * In normal mode: renders as text
 * In edit mode: renders as input/select
 */

interface FastEditCellProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  editMode: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  type?: "text" | "select";
  options?: { value: string; label: string }[];
  className?: string;
  // Allow passing select props specifically
  selectProps?: React.SelectHTMLAttributes<HTMLSelectElement>;
}

export const FastEditCell = React.forwardRef<HTMLInputElement | HTMLSelectElement, FastEditCellProps>(
  ({ value, editMode, onChange, onBlur, type = "text", options = [], className, selectProps, onKeyDown, ...props }, ref) => {
    // Internal ref for text inputs if none provided
    const internalInputRef = React.useRef<HTMLInputElement>(null);
    const resolvedInputRef = (ref as React.RefObject<HTMLInputElement>) || internalInputRef;
    
    // Internal state for immediate feedback
    const [localValue, setLocalValue] = React.useState(value);

    // Sync local value when prop changes
    React.useEffect(() => {
      setLocalValue(value);
    }, [value]);

    // Handle internal changes
    const handleChange = (newValue: string) => {
      setLocalValue(newValue);
    };

    // Commit on blur
    const handleBlur = (e: React.FocusEvent) => {
      if (localValue !== value) {
        onChange?.(localValue);
      }
      onBlur?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent<any>) => {
      // Call external handler first
      onKeyDown?.(e);
      
      if (e.defaultPrevented) return;

      if (e.key === "Enter") {
        e.preventDefault();
        (e.target as HTMLElement).blur();
      }
      if (e.key === "Escape") {
        setLocalValue(value);
        (e.target as HTMLElement).blur();
      }
    };

    // Display mode - just text
    if (!editMode) {
      return (
        <span className={cn("truncate block w-full h-full min-h-[20px]", className)}>
          {type === "select"
            ? options.find((o) => o.value === value)?.label || value
            : value || "—"}
        </span>
      );
    }

    // Edit mode - input or select
    if (type === "select") {
      return (
        <select
          ref={ref as React.Ref<HTMLSelectElement>}
          value={localValue}
          onChange={(e) => {
            setLocalValue(e.target.value);
            onChange?.(e.target.value);
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full bg-transparent p-0 text-sm",
            "border-none outline-none focus:ring-0",
            "cursor-pointer",
            className
          )}
          {...selectProps}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        ref={resolvedInputRef}
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full bg-transparent p-0 text-sm",
          "border-none outline-none focus:ring-0",
          "placeholder:text-muted-foreground/40",
          className
        )}
        {...props}
      />
    );
  }
);
FastEditCell.displayName = "FastEditCell";
