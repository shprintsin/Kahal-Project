/**
 * Menu Item Editor Dialog
 * 
 * Modal form for creating/editing menu items.
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TranslatableInput } from "./translatable-input";
import { IconPicker } from "./icon-picker";
import type { MenuItem, ItemVariant } from "@/app/admin/types/menus";

interface MenuItemEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: MenuItem;
  onSave: (item: MenuItem) => void;
  parentId?: string;
  variantOptions?: ItemVariant[];
}

const DEFAULT_VARIANT_OPTIONS: ItemVariant[] = ["DEFAULT", "BUTTON_SOLID", "BUTTON_OUTLINE", "CARD"];

export function MenuItemEditor({
  open,
  onOpenChange,
  item,
  onSave,
  parentId,
  variantOptions = DEFAULT_VARIANT_OPTIONS,
}: MenuItemEditorProps) {
  const [formData, setFormData] = useState<MenuItem>({
    label: { default: "", translations: {} },
    icon: undefined,
    variant: "DEFAULT",
    order: 0,
    url: undefined,
    pageId: undefined,
  });

  const [linkType, setLinkType] = useState<"url" | "page">("url");

  useEffect(() => {
    if (item) {
      setFormData(item);
      setLinkType(item.pageId ? "page" : "url");
    } else {
      setFormData({
        label: { default: "", translations: {} },
        icon: undefined,
        variant: "DEFAULT",
        order: 0,
        url: undefined,
        pageId: undefined,
        parentId,
      });
      setLinkType("url");
    }
  }, [item, open, parentId]);

  const handleSave = () => {
    const dataToSave = {
      ...formData,
      pageId: linkType === "page" ? formData.pageId : undefined,
      url: linkType === "url" ? formData.url : undefined,
    };
    onSave(dataToSave);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
          <DialogDescription>
            Configure the menu item label, icon, and destination.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Label */}
          <TranslatableInput
            label="Label"
            value={formData.label}
            onChange={(label) => setFormData({ ...formData, label })}
            placeholder="Enter menu item label"
          />

          {/* Icon */}
          <div className="space-y-2">
            <Label>Icon (Optional)</Label>
            <IconPicker
              value={formData.icon}
              onChange={(icon) => setFormData({ ...formData, icon })}
              triggerClassName="w-full justify-start"
            />
          </div>

          {/* Variant */}
          <div className="space-y-2">
            <Label>Variant</Label>
            <Select
              value={formData.variant}
              onValueChange={(variant) => setFormData({ ...formData, variant: variant as ItemVariant })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {variantOptions.map((variant) => (
                  <SelectItem key={variant} value={variant}>
                    {variant.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Link Type */}
          <div className="space-y-2">
            <Label>Link Type</Label>
            <RadioGroup value={linkType} onValueChange={(value) => setLinkType(value as "url" | "page")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="url" id="url" />
                <Label htmlFor="url" className="font-normal cursor-pointer">
                  External/Direct URL
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="page" id="page" />
                <Label htmlFor="page" className="font-normal cursor-pointer">
                  Internal Page (by ID)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* URL or Page ID */}
          {linkType === "url" ? (
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                value={formData.url || ""}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="/path or https://example.com"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Page ID</Label>
              <Input
                value={formData.pageId || ""}
                onChange={(e) => setFormData({ ...formData, pageId: e.target.value })}
                placeholder="Enter page UUID"
              />
              <p className="text-xs text-muted-foreground">
                You can implement a page selector here in the future.
              </p>
            </div>
          )}

          {/* Order */}
          <div className="space-y-2">
            <Label>Order</Label>
            <Input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            {item ? "Save Changes" : "Add Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
