import React from "react";

interface AdminPageBlockProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function AdminPageBlock({ title, description, action, children }: AdminPageBlockProps & { action?: React.ReactNode }) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
