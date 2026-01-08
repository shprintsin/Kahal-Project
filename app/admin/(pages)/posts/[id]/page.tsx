import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/app/admin/actions/posts";
import { getCategories } from "@/app/admin/actions/categories";
import { getTags } from "@/app/admin/actions/tags";
import { PostEditorClient } from "./post-editor-client";

export default async function PostEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  let post = null;
  if (!isNew) {
    try {
      post = await getPost(id);
    } catch (error) {
      notFound();
    }
  }

  // Load categories, tags, and posts for sidebar
  const [categories, tags, posts] = await Promise.all([
    getCategories(),
    getTags(),
    getPosts(),
  ]);

  return (
    <PostEditorClient
      post={post}
      categories={categories}
      tags={tags}
      posts={posts}
      isNew={isNew}
    />
  );
}
