"use client";

import { Badge } from "@/components/ui/badge";
import { ContentListPage, type ContentListItem } from "@/app/admin/components/content/content-list-page";
import type { ContentTableColumn, ContentStatus } from "@/app/admin/types/content-system.types";
import { updatePost, deletePost } from "@/app/admin/actions/posts";

interface Post extends ContentListItem {
  title: string;
  slug: string;
  status: ContentStatus;
  language: string;
  author: { id: string; name: string | null; email: string } | null;
  categories: { id: string; title: string }[];
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

const columns: ContentTableColumn<Post>[] = [
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
    id: "categories",
    header: "Categories",
    accessor: row => row.categories?.map(c => c.title).join(", ") || "—",
    render: row => (
      <div className="flex gap-1 flex-wrap">
        {row.categories?.slice(0, 2).map(cat => (
          <Badge key={cat.id} variant="secondary" className="font-normal text-xs">
            {cat.title}
          </Badge>
        ))}
        {(row.categories?.length || 0) > 2 && (
          <Badge variant="secondary" className="font-normal text-xs">
            +{row.categories!.length - 2}
          </Badge>
        )}
      </div>
    ),
  },
  {
    id: "updated",
    header: "Updated",
    accessor: row => formatDate(row.updatedAt),
    className: "text-muted-foreground",
    width: "w-[100px]",
  },
];

export function PostsClientPage({ initialPosts }: { initialPosts: Post[] }) {
  return (
    <ContentListPage<Post>
      config={{
        contentType: "posts",
        title: "Posts",
        newButtonLabel: "New Post",
        searchPlaceholder: "Search posts...",
        emptyText: "No posts found.",
        hasStatusFilter: true,
        hasFastEdit: true,
        showFileTree: true,
      }}
      columns={columns}
      initialData={initialPosts}
      actions={{
        onUpdate: async (id, data) => {
          await updatePost(id, data);
        },
        onDelete: async (id) => {
          await deletePost(id);
        },
        onBulkStatusChange: async (ids, status) => {
          await Promise.all(ids.map(id => updatePost(id, { status })));
        },
      }}
      searchFilter={(post, query) =>
        (post.title?.toLowerCase().includes(query) ?? false) ||
        (post.slug?.toLowerCase().includes(query) ?? false) ||
        (post.author?.name?.toLowerCase().includes(query) ?? false)
      }
    />
  );
}
