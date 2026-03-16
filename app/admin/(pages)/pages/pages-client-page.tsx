"use client";

import { Badge } from "@/components/ui/badge";
import { ContentListPage, type ContentListItem } from "@/app/admin/components/content/content-list-page";
import type { ContentTableColumn, ContentStatus } from "@/app/admin/types/content-system.types";
import { updatePage, deletePage } from "@/app/admin/actions/pages";

interface PageItem extends ContentListItem {
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

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const columns: ContentTableColumn<PageItem>[] = [
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

export function PagesClientPage({ initialPages }: { initialPages: PageItem[] }) {
  return (
    <ContentListPage<PageItem>
      config={{
        contentType: "pages",
        title: "Pages",
        newButtonLabel: "New Page",
        searchPlaceholder: "Search pages...",
        emptyText: "No pages found.",
        hasStatusFilter: true,
        hasFastEdit: true,
        showFileTree: true,
      }}
      columns={columns}
      initialData={initialPages}
      actions={{
        onUpdate: async (id, data) => {
          await updatePage(id, data);
        },
        onDelete: async (id) => {
          await deletePage(id);
        },
        onBulkStatusChange: async (ids, status) => {
          await Promise.all(ids.map(id => updatePage(id, { status })));
        },
      }}
      searchFilter={(page, query) =>
        (page.title?.toLowerCase().includes(query) ?? false) ||
        (page.slug?.toLowerCase().includes(query) ?? false) ||
        (page.author?.name?.toLowerCase().includes(query) ?? false)
      }
    />
  );
}
