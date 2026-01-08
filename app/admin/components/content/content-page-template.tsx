"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * ContentPageTemplate - Reusable page wrapper with header structure
 * Provides consistent layout for content management pages
 */

interface ContentPageTemplateProps {
  title?: string;
  subtitle?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl" | "full";
}

const maxWidthStyles = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  "4xl": "max-w-[1536px]",
  "6xl": "max-w-[1920px]",
  full: "max-w-full",
} as const;

export function ContentPageTemplate({
  children,
  className,
  maxWidth = "6xl",
}: ContentPageTemplateProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto px-4 sm:px-6 lg:px-8 py-6",
        maxWidthStyles[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * ContentPageSection - Section wrapper with optional title
 */
interface ContentPageSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function ContentPageSection({
  title,
  description,
  children,
  className,
}: ContentPageSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || description) && (
        <div>
          {title && (
            <h2 className="text-lg font-semibold">{title}</h2>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
