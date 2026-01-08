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
} from "@/app/admin/types/content-system.types";
import type { FileTreeItem } from "@/app/admin/components/content/file-tree";
import { Badge } from "@/components/ui/badge";
import { updateArtifact, deleteArtifact } from "@/app/admin/actions/artifacts";

interface Artifact {
  id: string;
  title: string;
  slug: string;
  year: number | null;
  dateDisplay: string | null;
  excerpt: string | null;
  contentI18n?: any;
  artifactCategory: { id: string; title: string } | null;
  periods: { id: string; name: string }[];
  regions: { id: string; name: string }[];
  createdAt: Date;
}

interface ArtifactsClientPageProps {
  initialArtifacts: any[];
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Build file tree from artifacts
function buildFileTree(artifacts: Artifact[]): FileTreeItem[] {
  return artifacts.slice(0, 20).map(artifact => ({
    id: artifact.id,
    name: artifact.title || artifact.slug || "Untitled",
    slug: artifact.slug,
    type: "file" as const,
    path: `/artifacts/${artifact.id}`,
  }));
}

export function ArtifactsClientPage({ initialArtifacts }: ArtifactsClientPageProps) {
  const router = useRouter();

  // Data state
  const [artifacts, setArtifacts] = React.useState<Artifact[]>(initialArtifacts as Artifact[]);

  // UI state
  const [searchValue, setSearchValue] = React.useState("");
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  // Filter artifacts
  const filteredArtifacts = React.useMemo(() => {
    let result = artifacts;
    if (searchValue.trim()) {
      const query = searchValue.toLowerCase();
      result = result.filter(
        artifact =>
          artifact.title?.toLowerCase().includes(query) ||
          artifact.slug?.toLowerCase().includes(query) ||
          artifact.dateDisplay?.toLowerCase().includes(query)
      );
    }
    return result;
  }, [artifacts, searchValue]);

  // Paginated
  const paginatedArtifacts = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredArtifacts.slice(start, start + pageSize);
  }, [filteredArtifacts, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredArtifacts.length / pageSize);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, pageSize]);

  // Table columns
  const columns: ContentTableColumn<Artifact>[] = [
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
      id: "year",
      header: "Year",
      accessor: row => row.year?.toString() || "—",
      width: "w-[80px]",
      className: "text-muted-foreground",
    },
    {
      id: "dateDisplay",
      header: "Date Display",
      accessor: row => row.dateDisplay || "—",
      className: "text-muted-foreground text-xs",
    },
    {
      id: "category",
      header: "Category",
      accessor: row => row.artifactCategory?.title || "—",
      render: row => row.artifactCategory ? (
        <Badge variant="outline" className="font-normal text-xs">
          {row.artifactCategory.title}
        </Badge>
      ) : "—",
    },
    {
      id: "periods",
      header: "Periods",
      accessor: row => row.periods?.map(p => p.name).join(", ") || "—",
      render: row => (
        <div className="flex gap-1 flex-wrap">
          {row.periods?.slice(0, 2).map(period => (
            <Badge key={period.id} variant="secondary" className="font-normal text-xs">
              {period.name}
            </Badge>
          ))}
          {(row.periods?.length || 0) > 2 && (
            <Badge variant="secondary" className="font-normal text-xs">
              +{row.periods!.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "regions",
      header: "Regions",
      accessor: row => row.regions?.map(r => r.name).join(", ") || "—",
      render: row => (
        <div className="flex gap-1 flex-wrap">
          {row.regions?.slice(0, 2).map(region => (
            <Badge key={region.id} variant="secondary" className="font-normal text-xs">
              {region.name}
            </Badge>
          ))}
          {(row.regions?.length || 0) > 2 && (
            <Badge variant="secondary" className="font-normal text-xs">
              +{row.regions!.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "created",
      header: "Created",
      accessor: row => formatDate(row.createdAt),
      className: "text-muted-foreground",
      width: "w-[100px]",
    },
  ];

  // Handlers
  const handleCellChange = async (rowId: string, field: string, value: unknown) => {
    try {
      // Optimistic update
      setArtifacts(prev =>
        prev.map(artifact =>
          artifact.id === rowId ? { ...artifact, [field]: value } : artifact
        )
      );
      
      // Save to database
      await updateArtifact(rowId, { 
        [field]: value,
        slug: artifacts.find(a => a.id === rowId)?.slug || "",
        contentI18n: {}
      } as any);
      toast.success("Updated");
    } catch (error) {
      console.error("Failed to update:", error);
      toast.error("Failed to update");
      router.refresh();
    }
  };

  const handleRowDelete = async (id: string) => {
    try {
      await deleteArtifact(id);
      setArtifacts(prev => prev.filter(artifact => artifact.id !== id));
      toast.success("Deleted");
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedRows.map(id => deleteArtifact(id)));
      setArtifacts(prev => prev.filter(artifact => !selectedRows.includes(artifact.id)));
      toast.success(`Deleted ${selectedRows.length} artifacts`);
      setSelectedRows([]);
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete some artifacts");
    }
  };

  // FileTree
  const fileTreeItems = buildFileTree(artifacts);

  const handleFileSelect = (item: FileTreeItem) => {
    if (item.path) {
      router.push(`/admin${item.path}`);
    }
  };

  const fileTree = (
    <FileTree
      items={fileTreeItems}
      onFileSelect={handleFileSelect}
      onFileCreate={() => router.push("/admin/artifacts/new")}
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
          title="Artifacts"
          subtitle={`${filteredArtifacts.length} artifacts`}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search artifacts..."
          fastEditEnabled={true}
          showFastEditToggle={false}
          onNewClick={() => router.push("/admin/artifacts/new")}
          newButtonLabel="New Artifact"
        />

        <div className="mt-6 border border-border rounded-xl overflow-hidden bg-card">
          <ContentTable
            data={paginatedArtifacts}
            columns={columns}
            className="bg-transparent"
            rowClassName={() => "hover:bg-accent/10"}
            fastEditEnabled={true}
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            onCellChange={handleCellChange}
            onRowClick={(row) => router.push(`/admin/artifacts/${row.id}`)}
            onRowDelete={handleRowDelete}
            emptyText="No artifacts found."
            pagination={{
              currentPage,
              totalPages,
              totalItems: filteredArtifacts.length,
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
        />
      </div>
    </LoopStyleEditor>
  );
}
