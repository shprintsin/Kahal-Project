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
      {icon && <span className="text-white/40">{icon}</span>}
      <span className="text-[10px] font-medium text-white/50 uppercase tracking-wide">
        {title}
      </span>
      {collapsible && (
        <span className="ml-auto text-white/40">{isOpen ? "−" : "+"}</span>
      )}
    </>
  );

  return (
    <div
      className={cn(
        "bg-[#1a1a1a] rounded-lg",
        "border border-white/5",
        "overflow-hidden",
        className
      )}
    >
      {collapsible ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border-b border-white/5 flex items-center gap-2 hover:bg-white/5 transition-colors"
        >
          {headerContent}
        </button>
      ) : (
        <div className="px-3 py-2 border-b border-white/5 flex items-center gap-2">
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
    <label className={cn("text-[10px] text-white/40 uppercase", className)}>
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
        "w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white",
        "focus:outline-none focus:border-white/20",
        className
      )}
      {...props}
    />
  )
);
AdminDarkInput.displayName = "AdminDarkInput";
