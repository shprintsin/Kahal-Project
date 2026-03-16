"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AdminSidebarCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function AdminSidebarCard({
  title,
  icon,
  children,
  className,
  collapsible = false,
  defaultOpen = true,
}: AdminSidebarCardProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const headerContent = (
    <>
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
        {title}
      </span>
      {collapsible && (
        <span className="ml-auto text-muted-foreground">{isOpen ? "−" : "+"}</span>
      )}
    </>
  );

  return (
    <div
      className={cn(
        "bg-card rounded-lg",
        "border border-border",
        "overflow-hidden",
        className
      )}
    >
      {collapsible ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border-b border-border flex items-center gap-2 hover:bg-muted transition-colors"
        >
          {headerContent}
        </button>
      ) : (
        <div className="px-3 py-2 border-b border-border flex items-center gap-2">
          {headerContent}
        </div>
      )}
      {(!collapsible || isOpen) && (
        <div className="p-3">{children}</div>
      )}
    </div>
  );
}

interface AdminFieldLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminFieldLabel({ children, className }: AdminFieldLabelProps) {
  return (
    <label className={cn("text-[10px] text-muted-foreground uppercase", className)}>
      {children}
    </label>
  );
}

interface AdminDarkInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const AdminDarkInput = React.forwardRef<HTMLInputElement, AdminDarkInputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full bg-muted border border-border rounded px-2 py-1.5 text-sm text-foreground",
        "focus:outline-none focus:border-border",
        className
      )}
      {...props}
    />
  )
);
AdminDarkInput.displayName = "AdminDarkInput";
