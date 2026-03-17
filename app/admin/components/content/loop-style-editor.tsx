"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Eye,
  Save,
  Send,
  Loader2,
  PanelRightOpen,
  PanelRightClose,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import { LanguageToggle } from "./language-toggle";
import type { ContentLanguage, LanguageConfig } from "@/app/admin/types/content-system.types";
import { AdminSidebarCard } from "@/app/admin/components/ui/admin-sidebar-card";

/**
 * LoopStyleEditor - MS Loop / Obsidian inspired editor layout
 * 
 * Layout:
 * - Left sidebar: File tree navigation (collapsible)
 * - Minimal top bar with back, language toggle, save/publish
 * - Unified canvas: Title → Slug → Description → Content (seamless flow)
 * - Right sidebar: Metadata cards (collapsible)
 */

interface LoopStyleEditorProps {
  // Navigation
  backHref?: string;
  backLabel?: string;
  onBack?: () => void;

  // Actions
  onSave?: () => void;
  onPublish?: () => void;
  saving?: boolean;
  publishing?: boolean;
  isDirty?: boolean;
  previewHref?: string;

  // i18n
  languages?: LanguageConfig[];
  currentLanguage?: ContentLanguage;
  onLanguageChange?: (lang: ContentLanguage) => void;
  showLanguageToggle?: boolean;

  // File Tree (left sidebar)
  fileTree?: React.ReactNode;
  fileTreeDefaultOpen?: boolean;

  // Metadata (right sidebar)
  sidebar?: React.ReactNode;
  sidebarDefaultOpen?: boolean;

  // Canvas
  // Canvas
  children: React.ReactNode;
  
  // Layout
  fullWidth?: boolean; // New prop for dashboard-like views

  className?: string;
}

export function LoopStyleEditor({
  backHref,
  backLabel = "Back",
  onBack,
  onSave,
  onPublish,
  saving = false,
  publishing = false,
  isDirty = false,
  previewHref,
  languages,
  currentLanguage = "en",
  onLanguageChange,
  showLanguageToggle = true,
  fileTree,
  fileTreeDefaultOpen = true,
  sidebar,
  sidebarDefaultOpen = true,
  children,
  fullWidth = false,
  className,
}: LoopStyleEditorProps) {
  const [fileTreeOpen, setFileTreeOpen] = React.useState(fileTreeDefaultOpen);
  const [sidebarOpen, setSidebarOpen] = React.useState(sidebarDefaultOpen);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backHref) {
      window.location.href = backHref;
    }
  };

  return (
    <div
      className={cn(
        "h-screen flex flex-col overflow-hidden",
        "bg-background text-foreground",
        className
      )}
    >
      {/* Top Bar - Minimal */}
      <header
        className={cn(
          "sticky top-0 z-40",
          "bg-background/95 backdrop-blur-sm",
          "border-b border-border/40",
          "px-3 py-2"
        )}
      >
        <div className="flex items-center gap-2">
          {/* Left: File tree toggle + Back */}
          <div className="flex items-center gap-1">
            {fileTree && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFileTreeOpen(!fileTreeOpen)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/10"
              >
                {fileTreeOpen ? (
                  <PanelLeftClose className="w-4 h-4" />
                ) : (
                  <PanelLeftOpen className="w-4 h-4" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Center: Language Toggle */}
          {showLanguageToggle && onLanguageChange && (
            <LanguageToggle
              languages={languages}
              value={currentLanguage}
              onChange={onLanguageChange}
              size="sm"
            />
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right: Actions + Sidebar toggle */}
          <div className="flex items-center gap-1">
            {onSave && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSave}
                disabled={saving || !isDirty}
                className="h-8 text-muted-foreground hover:text-foreground hover:bg-accent/10 gap-1.5"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Save</span>
              </Button>
            )}

            {previewHref && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-8 text-muted-foreground hover:text-foreground hover:bg-accent/10 gap-1.5"
              >
                <a href={previewHref} target="_blank" rel="noopener noreferrer">
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Preview</span>
                </a>
              </Button>
            )}

            {onPublish && (
              <Button
                size="sm"
                onClick={onPublish}
                disabled={publishing}
                className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
              >
                {publishing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Publish
              </Button>
            )}

            {/* Metadata sidebar toggle */}
            {sidebar && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/10"
              >
                {sidebarOpen ? (
                  <PanelRightClose className="w-4 h-4" />
                ) : (
                  <PanelRightOpen className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Tree Sidebar (Left) */}
        {fileTree && (
          <aside
            className={cn(
              "w-64 flex-shrink-0 border-r border-border/40",
              "transition-all duration-200",
              fileTreeOpen ? "translate-x-0" : "-translate-x-full w-0 overflow-hidden"
            )}
          >
            {fileTree}
          </aside>
        )}

        {/* Canvas Area */}
        <main
          className={cn(
            "flex-1 min-w-0 overflow-y-auto",
            "transition-all duration-300"
          )}
        >
          <div 
            className={cn(
              "mx-auto px-6 py-12",
              fullWidth ? "max-w-full" : "max-w-3xl"
            )}
          >
            {children}
          </div>
        </main>

        {/* Metadata Sidebar (Right) */}
        {sidebar && (
          <aside
            className={cn(
              "w-80 flex-shrink-0",
              "bg-card border-l border-border/40",
              "transition-all duration-200 overflow-y-auto",
              sidebarOpen ? "translate-x-0" : "translate-x-full w-0 overflow-hidden"
            )}
          >
            <div className="p-4 h-full">
              {sidebar}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export { AdminSidebarCard as SidebarCard } from "@/app/admin/components/ui/admin-sidebar-card";

interface SidebarFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function SidebarField({ label, children, className }: SidebarFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">
        {label}
      </div>
      <div className="text-sm text-foreground/90 font-medium">
        {children}
      </div>
    </div>
  );
}
