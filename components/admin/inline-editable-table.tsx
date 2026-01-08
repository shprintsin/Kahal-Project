"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface ColumnConfig {
  key: string;
  label: string;
  width?: string;
  placeholder?: string;
  dir?: "rtl" | "ltr";
  align?: "right" | "left" | "center";
  type?: string;
}

interface InlineEditableTableProps {
  items: any[];
  columns: ColumnConfig[];
  onSave: (id: string, data: any) => Promise<any>;
  onCreate: (data: any) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
  newItemLabel?: string;
}

export function InlineEditableTable({
  items: initialItems,
  columns,
  onSave,
  onCreate,
  onDelete,
  newItemLabel = "Add new item...",
}: InlineEditableTableProps) {
  const [items, setItems] = useState(initialItems);
  const [newItem, setNewItem] = useState<Record<string, any>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Ref for the first input of the new item row
  const newItemInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  // Hotkey listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Alt + N to focus the new item input
      if (e.altKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        newItemInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleNewItemChange = (key: string, value: string) => {
    setNewItem((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = async () => {
    // Check if at least one field is filled
    if (Object.keys(newItem).length === 0) return;

    setIsCreating(true);
    try {
      const created = await onCreate(newItem);
      setItems((prev) => [...prev, created]);
      setNewItem({});
      toast.success("Created successfully");
    } catch (error) {
      toast.error("Failed to create item");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditChange = (key: string, value: string) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
  };

  const startEditing = (item: any) => {
    setEditingId(item.id);
    setEditValues(item);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleSaveItem = async (id: string) => {
    setSavingId(id);
    try {
      const updated = await onSave(id, editValues);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setEditingId(null);
      setEditValues({});
      toast.success("Saved successfully");
    } catch (error) {
      toast.error("Failed to save item");
      console.error(error);
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    
    setDeletingId(id);
    try {
      await onDelete(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Deleted successfully");
    } catch (error) {
      toast.error("Failed to delete item");
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      action();
    }
  };

  const renderCellValue = (value: any) => {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    return value;
  };

  return (
    <div className="w-full p-1">
      <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={col.width} style={{ textAlign: col.align }}>
                {col.label}
              </TableHead>
            ))}
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const isEditing = editingId === item.id;
            const isSaving = savingId === item.id;
            const isDeleting = deletingId === item.id;

            return (
              <TableRow key={item.id}>
                {columns.map((col) => (
                  <TableCell key={col.key} dir={col.dir}>
                    {isEditing ? (
                      <Input
                        type={col.type || "text"}
                        value={editValues[col.key] || ""}
                        onChange={(e) => handleEditChange(col.key, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, () => handleSaveItem(item.id))}
                        className="h-8"
                        autoFocus={col.key === columns[0].key} // Focus first column
                        dir={col.dir}
                      />
                    ) : (
                      <div 
                        className="min-h-[20px] py-1 cursor-pointer hover:bg-muted/50 rounded px-2"
                        onClick={() => startEditing(item)}
                      >
                         {renderCellValue(item[col.key]) ?? <span className="text-muted-foreground opacity-50 italic">Empty</span>}
                      </div>
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    {isEditing ? (
                       <Button 
                         size="sm" 
                         variant="default" 
                         onClick={() => handleSaveItem(item.id)}
                         disabled={isSaving}
                       >
                         {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                       </Button>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(item.id)}
                        disabled={isDeleting}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                         {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}

          {/* New Item Row */}
          <TableRow className="bg-muted/30">
            {columns.map((col, index) => (
              <TableCell key={col.key} dir={col.dir}>
                <Input
                  ref={index === 0 ? newItemInputRef : undefined}
                  type={col.type || "text"}
                  value={newItem[col.key] || ""}
                  onChange={(e) => handleNewItemChange(col.key, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleCreate)}
                  placeholder={col.placeholder || col.label}
                  className="h-8 bg-background"
                  dir={col.dir}
                />
              </TableCell>
            ))}
            <TableCell>
               <Button 
                 size="sm" 
                 variant="secondary"
                 onClick={handleCreate}
                 disabled={isCreating || Object.keys(newItem).length === 0}
               >
                 {isCreating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-4 h-4" />}
               </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
