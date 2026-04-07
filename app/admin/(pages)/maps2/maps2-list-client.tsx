"use client";

import { ContentListPage } from "@/app/admin/components/content";
import type { ContentTableColumn } from "@/app/admin/types/content-system.types";
import { Badge } from "@/components/ui/badge";
import { deleteMap } from "@/app/admin/actions/maps";
import { formatDateHe } from "@/app/admin/utils/date";
import { getI18nText } from "@/app/admin/components/tables/table-utils";

export interface MapItem {
  id: string;
  titleI18n?: Record<string, string> | null;
  slug: string;
  areaI18n?: Record<string, string> | null;
  year?: number | null;
  version?: string | null;
  status?: string;
  createdAt?: Date | string;
}

function getTitle(row: MapItem) {
  return getI18nText(row.titleI18n);
}

const columns: ContentTableColumn<MapItem>[] = [
  {
    id: "title",
    header: "Title",
    accessor: (row) => getTitle(row),
    width: "w-[250px]",
    render: (row) => <span className="font-medium">{getTitle(row)}</span>,
  },
  {
    id: "slug",
    header: "Slug",
    accessor: "slug",
    width: "w-[180px]",
    render: (row) => (
      <span className="text-muted-foreground font-mono text-xs">/{row.slug}</span>
    ),
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
    accessor: (row) => formatDateHe(row.createdAt),
    width: "w-[120px]",
  },
];

export function Maps2ListClient({ initialMaps }: { initialMaps: MapItem[] }) {
  const normalized = initialMaps.map((m) => ({
    ...m,
    title: getTitle(m),
  }));

  return (
    <ContentListPage
      config={{
        contentType: "maps2",
        title: "Data Studio",
        newButtonLabel: "New Map",
        searchPlaceholder: "Search maps...",
        emptyText: "No maps yet. Create your first map!",
        hasStatusFilter: true,
        hasFastEdit: false,
        showFileTree: false,
      }}
      columns={columns}
      initialData={normalized}
      actions={{
        onDelete: async (id) => { await deleteMap(id); },
      }}
      searchFilter={(item, q) =>
        getTitle(item).toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q)
      }
    />
  );
}
