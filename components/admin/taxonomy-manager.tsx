"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InlineEditableTable, ColumnConfig } from "@/components/admin/inline-editable-table";
import { ContentTypeDefinition, FieldDefinition } from "@/app/admin/system";
import { toast } from "sonner";

interface TaxonomyManagerProps {
  taxonomies: {
    key: string;
    def: ContentTypeDefinition;
    initialData: any[];
    actions: {
      create: (data: any) => Promise<any>;
      update: (id: string, data: any) => Promise<any>;
      delete: (id: string) => Promise<void>;
    };
  }[];
}

export function TaxonomyManager({ taxonomies }: TaxonomyManagerProps) {
  const [activeTab, setActiveTab] = useState(taxonomies[0]?.key);

  // Hotkeys for tab navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Right Arrow -> Next Tab
      if (e.ctrlKey && e.key === "ArrowRight") {
        const index = taxonomies.findIndex(t => t.key === activeTab);
        if (index < taxonomies.length - 1) {
          setActiveTab(taxonomies[index + 1].key);
        }
      }
      // Ctrl + Left Arrow -> Prev Tab
      if (e.ctrlKey && e.key === "ArrowLeft") {
        const index = taxonomies.findIndex(t => t.key === activeTab);
        if (index > 0) {
          setActiveTab(taxonomies[index - 1].key);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, taxonomies]);

  return (
    <div className="p-6">
       <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Taxonomies</h1>
          <p className="text-muted-foreground">Manage all your taxonomy terms in one place.</p>
        </div>
        <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded">
            Hotkeys: <span className="font-mono text-foreground">Alt+N</span> New Item | <span className="font-mono text-foreground">Ctrl+Arrows</span> Switch Tabs
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 w-full justify-start overflow-x-auto">
          {taxonomies.map(t => (
            <TabsTrigger key={t.key} value={t.key} className="min-w-[100px]">
                {/* Render Icon if available (assuming icon is string name or component) */}
                {t.def.plural}
            </TabsTrigger>
          ))}
        </TabsList>
        {taxonomies.map(t => (
          <TabsContent key={t.key} value={t.key} className="mt-0">
             <div className="mt-4">
                 <h2 className="text-lg font-semibold mb-4">{t.def.plural}</h2>
                 <InlineEditableTable
                   items={t.initialData}
                   columns={mapFieldsToColumns(t.def.fields)}
                   onCreate={async (data) => {
                       const coerced = coerceData(data, t.def.fields);
                       return t.actions.create(coerced);
                   }}
                   onSave={async (id, data) => {
                       const coerced = coerceData(data, t.def.fields);
                       return t.actions.update(id, coerced);
                   }}
                   onDelete={t.actions.delete}
                 />
             </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function coerceData(data: any, fields: any[]) {
    const result = { ...data };
    fields.forEach(f => {
        if (f.type === 'number' && result[f.key] !== undefined && result[f.key] !== "") {
            result[f.key] = Number(result[f.key]);
        }
    });
    return result;
}

function mapFieldsToColumns(fields: any[]): ColumnConfig[] {
  return fields
    .filter(f => f.showInList)
    .sort((a, b) => (a.order || 99) - (b.order || 99))
    .map(f => ({
      key: f.key,
      label: f.label,
      width: f.width,
      align: f.type === 'number' ? 'right' : 'left',
      placeholder: f.placeholder,
      type: f.type === 'number' ? 'number' : 'text',
    }));
}
