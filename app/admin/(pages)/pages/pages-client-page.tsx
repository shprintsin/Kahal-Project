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
import { updatePage, deletePage } from "@/app/admin/actions/pages";

interface Page {
  id: string;
  title: string;
  slug: string;
  status: ContentStatus;
  language: string;
  template: string | null;
  menuOrder: number;
  showInMenu: boolean;
  author: { id: string; name: string | null } | null;
  parent: { id: string; title: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PagesClientPageProps {
  initialPages: any[];
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Build file tree from pages - hierarchical by template
function buildFileTree(pages: Page[]): FileTreeItem[] {
  return pages.map(page => ({
    id: page.id,
    name: page.slug || "untitled",
    slug: page.slug,
    type: "file" as const,
    path: `/pages/${page.id}`,
    status: page.status,
  }));
}

export function PagesClientPage({ initialPages }: PagesClientPageProps) {
  const router = useRouter();

  // Data state
  const [pages, setPages] = React.useState<Page[]>(initialPages as Page[]);

  // UI state
  const [searchValue, setSearchValue] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<ContentStatus | "all">("all");
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  // Filter pages
  const filteredPages = React.useMemo(() => {
    let result = pages;
    if (searchValue.trim()) {
      const query = searchValue.toLowerCase();
      result = result.filter(
        page =>
          page.title.toLowerCase().includes(query) ||
          page.slug.toLowerCase().includes(query) ||
          page.author?.name?.toLowerCase().includes(query)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter(page => page.status === statusFilter);
    }
    return result;
  }, [pages, searchValue, statusFilter]);

  // Paginated
  const paginatedPages = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPages.slice(start, start + pageSize);
  }, [filteredPages, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredPages.length / pageSize);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, statusFilter, pageSize]);

  // Table columns
  const columns: ContentTableColumn<Page>[] = [
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
      id: "template",
      header: "Template",
      accessor: row => row.template || "default",
      width: "w-[120px]",
      render: row => (
        <Badge variant="outline" className="font-normal text-xs">
          {row.template || "default"}
        </Badge>
      ),
    },
    {
      id: "language",
      header: "Lang",
      accessor: "language",
      width: "w-[60px]",
      className: "text-muted-foreground uppercase text-xs",
    },
    {
      id: "author",
      header: "Author",
      accessor: row => row.author?.name || "—",
      className: "text-muted-foreground",
    },
    {
      id: "parent",
      header: "Parent",
      accessor: row => row.parent?.title || "—",
      className: "text-muted-foreground text-xs",
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
      setPages(prev =>
        prev.map(page =>
          page.id === rowId ? { ...page, [field]: value } : page
        )
      );
      
      // Save to database
      await updatePage(rowId, { [field]: value });
      toast.success("Updated");
    } catch (error) {
      console.error("Failed to update:", error);
      toast.error("Failed to update");
      router.refresh();
    }
  };

  const handleRowDelete = async (id: string) => {
    try {
      await deletePage(id);
      setPages(prev => prev.filter(page => page.id !== id));
      toast.success("Deleted");
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedRows.map(id => deletePage(id)));
      setPages(prev => prev.filter(page => !selectedRows.includes(page.id)));
      toast.success(`Deleted ${selectedRows.length} pages`);
      setSelectedRows([]);
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete some pages");
    }
  };

  const handleBulkStatusChange = async (status: ContentStatus) => {
    try {
      await Promise.all(selectedRows.map(id => updatePage(id, { status })));
      setPages(prev =>
        prev.map(page =>
          selectedRows.includes(page.id) ? { ...page, status } : page
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
  const fileTreeItems = buildFileTree(pages);

  const handleFileSelect = (item: FileTreeItem) => {
    if (item.path) {
      router.push(`/admin${item.path}`);
    }
  };

  const fileTree = (
    <FileTree
      items={fileTreeItems}
      onFileSelect={handleFileSelect}
      onFileCreate={() => router.push("/admin/pages/new")}
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
          title="Pages"
          subtitle={`${filteredPages.length} pages`}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search pages..."
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          fastEditEnabled={true}
          showFastEditToggle={false}
          onNewClick={() => router.push("/admin/pages/new")}
          newButtonLabel="New Page"
        />

        <div className="mt-6 border border-border rounded-xl overflow-hidden bg-card">
          <ContentTable
            data={paginatedPages}
            columns={columns}
            className="bg-transparent"
            rowClassName={() => "hover:bg-accent/10"}
            fastEditEnabled={true}
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            onCellChange={handleCellChange}
            onRowClick={(row) => router.push(`/admin/pages/${row.id}`)}
            onRowDelete={handleRowDelete}
            emptyText="No pages found."
            pagination={{
              currentPage,
              totalPages,
              totalItems: filteredPages.length,
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
