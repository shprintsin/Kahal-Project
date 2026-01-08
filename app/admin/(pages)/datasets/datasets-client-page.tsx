"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";
import { updateDataset, deleteDataset } from "@/app/admin/actions/datasets";

interface Dataset {
  id: string;
  title: string;
  slug: string;
  status: ContentStatus;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DatasetsClientPageProps {
  initialDatasets: any[];
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Build file tree from datasets
function buildFileTree(datasets: Dataset[]): FileTreeItem[] {
  return datasets.slice(0, 20).map(dataset => ({
    id: dataset.id,
    name: dataset.title || dataset.slug || "Untitled",
    slug: dataset.slug,
    type: "file" as const,
    path: `/datasets/${dataset.id}`,
    status: dataset.status,
  }));
}

export function DatasetsClientPage({ initialDatasets }: DatasetsClientPageProps) {
  const router = useRouter();

  // Data state
  const [datasets, setDatasets] = React.useState<Dataset[]>(initialDatasets as Dataset[]);

  // UI state
  const [searchValue, setSearchValue] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<ContentStatus | "all">("all");
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  // Filter datasets
  const filteredDatasets = React.useMemo(() => {
    let result = datasets;
    if (searchValue.trim()) {
      const query = searchValue.toLowerCase();
      result = result.filter(
        dataset =>
          dataset.title?.toLowerCase().includes(query) ||
          dataset.slug?.toLowerCase().includes(query) ||
          dataset.description?.toLowerCase().includes(query)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter(dataset => dataset.status === statusFilter);
    }
    return result;
  }, [datasets, searchValue, statusFilter]);

  // Paginated
  const paginatedDatasets = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDatasets.slice(start, start + pageSize);
  }, [filteredDatasets, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredDatasets.length / pageSize);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, statusFilter, pageSize]);

  // Table columns
  const columns: ContentTableColumn<Dataset>[] = [
    {
      id: "title",
      header: "Title",
      accessor: "title",
      editable: true,
      className: "min-w-[200px]",
    },
    {
      id: "slug",
      header: "Slug",
      accessor: "slug",
      editable: true,
      width: "w-[180px]",
      className: "font-mono text-xs",
    },
    {
      id: "status",
      header: "Status",
      accessor: "status",
      editType: "select",
      editable: true,
      editOptions: [
        { value: "draft", label: "Draft" },
        { value: "published", label: "Published" },
        { value: "archived", label: "Archived" },
      ],
      width: "w-[120px]",
    },
    {
      id: "description",
      header: "Description",
      accessor: row => row.description || "—",
      className: "text-muted-foreground text-sm max-w-[300px] truncate",
    },
    {
      id: "updated",
      header: "Updated",
      accessor: row => formatDate(row.updatedAt),
      className: "text-muted-foreground",
      width: "w-[100px]",
    },
  ];

  // Handlers
  const handleCellChange = async (rowId: string, field: string, value: unknown) => {
    try {
      // Optimistic update
      setDatasets(prev =>
        prev.map(dataset =>
          dataset.id === rowId ? { ...dataset, [field]: value } : dataset
        )
      );
      
      // Save to database
      await updateDataset(rowId, { [field]: value });
      toast.success("Updated");
    } catch (error) {
      console.error("Failed to update:", error);
      toast.error("Failed to update");
      router.refresh();
    }
  };

  const handleRowDelete = async (id: string) => {
    try {
      await deleteDataset(id);
      setDatasets(prev => prev.filter(dataset => dataset.id !== id));
      toast.success("Deleted");
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedRows.map(id => deleteDataset(id)));
      setDatasets(prev => prev.filter(dataset => !selectedRows.includes(dataset.id)));
      toast.success(`Deleted ${selectedRows.length} datasets`);
      setSelectedRows([]);
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete some datasets");
    }
  };

  const handleBulkStatusChange = async (status: ContentStatus) => {
    try {
      await Promise.all(selectedRows.map(id => updateDataset(id, { status })));
      setDatasets(prev =>
        prev.map(dataset =>
          selectedRows.includes(dataset.id) ? { ...dataset, status } : dataset
        )
      );
      toast.success(`Changed status to ${status}`);
      setSelectedRows([]);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  // FileTree
  const fileTreeItems = buildFileTree(datasets);

  const handleFileSelect = (item: FileTreeItem) => {
    if (item.path) {
      router.push(`/admin${item.path}`);
    }
  };

  const fileTree = (
    <FileTree
      items={fileTreeItems}
      onFileSelect={handleFileSelect}
      onFileCreate={() => router.push("/admin/datasets/new")}
      onDashboardSelect={() => {}}
      isDashboardActive={true}
    />
  );

  return (
    <LoopStyleEditor
      backHref="/admin"
      backLabel="Admin"
      onBack={() => router.push("/admin")}
      fileTree={fileTree}
      fullWidth={true}
      showLanguageToggle={false}
    >
      <div className="w-full">
        <ContentPageHeader
          title="Datasets"
          subtitle={`${filteredDatasets.length} datasets`}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search datasets..."
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          fastEditEnabled={true}
          showFastEditToggle={false}
          onNewClick={() => router.push("/admin/datasets/new")}
          newButtonLabel="New Dataset"
        />

        <div className="mt-6 border border-border rounded-xl overflow-hidden bg-card">
          <ContentTable
            data={paginatedDatasets}
            columns={columns}
            className="bg-transparent"
            rowClassName={() => "hover:bg-accent/10"}
            fastEditEnabled={true}
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            onCellChange={handleCellChange}
            onRowClick={(row) => router.push(`/admin/datasets/${row.id}`)}
            onRowDelete={handleRowDelete}
            emptyText="No datasets found."
            pagination={{
              currentPage,
              totalPages,
              totalItems: filteredDatasets.length,
              pageSize,
              onPageChange: setCurrentPage,
              onPageSizeChange: setPageSize,
            }}
          />
        </div>

        <BulkActionsBar
          selectedCount={selectedRows.length}
          onClose={() => setSelectedRows([])}
          onDelete={handleBulkDelete}
          onStatusChange={handleBulkStatusChange}
        />
      </div>
    </LoopStyleEditor>
  );
}
