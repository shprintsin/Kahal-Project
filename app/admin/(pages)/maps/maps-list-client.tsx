"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ContentPageTemplate,
  ContentPageHeader,
  ContentTable,
} from "@/app/admin/components/content";
import type {
  ContentTableColumn,
  ContentStatus,
} from "@/app/admin/types/content-system.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";
import { formatDateHe } from "@/app/admin/utils/date";
import { getI18nText } from "@/app/admin/components/tables/table-utils";

interface Map {
  id: string;
  titleI18n?: Record<string, string> | null;
  title_i18n?: Record<string, string> | null;
  slug: string;
  areaI18n?: Record<string, string> | null;
  area_i18n?: Record<string, string> | null;
  year?: number | null;
  version?: string | null;
  status?: ContentStatus;
  createdAt?: Date | string;
  created_at?: Date | string;
  updatedAt?: Date | string;
  updated_at?: Date | string;
}

interface MapsListClientProps {
  initialMaps: Map[];
}

export function MapsListClient({ initialMaps }: MapsListClientProps) {
  const router = useRouter();

  const [maps, setMaps] = React.useState<Map[]>(initialMaps);

  const [searchValue, setSearchValue] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<ContentStatus | "all">("all");
  const [dateFilter, setDateFilter] = React.useState("");
  const [fastEditEnabled, setFastEditEnabled] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);

  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const filteredMaps = React.useMemo(() => {
    let result = maps;

    if (searchValue.trim()) {
      const query = searchValue.toLowerCase();
      result = result.filter(
        (map) =>
          getI18nText(map.titleI18n || map.title_i18n).toLowerCase().includes(query) ||
          map.slug.toLowerCase().includes(query) ||
          getI18nText(map.areaI18n || map.area_i18n).toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((map) => map.status === statusFilter);
    }

    return result;
  }, [maps, searchValue, statusFilter]);

  const paginatedMaps = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMaps.slice(start, start + pageSize);
  }, [filteredMaps, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredMaps.length / pageSize);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, statusFilter, pageSize]);

  const columns: ContentTableColumn<Map>[] = [
    {
      id: "title",
      header: "Title",
      accessor: (row) => getI18nText(row.titleI18n || row.title_i18n),
      width: "w-[250px]",
      render: (row) => (
        <span className="font-medium">
          {getI18nText(row.titleI18n || row.title_i18n)}
        </span>
      ),
    },
    {
      id: "slug",
      header: "Slug",
      accessor: "slug",
      width: "w-[180px]",
      render: (row) => (
        <span className="text-muted-foreground font-mono text-xs">
          /{row.slug}
        </span>
      ),
    },
    {
      id: "area",
      header: "Area",
      accessor: (row) => getI18nText(row.areaI18n || row.area_i18n, "-"),
      width: "w-[150px]",
    },
    {
      id: "year",
      header: "Year",
      accessor: (row) => row.year || "-",
      width: "w-[80px]",
    },
    {
      id: "version",
      header: "Version",
      accessor: (row) => row.version || "-",
      width: "w-[100px]",
      render: (row) => (
        <Badge variant="secondary" className="font-normal text-xs">
          {row.version || "v1"}
        </Badge>
      ),
    },
    {
      id: "created",
      header: "Created",
      accessor: (row) => formatDateHe(row.createdAt || row.created_at),
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
            router.push(`/admin/maps/${row.id}`);
          }}
        >
          <Edit className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  const handleCellChange = (rowId: string, field: string, value: unknown) => {
    setMaps((prev) =>
      prev.map((map) =>
        map.id === rowId ? { ...map, [field]: value } : map
      )
    );
  };

  return (
    <ContentPageTemplate maxWidth="6xl">
      <ContentPageHeader
        title="Maps"
        subtitle={`${filteredMaps.length} maps`}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search maps..."
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        fastEditEnabled={fastEditEnabled}
        onFastEditToggle={() => setFastEditEnabled(!fastEditEnabled)}
        onNewClick={() => router.push("/admin/maps/new")}
        newButtonLabel="New Map"
      />

      <ContentTable
        data={paginatedMaps}
        columns={columns}
        fastEditEnabled={fastEditEnabled}
        onRowClick={(row) => router.push(`/admin/maps/${row.id}`)}
        onCellChange={handleCellChange}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        emptyText="No maps found. Try adjusting your filters."
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredMaps.length,
          pageSize,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />
    </ContentPageTemplate>
  );
}
