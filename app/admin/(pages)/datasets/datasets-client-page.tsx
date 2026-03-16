"use client";

import { ContentListPage, type ContentListItem } from "@/app/admin/components/content/content-list-page";
import type { ContentTableColumn, ContentStatus } from "@/app/admin/types/content-system.types";
import { updateDataset, deleteDataset } from "@/app/admin/actions/datasets";

interface Dataset extends ContentListItem {
  title: string;
  slug: string;
  status: ContentStatus;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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
    accessor: row => row.description?.slice(0, 60) || "—",
    className: "text-muted-foreground text-xs max-w-[200px] truncate",
  },
  {
    id: "updated",
    header: "Updated",
    accessor: row => formatDate(row.updatedAt),
    className: "text-muted-foreground",
    width: "w-[100px]",
  },
];

export function DatasetsClientPage({ initialDatasets }: { initialDatasets: Dataset[] }) {
  return (
    <ContentListPage<Dataset>
      config={{
        contentType: "datasets",
        title: "Datasets",
        newButtonLabel: "New Dataset",
        searchPlaceholder: "Search datasets...",
        emptyText: "No datasets found.",
        hasStatusFilter: true,
        hasFastEdit: true,
        showFileTree: true,
      }}
      columns={columns}
      initialData={initialDatasets}
      actions={{
        onUpdate: async (id, data) => {
          await updateDataset(id, data as Record<string, unknown>);
        },
        onDelete: async (id) => {
          await deleteDataset(id);
        },
        onBulkStatusChange: async (ids, status) => {
          await Promise.all(ids.map(id => updateDataset(id, { status } as Record<string, unknown>)));
        },
      }}
      searchFilter={(dataset, query) =>
        (dataset.title?.toLowerCase().includes(query) ?? false) ||
        (dataset.slug?.toLowerCase().includes(query) ?? false) ||
        (dataset.description?.toLowerCase().includes(query) ?? false)
      }
    />
  );
}
