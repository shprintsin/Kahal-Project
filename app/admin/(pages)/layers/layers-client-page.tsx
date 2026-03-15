"use client";

import { ContentListPage, StatusDot } from "@/app/admin/components/content";
import type { ContentTableColumn } from "@/app/admin/types/content-system.types";
import { Badge } from "@/components/ui/badge";

interface Layer {
  id: string;
  title?: string;
  name: string;
  slug: string;
  type: string;
  status?: string;
  sourceType: string;
  minYear?: number | null;
  maxYear?: number | null;
  category?: { title: string } | null;
  _count: { maps: number };
}

const columns: ContentTableColumn<Layer>[] = [
  {
    id: "title",
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
      <Badge variant="outline" className="font-normal text-xs">{row.type}</Badge>
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
    render: (row) => <StatusDot status={row.status as "draft" | "published" | "archived"} showLabel />,
  },
  {
    id: "source",
    header: "Source",
    accessor: "sourceType",
    width: "w-[100px]",
    render: (row) => (
      <Badge variant="secondary" className="font-normal text-xs">{row.sourceType}</Badge>
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
];

export function LayersClientPage({ initialLayers }: { initialLayers: Layer[] }) {
  const normalized = initialLayers.map((l) => ({
    ...l,
    title: l.name,
  }));

  return (
    <ContentListPage
      config={{
        contentType: "layers",
        title: "Layers",
        newButtonLabel: "New Layer",
        searchPlaceholder: "Search layers...",
        emptyText: "No layers found.",
        hasStatusFilter: true,
        hasFastEdit: false,
        showFileTree: false,
        pageSize: 10,
      }}
      columns={columns}
      initialData={normalized}
      searchFilter={(item, q) =>
        item.name.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q) ||
        (item.category?.title?.toLowerCase().includes(q) ?? false)
      }
    />
  );
}
