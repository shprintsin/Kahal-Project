"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, ChevronDown } from "lucide-react";

/**
 * InlineField - "Label: **Value**" inline display with edit capabilities
 * Used in Smart Ribbon for compact metadata display
 * 
 * Design: Minimal, looks like text until interacted with
 */

interface InlineFieldProps {
  label: string;
  value: string;
  editable?: boolean;
  onChange?: (value: string) => void;
  type?: "text" | "select" | "date" | "readonly";
  options?: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  /** Visual style variant */
  variant?: "default" | "compact" | "prominent";
  dir?: "ltr" | "rtl";
}

export function InlineField({
  label,
  value,
  editable = true,
  onChange,
  type = "text",
  options = [],
  placeholder = "—",
  className,
  variant = "default",
  dir,
}: InlineFieldProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [localValue, setLocalValue] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync local value
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClick = () => {
    if (editable && type === "text") {
      setIsEditing(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (localValue !== value) {
      onChange?.(localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur();
    }
    if (e.key === "Escape") {
      setLocalValue(value);
      setIsEditing(false);
    }
  };

  const displayValue = value || placeholder;
  const isEmpty = !value;

  // Style variants
  const labelStyles = {
    default: "text-xs font-medium text-muted-foreground/70 uppercase tracking-wide",
    compact: "text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider",
    prominent: "text-xs font-semibold text-muted-foreground uppercase tracking-wide",
  };

  const valueStyles = {
    default: "text-sm font-medium text-foreground",
    compact: "text-xs font-medium text-foreground",
    prominent: "text-sm font-semibold text-foreground",
  };

  return (
    <div className={cn("flex flex-col gap-0.5 min-w-0", className)} dir={dir}>
      {/* Label - always visible, small and muted */}
      <span className={labelStyles[variant]}>{label}</span>

      {/* Value/Input */}
      {isEditing && type === "text" ? (
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          dir={dir === "ltr" ? "ltr" : dir === "rtl" ? "rtl" : undefined}
          className={cn(
            "bg-transparent border-none outline-none p-0",
            "shadow-[inset_0_-1px_0_0_var(--primary)]",
            valueStyles[variant],
            "min-w-[60px]"
          )}
        />
      ) : type === "select" && editable ? (
        <Select value={value} onValueChange={(v) => onChange?.(v)}>
          <SelectTrigger
            className={cn(
              "h-auto p-0 border-none bg-transparent shadow-none",
              "focus:ring-0 focus:ring-offset-0",
              valueStyles[variant],
              "gap-1 min-w-[80px]"
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : type === "date" ? (
        <button
          onClick={handleClick}
          className={cn(
            "flex items-center gap-1 text-left",
            valueStyles[variant],
            editable && "hover:text-primary cursor-pointer transition-colors"
          )}
        >
          <span>{displayValue}</span>
        </button>
      ) : (
        <button
          onClick={handleClick}
          disabled={!editable || type === "readonly"}
          className={cn(
            "text-left truncate transition-colors",
            valueStyles[variant],
            editable && type !== "readonly" && "hover:text-primary cursor-pointer",
            isEmpty && "text-muted-foreground/40 italic font-normal"
          )}
        >
          {displayValue}
        </button>
      )}
    </div>
  );
}
