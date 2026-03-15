"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "./admin-shell";
import {
  LoopStyleEditor,
  FileTree,
  ContentTable,
  ContentPageHeader,
  BulkActionsBar,
} from "@/app/admin/components/content";
import type {
  ContentTableColumn,
  ContentStatus,
} from "@/app/admin/types/content-system.types";
import type { FileTreeItem } from "@/app/admin/components/content/file-tree";

export interface ContentListItem {
  id: string;
  title?: string;
  slug?: string;
  status?: string;
  [key: string]: unknown;
}

export interface ContentListConfig {
  contentType: string;
  title: string;
  newButtonLabel: string;
  searchPlaceholder: string;
  emptyText: string;
  hasStatusFilter?: boolean;
  hasDateFilter?: boolean;
  hasFastEdit?: boolean;
  showFileTree?: boolean;
  pageSize?: number;
}

export interface ContentListActions {
  onUpdate?: (id: string, data: Record<string, unknown>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onBulkStatusChange?: (ids: string[], status: ContentStatus) => Promise<void>;
}

interface ContentListPageProps<T extends ContentListItem> {
  config: ContentListConfig;
  columns: ContentTableColumn<T>[];
  initialData: T[];
  actions?: ContentListActions;
  searchFilter?: (item: T, query: string) => boolean;
  headerActions?: React.ReactNode;
}

export function ContentListPage<T extends ContentListItem>({
  config,
  columns,
  initialData,
  actions = {},
  searchFilter,
  headerActions,
}: ContentListPageProps<T>) {
  const router = useRouter();
  const basePath = `/admin/${config.contentType}`;
  const showFileTree = config.showFileTree !== false;
  const hasFastEdit = config.hasFastEdit !== false;

  const [items, setItems] = React.useState<T[]>(initialData);
  const [searchValue, setSearchValue] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<ContentStatus | "all">("all");
  const [dateFilter, setDateFilter] = React.useState("");
  const [fastEditEnabled, setFastEditEnabled] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(config.pageSize ?? 20);

  const filtered = React.useMemo(() => {
    let result = items;
    if (searchValue.trim()) {
      const q = searchValue.toLowerCase();
      result = result.filter((item) =>
        searchFilter
          ? searchFilter(item, q)
          : item.title?.toLowerCase().includes(q) ||
            item.slug?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((item) => item.status === statusFilter);
    }
    return result;
  }, [items, searchValue, statusFilter, searchFilter]);

  const paginated = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, statusFilter, pageSize]);

  const handleCellChange = async (rowId: string, field: string, value: unknown) => {
    if (!actions.onUpdate) return;
    try {
      setItems((prev) =>
        prev.map((item) =>
          item.id === rowId ? { ...item, [field]: value } : item
        ) as T[]
      );
      await actions.onUpdate(rowId, { [field]: value });
      toast.success("עודכן");
    } catch {
      toast.error("עדכון נכשל");
      router.refresh();
    }
  };

  const handleRowDelete = async (id: string) => {
    if (!actions.onDelete) return;
    try {
      await actions.onDelete(id);
      setItems((prev) => prev.filter((item) => item.id !== id) as T[]);
      toast.success("נמחק");
    } catch {
      toast.error("מחיקה נכשלה");
    }
  };

  const handleBulkDelete = async () => {
    if (!actions.onDelete) return;
    try {
      await Promise.all(selectedRows.map((id) => actions.onDelete!(id)));
      setItems((prev) => prev.filter((item) => !selectedRows.includes(item.id)) as T[]);
      toast.success(`${selectedRows.length} נמחקו`);
      setSelectedRows([]);
    } catch {
      toast.error("מחיקה נכשלה");
    }
  };

  const handleBulkStatusChange = async (status: ContentStatus) => {
    if (!actions.onBulkStatusChange) return;
    try {
      await actions.onBulkStatusChange(selectedRows, status);
      setItems((prev) =>
        prev.map((item) =>
          selectedRows.includes(item.id) ? { ...item, status } : item
        ) as T[]
      );
      toast.success(`סטטוס שונה ל-${status}`);
      setSelectedRows([]);
    } catch {
      toast.error("שינוי סטטוס נכשל");
    }
  };

  const listContent = (
    <div className="w-full">
      <ContentPageHeader
        title={config.title}
        subtitle={`${filtered.length} פריטים`}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder={config.searchPlaceholder}
        statusFilter={config.hasStatusFilter !== false ? statusFilter : undefined}
        onStatusFilterChange={config.hasStatusFilter !== false ? setStatusFilter : undefined}
        dateFilter={config.hasDateFilter ? dateFilter : undefined}
        onDateFilterChange={config.hasDateFilter ? setDateFilter : undefined}
        fastEditEnabled={hasFastEdit ? fastEditEnabled : undefined}
        onFastEditToggle={hasFastEdit ? () => setFastEditEnabled(!fastEditEnabled) : undefined}
        showFastEditToggle={hasFastEdit}
        onNewClick={() => router.push(`${basePath}/new`)}
        newButtonLabel={config.newButtonLabel}
        actions={headerActions}
      />

      <div className="border border-border rounded-xl overflow-hidden bg-card">
        <ContentTable
          data={paginated}
          columns={columns}
          className="bg-transparent"
          fastEditEnabled={hasFastEdit && fastEditEnabled}
          selectedRows={selectedRows}
          onSelectionChange={actions.onDelete ? setSelectedRows : undefined}
          onCellChange={actions.onUpdate ? handleCellChange : undefined}
          onRowClick={(row) => router.push(`${basePath}/${row.id}`)}
          onRowDelete={actions.onDelete ? handleRowDelete : undefined}
          emptyText={config.emptyText}
          pagination={{
            currentPage,
            totalPages,
            totalItems: filtered.length,
            pageSize,
            onPageChange: setCurrentPage,
            onPageSizeChange: setPageSize,
          }}
        />
      </div>

      {actions.onDelete && (
        <BulkActionsBar
          selectedCount={selectedRows.length}
          onClose={() => setSelectedRows([])}
          onDelete={handleBulkDelete}
          onStatusChange={actions.onBulkStatusChange ? handleBulkStatusChange : undefined}
        />
      )}
    </div>
  );

  if (showFileTree) {
    const fileTreeItems: FileTreeItem[] = items.slice(0, 30).map((item) => ({
      id: item.id,
      name: item.title || item.slug || "Untitled",
      slug: item.slug,
      type: "file" as const,
      path: `/${config.contentType}/${item.id}`,
      status: item.status as ContentStatus,
    }));

    return (
      <LoopStyleEditor
        backHref="/admin"
        backLabel="לוח בקרה"
        onBack={() => router.push("/admin")}
        fileTree={
          <FileTree
            items={fileTreeItems}
            onFileSelect={(item: FileTreeItem) => {
              if (item.path) router.push(`/admin${item.path}`);
            }}
            onFileCreate={() => router.push(`${basePath}/new`)}
            onDashboardSelect={() => {}}
            isDashboardActive
          />
        }
        fullWidth
        showLanguageToggle={false}
      >
        {listContent}
      </LoopStyleEditor>
    );
  }

  return (
    <AdminShell>
      {listContent}
    </AdminShell>
  );
}
