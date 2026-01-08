"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * FloatingLabelInput - Input with animated floating label
 * Label sits inside the box and shrinks/moves to top-left on focus/value
 */

interface FloatingLabelInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export function FloatingLabelInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  error,
  className,
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const isFloating = isFocused || value.length > 0;

  return (
    <div className={cn("relative", className)}>
      {/* Floating Label */}
      <label
        onClick={() => inputRef.current?.focus()}
        className={cn(
          "absolute left-3 transition-all duration-200 ease-out cursor-text",
          "pointer-events-none select-none",
          isFloating
            ? // Floating state - small, above input
              "-top-2 text-xs font-medium text-primary bg-background px-1"
            : // Default state - inside input
              "top-1/2 -translate-y-1/2 text-muted-foreground",
          error && "text-destructive"
        )}
      >
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>

      {/* Input */}
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={isFloating ? placeholder : undefined}
        className={cn(
          "w-full px-3 py-3 bg-transparent",
          "border-b-2 transition-colors duration-200",
          "outline-none focus:ring-0",
          isFocused
            ? "border-primary"
            : error
            ? "border-destructive"
            : "border-muted hover:border-muted-foreground/50",
          "placeholder:text-muted-foreground/40"
        )}
      />

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
