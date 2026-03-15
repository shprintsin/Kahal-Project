import * as React from "react";
import { cn } from "@/lib/utils";

const maxWidthMap = {
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  "4xl": "max-w-[1536px]",
  "6xl": "max-w-[1920px]",
  full: "max-w-full",
} as const;

interface AdminShellProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  maxWidth?: keyof typeof maxWidthMap;
  children: React.ReactNode;
  className?: string;
}

export function AdminShell({
  title,
  subtitle,
  actions,
  maxWidth = "6xl",
  children,
  className,
}: AdminShellProps) {
  return (
    <div
      className={cn(
        "flex-1 w-full mx-auto px-6 lg:px-8 py-6",
        maxWidthMap[maxWidth],
        className
      )}
    >
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            {title && (
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            )}
            {subtitle && (
              <p className="text-muted-foreground text-sm mt-0.5">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
