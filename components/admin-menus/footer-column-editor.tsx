/**
 * Footer Column Editor
 * 
 * Manages footer columns with support for both LINK_LIST and RICH_TEXT types.
 * Includes drag-and-drop reordering.
 */

import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, MoreVertical, Edit, Trash, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { TranslatableInput } from "./translatable-input";
import { MenuItemEditor } from "./menu-item-editor";
import type { FooterColumn, FooterColumnItem, MenuType } from "@/app/admin/types/menus";

interface FooterColumnEditorProps {
  columns: FooterColumn[];
  onChange: (columns: FooterColumn[]) => void;
}

export function FooterColumnEditor({ columns, onChange }: FooterColumnEditorProps) {
  const [editingColumn, setEditingColumn] = useState<FooterColumn | undefined>();
  const [columnEditorOpen, setColumnEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    columnId: string;
    item?: FooterColumnItem;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = columns.findIndex((col) => col.id === active.id);
      const newIndex = columns.findIndex((col) => col.id === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newColumns = arrayMove(columns, oldIndex, newIndex).map(
          (col, index) => ({ ...col, order: index })
        );
        onChange(newColumns);
      }
    }
  };

  const handleAddColumn = () => {
    setEditingColumn(undefined);
    setColumnEditorOpen(true);
  };

  const handleEditColumn = (column: FooterColumn) => {
    setEditingColumn(column);
    setColumnEditorOpen(true);
  };

  const handleSaveColumn = (column: FooterColumn) => {
    if (editingColumn && editingColumn.id) {
      onChange(columns.map((c) => (c.id === editingColumn.id ? column : c)));
    } else {
      onChange([...columns, { ...column, id: crypto.randomUUID(), order: columns.length }]);
    }
    setColumnEditorOpen(false);
  };

  const handleDeleteColumn = (columnId: string) => {
    onChange(columns.filter((c) => c.id !== columnId));
  };

  const handleAddItem = (columnId: string) => {
    setEditingItem({ columnId, item: undefined });
  };

  const handleEditItem = (columnId: string, item: FooterColumnItem) => {
    setEditingItem({ columnId, item });
  };

  const handleSaveItem = (item: FooterColumnItem) => {
    if (!editingItem) return;

    onChange(
      columns.map((col) => {
        if (col.id === editingItem.columnId && col.type === "LINK_LIST") {
          const items = col.items || [];
          if (editingItem.item && editingItem.item.id) {
            return {
              ...col,
              items: items.map((i) => (i.id === editingItem.item?.id ? item : i)),
            };
          } else {
            return {
              ...col,
              items: [...items, { ...item, id: crypto.randomUUID() }],
            };
          }
        }
        return col;
      })
    );
    setEditingItem(null);
  };

  const handleDeleteItem = (columnId: string, itemId: string) => {
    onChange(
      columns.map((col) => {
        if (col.id === columnId && col.type === "LINK_LIST") {
          return {
            ...col,
            items: col.items.filter((i) => i.id !== itemId),
          };
        }
        return col;
      })
    );
  };

  const columnIds = columns.map((col) => col.id || "");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Footer Columns</CardTitle>
        <CardDescription>
          Manage footer columns with links or rich text content. Drag to reorder.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {columns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <p className="mb-4">No footer columns yet</p>
            <Button type="button" onClick={handleAddColumn}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Column
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {columns.map((column) => (
                  <SortableFooterColumn
                    key={column.id}
                    column={column}
                    onEdit={handleEditColumn}
                    onDelete={handleDeleteColumn}
                    onAddItem={handleAddItem}
                    onEditItem={handleEditItem}
                    onDeleteItem={handleDeleteItem}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {columns.length > 0 && (
          <Button type="button" variant="outline" onClick={handleAddColumn} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </Button>
        )}

        <FooterColumnEditorDialog
          open={columnEditorOpen}
          onOpenChange={setColumnEditorOpen}
          column={editingColumn}
          onSave={handleSaveColumn}
        />

        {editingItem && (
          <FooterItemEditorDialog
            open={!!editingItem}
            onOpenChange={(open) => !open && setEditingItem(null)}
            item={editingItem.item}
            onSave={handleSaveItem}
          />
        )}
      </CardContent>
    </Card>
  );
}

interface SortableFooterColumnProps {
  column: FooterColumn;
  onEdit: (column: FooterColumn) => void;
  onDelete: (columnId: string) => void;
  onAddItem: (columnId: string) => void;
  onEditItem: (columnId: string, item: FooterColumnItem) => void;
  onDeleteItem: (columnId: string, itemId: string) => void;
}

function SortableFooterColumn({
  column,
  onEdit,
  onDelete,
  onAddItem,
  onEditItem,
  onDeleteItem,
}: SortableFooterColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id || "" });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={cn("relative", isDragging && "opacity-50 shadow-lg")}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <div>
                <CardTitle className="text-sm">{column.title.default}</CardTitle>
                <Badge variant="secondary" className="text-xs mt-1">
                  {column.type === "LINK_LIST" ? "Links" : "Text"}
                </Badge>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(column)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => column.id && onDelete(column.id)}
                  className="text-destructive"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {column.type === "LINK_LIST" ? (
            <div className="space-y-2">
              {column.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded border text-sm hover:bg-accent/50 cursor-pointer group"
                  onClick={() => column.id && onEditItem(column.id, item)}
                >
                  <span className="truncate">{item.label.default}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      column.id && item.id && onDeleteItem(column.id, item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <input
                type="text"
                placeholder="Press Enter to add link..."
                className="w-full h-9 px-3 text-sm border border-dashed rounded bg-transparent hover:border-primary hover:bg-accent/30 focus:border-primary focus:bg-card focus:outline-none transition-colors"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value.trim() && column.id) {
                    const label = e.currentTarget.value.trim();
                    onAddItem(column.id);
                    e.currentTarget.value = "";
                  }
                }}
              />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground line-clamp-3">
              {column.content.default || "No content"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface FooterColumnEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column?: FooterColumn;
  onSave: (column: FooterColumn) => void;
}

function FooterColumnEditorDialog({
  open,
  onOpenChange,
  column,
  onSave,
}: FooterColumnEditorDialogProps) {
  const [formData, setFormData] = useState<FooterColumn>({
    type: "LINK_LIST",
    order: 0,
    title: { default: "", translations: {} },
    items: [],
  });

  React.useEffect(() => {
    if (column) {
      setFormData(column);
    } else {
      setFormData({
        type: "LINK_LIST",
        order: 0,
        title: { default: "", translations: {} },
        items: [],
      });
    }
  }, [column, open]);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{column ? "Edit Footer Column" : "Add Footer Column"}</DialogTitle>
          <DialogDescription>
            Configure the column type, title, and content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <TranslatableInput
            label="Column Title"
            value={formData.title}
            onChange={(title) => setFormData({ ...formData, title })}
            placeholder="e.g., Resources, Connect, About"
          />

          <div className="space-y-2">
            <Label>Column Type</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(type) =>
                setFormData({
                  ...formData,
                  type: type as MenuType,
                } as FooterColumn)
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="LINK_LIST" id="link-list" />
                <Label htmlFor="link-list" className="font-normal cursor-pointer">
                  Link List
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="RICH_TEXT" id="rich-text" />
                <Label htmlFor="rich-text" className="font-normal cursor-pointer">
                  Rich Text
                </Label>
              </div>
            </RadioGroup>
          </div>

          {formData.type === "RICH_TEXT" && (
            <TranslatableInput
              label="Content"
              value={(formData as any).content || { default: "", translations: {} }}
              onChange={(content) =>
                setFormData({ ...formData, content } as FooterColumn)
              }
              placeholder="Enter text content"
              multiline
            />
          )}

          <div className="space-y-2">
            <Label>Order</Label>
            <input
              type="number"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.order}
              onChange={(e) =>
                setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface FooterItemEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: FooterColumnItem;
  onSave: (item: FooterColumnItem) => void;
}

function FooterItemEditorDialog({
  open,
  onOpenChange,
  item,
  onSave,
}: FooterItemEditorDialogProps) {
  const [menuItem, setMenuItem] = useState<any>(null);

  React.useEffect(() => {
    if (item) {
      setMenuItem({
        ...item,
        variant: "DEFAULT",
      });
    }
  }, [item, open]);

  const handleSave = (savedMenuItem: any) => {
    const footerItem: FooterColumnItem = {
      id: item?.id,
      footerColumnId: item?.footerColumnId,
      label: savedMenuItem.label,
      icon: savedMenuItem.icon,
      order: savedMenuItem.order,
      pageId: savedMenuItem.pageId,
      url: savedMenuItem.url,
    };
    onSave(footerItem);
  };

  return (
    <MenuItemEditor
      open={open}
      onOpenChange={onOpenChange}
      item={menuItem}
      onSave={handleSave}
      variantOptions={["DEFAULT"]}
    />
  );
}
