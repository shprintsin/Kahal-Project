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
import { updateDocument, deleteDocument } from "@/app/admin/actions/documents";

interface Document {
  id: string;
  title: string;
  titleEn?: string | null;
  slug: string;
  category?: string | null;
  year?: number | null;
  lang: string;
  status?: ContentStatus;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    pages: number;
  };
}

interface DocumentsClientPageProps {
  initialDocuments: any[];
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Build file tree from documents
function buildFileTree(documents: Document[]): FileTreeItem[] {
  // Group by category
  const grouped = new Map<string, Document[]>();
  
  documents.forEach(doc => {
    const category = doc.category || "Uncategorized";
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category)!.push(doc);
  });

  // Convert to tree structure
  const items: FileTreeItem[] = [];
  
  grouped.forEach((docs, category) => {
    if (grouped.size > 1) {
      // Show as folder if multiple categories
      items.push({
        id: `category-${category}`,
        name: category,
        type: "folder" as const,
        path: ``,
        children: docs.slice(0, 20).map(doc => ({
          id: doc.id,
          name: doc.title || doc.slug || "Untitled",
          slug: doc.slug,
          type: "file" as const,
          path: `/admin/documents/${doc.id}`,
          status: doc.status,
        })),
      });
    } else {
      // Flat list if single category
      docs.slice(0, 20).forEach(doc => {
        items.push({
          id: doc.id,
          name: doc.title || doc.slug || "Untitled",
          slug: doc.slug,
          type: "file" as const,
          path: `/admin/documents/${doc.id}`,
          status: doc.status,
        });
      });
    }
  });

  return items;
}

export function DocumentsClientPage({ initialDocuments }: DocumentsClientPageProps) {
  const router = useRouter();

  // Data state
  const [documents, setDocuments] = React.useState<Document[]>(initialDocuments as Document[]);

  // UI state
  const [searchValue, setSearchValue] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<ContentStatus | "all">("all");
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  // Filter documents
  const filteredDocuments = React.useMemo(() => {
    let result = documents;
    if (searchValue.trim()) {
      const query = searchValue.toLowerCase();
      result = result.filter(
        doc =>
          doc.title?.toLowerCase().includes(query) ||
          doc.titleEn?.toLowerCase().includes(query) ||
          doc.slug?.toLowerCase().includes(query) ||
          doc.category?.toLowerCase().includes(query)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter(doc => doc.status === statusFilter);
    }
    return result;
  }, [documents, searchValue, statusFilter]);

  // Paginated
  const paginatedDocuments = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDocuments.slice(start, start + pageSize);
  }, [filteredDocuments, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredDocuments.length / pageSize);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, statusFilter, pageSize]);

  // Table columns
  const columns: ContentTableColumn<Document>[] = [
    {
      id: "title",
      header: "Title",
      accessor: "title",
      render: (row) => (
        <div>
          <div className="font-medium">{row.title}</div>
          {row.titleEn && <div className="text-sm text-muted-foreground">{row.titleEn}</div>}
        </div>
      ),
      editable: true,
      className: "min-w-[250px]",
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
      id: "category",
      header: "Category",
      accessor: "category",
      render: (row) => row.category ? <Badge variant="outline">{row.category}</Badge> : "—",
      editable: true,
      width: "w-[140px]",
    },
    {
      id: "year",
      header: "Year",
      accessor: "year",
      render: (row) => row.year || "—",
      editable: true,
      editType: "number",
      width: "w-[100px]",
    },
    {
      id: "lang",
      header: "Lang",
      accessor: "lang",
      render: (row) => <Badge variant="secondary">{row.lang}</Badge>,
      width: "w-[80px]",
    },
    {
      id: "pages",
      header: "Pages",
      accessor: (row) => row._count?.pages ?? 0,
      render: (row) => <div className="text-center">{row._count?.pages ?? 0}</div>,
      width: "w-[80px]",
    },
    {
      id: "updated",
      header: "Updated",
      accessor: row => formatDate(row.updatedAt),
      className: "text-muted-foreground",
      width: "w-[120px]",
    },
  ];

  // Handlers
  const handleCellChange = async (rowId: string, field: string, value: unknown) => {
    try {
      // Optimistic update
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === rowId ? { ...doc, [field]: value } : doc
        )
      );
      
      // Save to database
      const result = await updateDocument({ id: rowId, [field]: value });
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success("Updated");
    } catch (error) {
      console.error("Failed to update:", error);
      toast.error("Failed to update");
      router.refresh();
    }
  };

  const handleRowDelete = async (id: string) => {
    try {
      const result = await deleteDocument(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      toast.success("Deleted");
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete");
    }
  };

  const handleBulkDelete = async () => {
    try {
      const results = await Promise.all(selectedRows.map(id => deleteDocument(id)));
      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        throw new Error(`Failed to delete ${failed.length} documents`);
      }
      setDocuments(prev => prev.filter(doc => !selectedRows.includes(doc.id)));
      toast.success(`Deleted ${selectedRows.length} documents`);
      setSelectedRows([]);
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete some documents");
    }
  };

  const handleBulkStatusChange = async (status: ContentStatus) => {
    try {
      const results = await Promise.all(
        selectedRows.map(id => updateDocument({ id, status }))
      );
      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        throw new Error(`Failed to update ${failed.length} documents`);
      }
      setDocuments(prev =>
        prev.map(doc =>
          selectedRows.includes(doc.id) ? { ...doc, status } : doc
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
  const fileTreeItems = buildFileTree(documents);

  const handleFileSelect = (item: FileTreeItem) => {
    if (item.path) {
      router.push(`/admin${item.path}`);
    }
  };

  const fileTree = (
    <FileTree
      items={fileTreeItems}
      onFileSelect={handleFileSelect}
      onFileCreate={() => router.push("/admin/documents/new")}
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
          title="Documents"
          subtitle={`${filteredDocuments.length} documents`}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search documents..."
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          fastEditEnabled={true}
          showFastEditToggle={false}
          onNewClick={() => router.push("/admin/documents/new")}
          newButtonLabel="New Document"
        />

        <div className="mt-6 border border-border rounded-xl overflow-hidden bg-card">
          <ContentTable
            data={paginatedDocuments}
            columns={columns}
            className="bg-transparent"
            rowClassName={() => "hover:bg-accent/10"}
            fastEditEnabled={true}
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            onCellChange={handleCellChange}
            onRowClick={(row) => router.push(`/admin/documents/${row.id}`)}
            onRowDelete={handleRowDelete}
            emptyText="No documents found."
            pagination={{
              currentPage,
              totalPages,
              totalItems: filteredDocuments.length,
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
