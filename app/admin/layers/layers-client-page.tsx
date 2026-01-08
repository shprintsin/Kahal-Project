"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ContentPageTemplate,
  ContentPageHeader,
  ContentTable,
  StatusDot,
} from "@/app/admin/components/content";
import type {
  ContentTableColumn,
  ContentStatus,
} from "@/app/admin/types/content-system.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";

interface Layer {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: ContentStatus;
  sourceType: string;
  minYear?: number | null;
  maxYear?: number | null;
  category?: {
    title: string;
  } | null;
  _count: {
    maps: number;
  };
}

interface LayersClientPageProps {
  initialLayers: Layer[];
}

export function LayersClientPage({ initialLayers }: LayersClientPageProps) {
  const router = useRouter();

  // Data state
  const [layers, setLayers] = React.useState<Layer[]>(initialLayers);

  // UI state
  const [searchValue, setSearchValue] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<ContentStatus | "all">("all");
  const [dateFilter, setDateFilter] = React.useState("");
  const [fastEditEnabled, setFastEditEnabled] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Filter layers
  const filteredLayers = React.useMemo(() => {
    let result = layers;

    // Search filter
    if (searchValue.trim()) {
      const query = searchValue.toLowerCase();
      result = result.filter(
        (layer) =>
          layer.name.toLowerCase().includes(query) ||
          layer.slug.toLowerCase().includes(query) ||
          (layer.category?.title && layer.category.title.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((layer) => layer.status === statusFilter);
    }

    return result;
  }, [layers, searchValue, statusFilter]);

  // Paginated data
  const paginatedLayers = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLayers.slice(start, start + pageSize);
  }, [filteredLayers, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredLayers.length / pageSize);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, statusFilter, pageSize]);

  // Table columns
  const columns: ContentTableColumn<Layer>[] = [
    {
      id: "name",
      header: "Name",
      accessor: "name",
      width: "w-[250px]",
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      id: "type",
      header: "Type",
      accessor: "type",
      width: "w-[100px]",
      render: (row) => (
        <Badge variant="outline" className="font-normal text-xs">
          {row.type}
        </Badge>
      ),
    },
    {
      id: "category",
      header: "Category",
      accessor: (row) => row.category?.title || "-",
      width: "w-[150px]",
    },
    {
      id: "status",
      header: "Status",
      accessor: "status",
      width: "w-[100px]",
      render: (row) => <StatusDot status={row.status} showLabel />,
    },
    {
      id: "source",
      header: "Source",
      accessor: "sourceType",
      width: "w-[100px]",
      render: (row) => (
        <Badge variant="secondary" className="font-normal text-xs">
          {row.sourceType}
        </Badge>
      ),
    },
    {
      id: "maps",
      header: "Used in Maps",
      accessor: (row) => row._count.maps,
      width: "w-[120px]",
      render: (row) =>
        row._count.maps > 0 ? (
          <span className="text-sm">{row._count.maps} map(s)</span>
        ) : (
          <span className="text-sm text-muted-foreground">Not used</span>
        ),
    },
    {
      id: "years",
      header: "Year Range",
      accessor: (row) =>
        row.minYear && row.maxYear
          ? `${row.minYear}-${row.maxYear}`
          : row.minYear || row.maxYear || "-",
      width: "w-[120px]",
    },
    {
      id: "actions",
      header: "",
      accessor: "id",
      align: "right",
      width: "w-[50px]",
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/admin/layers/${row.id}`);
          }}
        >
          <Edit className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  // Handlers
  const handleCellChange = (rowId: string, field: string, value: unknown) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === rowId ? { ...layer, [field]: value } : layer
      )
    );
  };

  return (
    <ContentPageTemplate maxWidth="6xl">
      {/* Page Header with Search, Filters */}
      <ContentPageHeader
        title="Layers"
        subtitle={`${filteredLayers.length} layers`}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search layers..."
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        fastEditEnabled={fastEditEnabled}
        onFastEditToggle={() => setFastEditEnabled(!fastEditEnabled)}
        onNewClick={() => router.push("/admin/layers/new")}
        newButtonLabel="New Layer"
      />

      {/* Layers Table with Pagination */}
      <ContentTable
        data={paginatedLayers}
        columns={columns}
        fastEditEnabled={fastEditEnabled}
        onRowClick={(row) => router.push(`/admin/layers/${row.id}`)}
        onCellChange={handleCellChange}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        emptyText="No layers found. Try adjusting your filters."
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredLayers.length,
          pageSize,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />
    </ContentPageTemplate>
  );
}
