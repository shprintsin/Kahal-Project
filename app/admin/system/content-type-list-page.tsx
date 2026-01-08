"use client";

/**
 * ContentTypeListPage
 * 
 * A ready-to-use list page component for any content type.
 * Renders a full-featured list with search, filters, bulk actions, and fast-edit.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ContentTypeDefinition } from "./content-type-registry";
import { DynamicTable } from "./dynamic-table";
import { TablePagination } from "@/app/admin/components/content/table-pagination";
import { BulkActionsBar } from "@/app/admin/components/content/bulk-actions-bar";
import type { ListResult, GenericActions } from "./create-generic-actions";

interface ContentTypeListPageProps<T extends { id: string }> {
  contentType: ContentTypeDefinition;
  initialData: ListResult<T>;
  actions: GenericActions<T>;
}

export function ContentTypeListPage<T extends { id: string }>({
  contentType,
  initialData,
  actions,
}: ContentTypeListPageProps<T>) {
  const router = useRouter();
  
  // State
  const [data, setData] = React.useState(initialData.items);
  const [pagination, setPagination] = React.useState(initialData.pagination);
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const [fastEditEnabled, setFastEditEnabled] = React.useState(true);
  
  // Reload data
  const loadData = async (page = 1, search = searchQuery) => {
    setLoading(true);
    try {
      const result = await actions.list({ page, search, limit: pagination.limit });
      setData(result.items);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error(`Failed to load ${contentType.plural.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search
  const handleSearch = React.useCallback(() => {
    loadData(1, searchQuery);
  }, [searchQuery]);
  
  // Handle cell change
  const handleCellChange = async (rowId: string, field: string, value: any) => {
    try {
      await actions.update(rowId, { [field]: value });
      setData(prev => prev.map(row => 
        row.id === rowId ? { ...row, [field]: value } : row
      ));
      toast.success("Updated");
    } catch (error) {
      toast.error("Failed to update");
    }
  };
  
  // Handle delete
  const handleDelete = async (rowId: string) => {
    if (!confirm(`Delete this ${contentType.name.toLowerCase()}?`)) return;
    
    try {
      await actions.delete(rowId);
      setData(prev => prev.filter(row => row.id !== rowId));
      toast.success(`${contentType.name} deleted`);
    } catch (error) {
      toast.error("Failed to delete");
    }
  };
  
  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedRows.length} ${contentType.plural.toLowerCase()}?`)) return;
    
    try {
      await Promise.all(selectedRows.map(id => actions.delete(id)));
      setData(prev => prev.filter(row => !selectedRows.includes(row.id)));
      setSelectedRows([]);
      toast.success(`Deleted ${selectedRows.length} items`);
    } catch (error) {
      toast.error("Failed to delete some items");
    }
  };
  
  // Handle row click navigation
  const handleRowClick = (row: T) => {
    if (!fastEditEnabled) {
      router.push(`/admin/${contentType.slug}/${row.id}`);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b">
        <div>
          <h1 className="text-2xl font-semibold">{contentType.plural}</h1>
          <p className="text-sm text-muted-foreground">
            {pagination.total} {pagination.total === 1 ? contentType.name.toLowerCase() : contentType.plural.toLowerCase()}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${contentType.plural.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9 w-64"
            />
          </div>
          
          {/* Create new */}
          <Button onClick={() => router.push(`/admin/${contentType.slug}/new`)}>
            <Plus className="w-4 h-4 mr-2" />
            New {contentType.name}
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="p-6">
            <DynamicTable
              contentType={contentType}
              data={data}
              fastEditEnabled={fastEditEnabled}
              selectedRows={selectedRows}
              onSelectionChange={setSelectedRows}
              onCellChange={handleCellChange}
              onRowClick={handleRowClick}
              onRowDelete={handleDelete}
            />
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6">
                <TablePagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.total}
                  pageSize={pagination.limit}
                  onPageChange={(page) => loadData(page)}
                />
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedRows.length}
          onDelete={handleBulkDelete}
          onClose={() => setSelectedRows([])}
        />
      )}
    </div>
  );
}
