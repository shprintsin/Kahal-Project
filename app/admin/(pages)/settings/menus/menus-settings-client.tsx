"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, Loader2, Save } from "lucide-react";
import { MenuSectionEditor } from "@/components/admin-menus/menu-section-editor";
import { FooterColumnEditor } from "@/components/admin-menus/footer-column-editor";
import { TranslatableInput } from "@/components/admin-menus/translatable-input";
import {
  createFooterColumn,
  deleteFooterColumn,
  updateSiteSettings,
  upsertMenu,
} from "@/app/admin/actions/menus";
import type { SiteSettings } from "@/app/admin/types/menus";

interface MenusSettingsClientProps {
  initialSettings: SiteSettings;
}

export function MenusSettingsClient({ initialSettings }: MenusSettingsClientProps) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [savedSnapshot, setSavedSnapshot] = useState<string>(JSON.stringify(initialSettings));
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = JSON.stringify(settings) !== savedSnapshot;

  const handleChange = (key: keyof SiteSettings, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        upsertMenu("HEADER", settings.header.items),
        upsertMenu("HERO_GRID", settings.heroGrid.items),
        upsertMenu("HERO_ACTIONS", settings.heroActions.items),
        upsertMenu("HERO_STRIP", settings.heroStrip.items),
        updateSiteSettings(settings.copyrightText),
      ]);

      const initial = JSON.parse(savedSnapshot) as SiteSettings;
      for (const col of initial.footerColumns) {
        if (col.id) {
          await deleteFooterColumn(col.id);
        }
      }
      for (const col of settings.footerColumns) {
        await createFooterColumn(col);
      }

      setSavedSnapshot(JSON.stringify(settings));
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

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-5xl">
      <div className="sticky top-0 z-20 bg-background pb-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Menu Settings</h1>
            <p className="text-muted-foreground mt-1">
              Customize your site&apos;s navigation and layout
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={hasChanges ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {hasChanges ? "Save Changes" : "No Changes"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

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

      <div className="h-8" />
    </div>
  );
}
