"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Send, Loader2, MoreHorizontal } from "lucide-react";
import { LanguageToggle } from "./language-toggle";
import type { ContentLanguage, LanguageConfig } from "@/app/admin/types/content-system.types";

/**
 * ContentEditorLayout - Main editor layout with Smart Ribbon structure
 * 
 * Zones:
 * - Zone A: Top Bar (sticky) - Navigation, Actions, i18n Switch
 * - Zone B: Header & Smart Ribbon - Title + metadata grid
 * - Zone C: Meta Deck - Collapsible excerpt/description
 * - Zone D: Infinite Canvas - Body content
 */

interface ContentEditorLayoutProps {
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

  // i18n
  languages?: LanguageConfig[];
  currentLanguage?: ContentLanguage;
  onLanguageChange?: (lang: ContentLanguage) => void;
  showLanguageToggle?: boolean;

  // Additional actions slot
  additionalActions?: React.ReactNode;

  // Zone content
  children: React.ReactNode;

  className?: string;
}

export function ContentEditorLayout({
  backHref,
  backLabel = "Back",
  onBack,
  onSave,
  onPublish,
  saving = false,
  publishing = false,
  isDirty = false,
  languages,
  currentLanguage = "en",
  onLanguageChange,
  showLanguageToggle = true,
  additionalActions,
  children,
  className,
}: ContentEditorLayoutProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backHref) {
      window.location.href = backHref;
    }
  };

  return (
    <div className={cn("min-h-screen flex flex-col bg-background", className)}>
      {/* Zone A: Top Bar (Sticky) */}
      <header
        className={cn(
          "sticky top-0 z-40",
          "bg-background/95 backdrop-blur-sm",
          "shadow-[0_1px_0_0_var(--border)]",
          "px-4 sm:px-6 py-2.5"
        )}
      >
        <div className="max-w-[1200px] mx-auto flex items-center gap-4">
          {/* Left: Navigation */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{backLabel}</span>
          </Button>

          {/* Center: Language Toggle */}
          {showLanguageToggle && onLanguageChange && (
            <div className="flex-1 flex justify-center">
              <LanguageToggle
                languages={languages}
                value={currentLanguage}
                onChange={onLanguageChange}
                size="sm"
              />
            </div>
          )}

          {/* Spacer when no language toggle */}
          {!showLanguageToggle && <div className="flex-1" />}

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Dirty indicator */}
            {isDirty && (
              <span className="text-xs text-muted-foreground/60 hidden sm:block">
                Unsaved
              </span>
            )}

            {additionalActions}

            {onSave && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSave}
                disabled={saving || !isDirty}
                className="gap-1.5"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Save</span>
              </Button>
            )}

            {onPublish && (
              <Button
                size="sm"
                onClick={onPublish}
                disabled={publishing}
                className="gap-1.5"
              >
                {publishing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Publish
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

/**
 * EditorZoneB - Header & Smart Ribbon zone
 */
interface EditorZoneBProps {
  children: React.ReactNode;
  className?: string;
}

export function EditorZoneB({ children, className }: EditorZoneBProps) {
  return (
    <div className={cn("space-y-4 mb-6", className)}>
      {children}
    </div>
  );
}

/**
 * EditorTitle - Massive H1 ghost input for title
 */
interface EditorTitleProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function EditorTitle({
  value,
  onChange,
  placeholder = "Untitled",
  className,
}: EditorTitleProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full text-4xl sm:text-5xl font-bold tracking-tight",
        "bg-transparent border-none outline-none",
        "placeholder:text-muted-foreground/50",
        "focus:ring-0",
        "py-2",
        className
      )}
    />
  );
}

/**
 * EditorZoneC - Meta Deck zone
 */
interface EditorZoneCProps {
  children: React.ReactNode;
  className?: string;
}

export function EditorZoneC({ children, className }: EditorZoneCProps) {
  return (
    <div className={cn("mb-8", className)}>
      {children}
    </div>
  );
}

/**
 * EditorZoneD - Content Canvas zone
 */
interface EditorZoneDProps {
  children: React.ReactNode;
  className?: string;
}

export function EditorZoneD({ children, className }: EditorZoneDProps) {
  return (
    <div className={cn("min-h-[50vh] -mx-4 sm:-mx-6", className)}>
      {children}
    </div>
  );
}
