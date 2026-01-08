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
  ContentStatus,
} from "@/app/admin/types/content-system.types";
import type { FileTreeItem } from "@/app/admin/components/content/file-tree";
import { Badge } from "@/components/ui/badge";
import { updatePost, deletePost } from "@/app/admin/actions/posts";

interface Post {
  id: string;
  title: string;
  slug: string;
  status: ContentStatus;
  language: string;
  author: { id: string; name: string | null; email: string } | null;
  categories: { id: string; title: string }[];
  createdAt: Date;
  updatedAt: Date;
}

interface PostsClientPageProps {
  initialPosts: any[];
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Build file tree from posts grouped by status
function buildFileTree(posts: Post[]): FileTreeItem[] {
  return posts.map(post => ({
    id: post.id,
    name: post.slug || "untitled",
    slug: post.slug,
    type: "file" as const,
    path: `/posts/${post.id}`,
    status: post.status,
  }));
}

export function PostsClientPage({ initialPosts }: PostsClientPageProps) {
  const router = useRouter();

  // Data state
  const [posts, setPosts] = React.useState<Post[]>(initialPosts as Post[]);

  // UI state
  const [searchValue, setSearchValue] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<ContentStatus | "all">("all");
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  // Filter posts
  const filteredPosts = React.useMemo(() => {
    let result = posts;
    if (searchValue.trim()) {
      const query = searchValue.toLowerCase();
      result = result.filter(
        post =>
          post.title.toLowerCase().includes(query) ||
          post.slug.toLowerCase().includes(query) ||
          post.author?.name?.toLowerCase().includes(query)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter(post => post.status === statusFilter);
    }
    return result;
  }, [posts, searchValue, statusFilter]);

  // Paginated
  const paginatedPosts = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPosts.slice(start, start + pageSize);
  }, [filteredPosts, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredPosts.length / pageSize);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, statusFilter, pageSize]);

  // Table columns
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

  // Handlers
  const handleCellChange = async (rowId: string, field: string, value: unknown) => {
    try {
      // Optimistic update
      setPosts(prev =>
        prev.map(post =>
          post.id === rowId ? { ...post, [field]: value } : post
        )
      );
      
      // Save to database
      await updatePost(rowId, { [field]: value });
      toast.success("Updated");
    } catch (error) {
      console.error("Failed to update:", error);
      toast.error("Failed to update");
      router.refresh();
    }
  };

  const handleRowDelete = async (id: string) => {
    try {
      await deletePost(id);
      setPosts(prev => prev.filter(post => post.id !== id));
      toast.success("Deleted");
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedRows.map(id => deletePost(id)));
      setPosts(prev => prev.filter(post => !selectedRows.includes(post.id)));
      toast.success(`Deleted ${selectedRows.length} posts`);
      setSelectedRows([]);
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete some posts");
    }
  };

  const handleBulkStatusChange = async (status: ContentStatus) => {
    try {
      await Promise.all(selectedRows.map(id => updatePost(id, { status })));
      setPosts(prev =>
        prev.map(post =>
          selectedRows.includes(post.id) ? { ...post, status } : post
        )
      );
      toast.success(`Changed status to ${status}`);
      setSelectedRows([]);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  // FileTree
  const fileTreeItems = buildFileTree(posts);

  const handleFileSelect = (item: FileTreeItem) => {
    if (item.path) {
      router.push(`/admin${item.path}`);
    }
  };

  const fileTree = (
    <FileTree
      items={fileTreeItems}
      onFileSelect={handleFileSelect}
      onFileCreate={() => router.push("/admin/posts/new")}
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
          title="Posts"
          subtitle={`${filteredPosts.length} posts`}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder="Search posts..."
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          fastEditEnabled={true}
          showFastEditToggle={false}
          onNewClick={() => router.push("/admin/posts/new")}
          newButtonLabel="New Post"
        />

        <div className="mt-6 border border-border rounded-xl overflow-hidden bg-card">
          <ContentTable
            data={paginatedPosts}
            columns={columns}
            className="bg-transparent"
            rowClassName={() => "hover:bg-accent/10"}
            fastEditEnabled={true}
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            onCellChange={handleCellChange}
            onRowClick={(row) => router.push(`/admin/posts/${row.id}`)}
            onRowDelete={handleRowDelete}
            emptyText="No posts found."
            pagination={{
              currentPage,
              totalPages,
              totalItems: filteredPosts.length,
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
          onStatusChange={handleBulkStatusChange}
        />
      </div>
    </LoopStyleEditor>
  );
}
