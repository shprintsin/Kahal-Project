"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * GhostInput - Borderless input with subtle hover/focus states
 * Core component of the "invisible UI" design philosophy
 * 
 * Philosophy:
 * - Default: No borders, transparent background - looks like regular text
 * - Hover: Light gray background
 * - Focus: No ring, subtle bottom border or slightly darker background
 */

interface GhostInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  inputSize?: "sm" | "md" | "lg" | "xl" | "title";
}

const sizeStyles = {
  sm: "px-1.5 py-1 text-sm",
  md: "px-2 py-1.5 text-base",
  lg: "px-2.5 py-2 text-lg",
  xl: "px-3 py-2.5 text-xl font-medium",
  title: "px-0 py-2 text-4xl font-bold tracking-tight",
} as const;

export const GhostInput = React.forwardRef<HTMLInputElement, GhostInputProps>(
  ({ className, inputSize = "md", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          // Base styles - invisible by default, looks like regular text
          "w-full bg-transparent border-none outline-none",
          "transition-all duration-150 ease-out",
          // Remove all default browser styling
          "appearance-none rounded-none",
          // Hover state - subtle background
          "hover:bg-slate-100/80 dark:hover:bg-slate-800/40",
          // Focus state - bottom border accent, no ring
          "focus:bg-slate-50/50 dark:focus:bg-slate-800/20",
          "focus:shadow-[inset_0_-2px_0_0_var(--primary)]",
          // Placeholder styling - low contrast
          "placeholder:text-muted-foreground/40 placeholder:font-normal",
          // Size variants
          sizeStyles[inputSize],
          className
        )}
        {...props}
      />
    );
  }
);

GhostInput.displayName = "GhostInput";

/**
 * GhostTextarea - Borderless textarea variant
 */
interface GhostTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  inputSize?: "sm" | "md" | "lg";
}

export const GhostTextarea = React.forwardRef<HTMLTextAreaElement, GhostTextareaProps>(
  ({ className, inputSize = "md", ...props }, ref) => {
    const textareaSizes = {
      sm: "px-1.5 py-1 text-sm",
      md: "px-2 py-1.5 text-base leading-relaxed",
      lg: "px-2.5 py-2 text-lg leading-relaxed",
    };

    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full bg-transparent border-none outline-none resize-none",
          "transition-all duration-150 ease-out",
          "appearance-none rounded-none",
          "hover:bg-slate-100/80 dark:hover:bg-slate-800/40",
          "focus:bg-slate-50/50 dark:focus:bg-slate-800/20",
          "focus:shadow-[inset_0_-2px_0_0_var(--primary)]",
          "placeholder:text-muted-foreground/40",
          textareaSizes[inputSize],
          className
        )}
        {...props}
      />
    );
  }
);

GhostTextarea.displayName = "GhostTextarea";
