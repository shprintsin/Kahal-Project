"use client";

/**
 * Menus Settings Page - Redesigned for Better UX
 * 
 * Interactive site customizer with inline editing (no dialogs).
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Save, Eye, Loader2 } from "lucide-react";
import { MenuSectionEditor } from "@/components/admin-menus/menu-section-editor";
import { FooterColumnEditor } from "@/components/admin-menus/footer-column-editor";
import { TranslatableInput } from "@/components/admin-menus/translatable-input";
import {
  getAllSiteSettings,
  upsertMenu,
  updateSiteSettings,
  createFooterColumn,
  deleteFooterColumn,
} from "@/app/admin/actions/menus";
import type { SiteSettings } from "@/app/admin/types/menus";

export default function MenusSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [initialSettings, setInitialSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllSiteSettings();
      setSettings(data);
      setInitialSettings(JSON.parse(JSON.stringify(data)));
    } catch (err) {
      console.error("Error loading settings:", err);
      setError("Failed to load settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = () => {
    if (!settings || !initialSettings) return false;
    return JSON.stringify(settings) !== JSON.stringify(initialSettings);
  };

  const handleChange = (key: keyof SiteSettings, value: any) => {
    if (!settings) return;
    setSettings((prev) => ({
      ...prev!,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      await Promise.all([
        upsertMenu("HEADER", settings.header.items),
        upsertMenu("HERO_GRID", settings.heroGrid.items),
        upsertMenu("HERO_ACTIONS", settings.heroActions.items),
        upsertMenu("HERO_STRIP", settings.heroStrip.items),
        updateSiteSettings(settings.copyrightText),
      ]);

      if (initialSettings) {
        for (const col of initialSettings.footerColumns) {
          if (col.id) {
            await deleteFooterColumn(col.id);
          }
        }
      }
      for (const col of settings.footerColumns) {
        await createFooterColumn(col);
      }

      await loadSettings();
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please check the console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    window.open("/", "_blank");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Loading menu settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={loadSettings} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-5xl">
      {/* Sticky Header with Save Button */}
      <div className="sticky top-0 z-20 bg-background pb-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Menu Settings</h1>
            <p className="text-muted-foreground mt-1">
              Customize your site's navigation and layout
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges() || isSaving}
              className={hasChanges() ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {hasChanges() ? "Save Changes" : "No Changes"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Header Navigation */}
      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">Header Navigation</h2>
          <p className="text-sm text-muted-foreground">
            Main navigation menu at the top of your site
          </p>
        </div>
        <MenuSectionEditor
          title="Navigation Menu"
          description="Add, edit, and reorder menu items. Supports dropdown menus."
          section={settings.header}
          onChange={(section) => handleChange("header", section)}
          allowNesting={true}
        />
      </section>

      <Separator />

      {/* Hero Section */}
      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">Hero Section</h2>
          <p className="text-sm text-muted-foreground">
            Customize the prominent area at the top of your homepage
          </p>
        </div>
        
        <div className="space-y-4">
          <MenuSectionEditor
            title="Feature Grid"
            description="Up to 4 feature cards displayed in a grid"
            section={settings.heroGrid}
            onChange={(section) => handleChange("heroGrid", section)}
            variantOptions={["CARD"]}
            allowNesting={false}
          />

          <MenuSectionEditor
            title="Call-to-Action Buttons"
            description="Primary action buttons in the hero section"
            section={settings.heroActions}
            onChange={(section) => handleChange("heroActions", section)}
            variantOptions={["BUTTON_SOLID", "BUTTON_OUTLINE"]}
            allowNesting={false}
          />

          <MenuSectionEditor
            title="Info Strip"
            description="Small information links at the bottom of the hero"
            section={settings.heroStrip}
            onChange={(section) => handleChange("heroStrip", section)}
            variantOptions={["DEFAULT"]}
            allowNesting={false}
          />
        </div>
      </section>

      <Separator />

      {/* Footer */}
      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">Footer</h2>
          <p className="text-sm text-muted-foreground">
            Customize footer columns and copyright text
          </p>
        </div>

        <div className="space-y-4">
          <FooterColumnEditor
            columns={settings.footerColumns}
            onChange={(columns) => handleChange("footerColumns", columns)}
          />

          <Card>
            <CardHeader>
              <CardTitle>Copyright Text</CardTitle>
              <CardDescription>
                Footer copyright. Use {"{year}"} for the current year.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TranslatableInput
                value={settings.copyrightText}
                onChange={(value) => handleChange("copyrightText", value)}
                placeholder="© {year} Your Company. All rights reserved."
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Bottom spacing */}
      <div className="h-8" />
    </div>
  );
}
