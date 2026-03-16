"use client";

import { ContentListPage, type ContentListItem } from "@/app/admin/components/content/content-list-page";
import type { ContentTableColumn, ContentStatus } from "@/app/admin/types/content-system.types";
import { Badge } from "@/components/ui/badge";
import { deleteDocument, updateDocument } from "@/app/admin/actions/documents";

interface Document extends ContentListItem {
  titleEn?: string | null;
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

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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

export function DocumentsClientPage({ initialDocuments }: { initialDocuments: Document[] }) {
  return (
    <ContentListPage<Document>
      config={{
        contentType: "documents",
        title: "Documents",
        newButtonLabel: "New Document",
        searchPlaceholder: "Search documents...",
        emptyText: "No documents found.",
        hasStatusFilter: true,
        hasFastEdit: true,
      }}
      columns={columns}
      initialData={initialDocuments}
      actions={{
        onUpdate: async (id, data) => {
          const result = await updateDocument({ id, ...data });
          if (!result.success) throw new Error(result.error);
        },
        onDelete: async (id) => {
          const result = await deleteDocument(id);
          if (!result.success) throw new Error(result.error);
        },
        onBulkStatusChange: async (ids, status) => {
          const results = await Promise.all(ids.map(id => updateDocument({ id, status })));
          const failed = results.filter(r => !r.success);
          if (failed.length > 0) throw new Error(`Failed to update ${failed.length} documents`);
        },
      }}
      searchFilter={(item, query) =>
        (item.title?.toLowerCase().includes(query) ?? false) ||
        (item.titleEn?.toLowerCase().includes(query) ?? false) ||
        (item.slug?.toLowerCase().includes(query) ?? false) ||
        (item.category?.toLowerCase().includes(query) ?? false)
      }
    />
  );
}
