"use client";

import { ContentListPage, type ContentListItem } from "@/app/admin/components/content/content-list-page";
import type { ContentTableColumn } from "@/app/admin/types/content-system.types";
import { Badge } from "@/components/ui/badge";
import { deleteArtifact, updateArtifact } from "@/app/admin/actions/artifacts";

interface Artifact extends ContentListItem {
  year: number | null;
  dateDisplay: string | null;
  excerpt: string | null;
  contentI18n?: any;
  artifactCategory: { id: string; title: string } | null;
  periods: { id: string; name: string }[];
  regions: { id: string; name: string }[];
  createdAt: Date;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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

export function ArtifactsClientPage({ initialArtifacts }: { initialArtifacts: Artifact[] }) {
  return (
    <ContentListPage<Artifact>
      config={{
        contentType: "artifacts",
        title: "Artifacts",
        newButtonLabel: "New Artifact",
        searchPlaceholder: "Search artifacts...",
        emptyText: "No artifacts found.",
        hasStatusFilter: false,
        hasFastEdit: true,
      }}
      columns={columns}
      initialData={initialArtifacts}
      actions={{
        onUpdate: async (id, data) => {
          const artifact = initialArtifacts.find(a => a.id === id);
          await updateArtifact(id, {
            ...data,
            slug: (data.slug as string) || artifact?.slug || "",
            contentI18n: {},
          } as any);
        },
        onDelete: async (id) => {
          await deleteArtifact(id);
        },
      }}
      searchFilter={(item, query) =>
        (item.title?.toLowerCase().includes(query) ?? false) ||
        (item.slug?.toLowerCase().includes(query) ?? false) ||
        (item.dateDisplay?.toLowerCase().includes(query) ?? false)
      }
    />
  );
}
