"use client";

import { Control, FieldPath, FieldValues } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { TranslatableInput } from "@/components/translatable-input";
import { RegionInput } from "@/components/region-input";
import { CategorySelector } from "@/components/category-selector";
import { TagInput } from "@/components/tag-input";
import { FeaturedImage } from "@/app/admin/components/editors/featured-image";

export type FieldType = 
  | "text" 
  | "textarea" 
  | "select" 
  | "checkbox" 
  | "switch"
  | "number" 
  | "email" 
  | "url" 
  | "date"
  | "translatable"
  | "translatable-textarea"
  | "region"
  | "markdown"           // MDEditor for markdown content
  | "category"           // CategorySelector component
  | "tags"               // TagInput component
  | "featured-image";    // FeaturedImage component

export interface FieldConfig<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  label: string;
  type: FieldType;
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  rows?: number;
  
  // For region input
  regions?: any[];
  onCreateRegion?: (slug: string) => Promise<any>;
  
  // For markdown editor
  height?: number;
  markdownPlaceholder?: string;
  
  // For category selector
  categories?: any[];
  language?: any;
  onCreateCategory?: (name: string, language: any) => Promise<any>;
  
  // For tags input
  tags?: any[];
  selectedTagIds?: string[];
  onTagsChange?: (tagIds: string[]) => void;
  onCreateTag?: (slug: string) => Promise<any>;
  
  // For featured image
  mediaList?: any[];
  onUpload?: (file: File) => Promise<any>;
  uploading?: boolean;
}

interface FormFieldRendererProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  config: FieldConfig<TFieldValues>;
}

export function FormFieldRenderer<TFieldValues extends FieldValues = FieldValues>({
  control,
  config,
}: FormFieldRendererProps<TFieldValues>) {

  
  const { 
    name, label, type, placeholder, description, required, options, rows,
    // Region props
    regions, onCreateRegion,
    // Markdown props
    height, markdownPlaceholder,
    // Category props
    categories, language, onCreateCategory,
    // Tags props
    tags, selectedTagIds, onTagsChange, onCreateTag,
    // Featured image props
    mediaList, onUpload, uploading
  } = config;

  // Auto-determine if field should span full width
  const isFullWidth = type === "translatable" || type === "translatable-textarea" || type === "region" || type === "textarea" || type === "markdown";
  const className = isFullWidth ? "col-span-2" : "";

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            {type === "text" || type === "email" || type === "url" ? (
              <Input
                {...field}
                type={type}
                placeholder={placeholder}
                value={field.value || ""}
              />
            ) : type === "number" ? (
              <Input
                {...field}
                type="number"
                placeholder={placeholder}
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
              />
            ) : type === "date" ? (
              <Input
                {...field}
                type="date"
                value={field.value || ""}
              />
            ) : type === "textarea" ? (
              <Textarea
                {...field}
                placeholder={placeholder}
                rows={rows || 4}
                value={field.value || ""}
              />
            ) : type === "translatable" ? (
              <TranslatableInput
                value={field.value}
                onChange={field.onChange}
                placeholder={placeholder}
              />
            ) : type === "translatable-textarea" ? (
              <TranslatableInput
                value={field.value}
                onChange={field.onChange}
                variant="textarea"
                placeholder={placeholder}
              />
            ) : type === "region" ? (
              <RegionInput
                regions={regions || []}
                selectedRegionIds={field.value || []}
                onRegionsChange={field.onChange}
                onCreateRegion={onCreateRegion || (async () => ({}))}
              />
            ) : type === "select" ? (
              (() => {
                // Provide a sentinel to allow "no selection" without using empty string value
                const noneValue = "__none__";
                const selectValue = (field.value ?? noneValue) as string;
                return (
                  <Select
                    value={selectValue}
                    onValueChange={(val) => field.onChange(val === noneValue ? undefined : val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={noneValue}>{placeholder || "None"}</SelectItem>
                      {options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              })()
            ) : type === "checkbox" ? (
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                />
                <span className="text-sm">{description}</span>
              </div>
            ) : type === "switch" ? (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{label}</span>
                <Switch
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                />
              </div>
            ) : type === "markdown" ? (
              <Textarea
                {...field}
                placeholder={markdownPlaceholder || placeholder}
                rows={rows || 20}
                value={field.value || ""}
                className="font-mono"
              />
            ) : type === "category" ? (
              <CategorySelector
                categories={categories || []}
                selectedCategoryId={field.value}
                language={language}
                onCategoryChange={field.onChange}
                onCreateCategory={onCreateCategory || (async () => ({}))}
              />
            ) : type === "tags" ? (
              <TagInput
                tags={tags || []}
                selectedTagIds={field.value || []}
                onTagsChange={field.onChange}
                onCreateTag={onCreateTag || (async () => ({}))}
              />
            ) : type === "featured-image" ? (
              <FeaturedImage
                mediaId={field.value}
                mediaList={mediaList || []}
                onSelect={field.onChange}
                onUpload={onUpload || (async () => ({}))}
                uploading={uploading || false}
              />
            ) : null}
          </FormControl>
          {description && type !== "checkbox" && (
            <FormDescription>{description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface FormSectionProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  fields: FieldConfig<TFieldValues>[];
  columns?: 1 | 2;
}

export function FormSection<TFieldValues extends FieldValues = FieldValues>({
  control,
  fields,
  columns = 1,
}: FormSectionProps<TFieldValues>) {
  const gridClass = columns === 2 ? "grid grid-cols-2 gap-4" : "space-y-4";

  return (
    <div className={gridClass}>
      {fields.map((fieldConfig) => (
        <FormFieldRenderer
          key={fieldConfig.name as string}
          control={control}
          config={fieldConfig}
        />
      ))}
    </div>
  );
}
