import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/app/admin/actions/posts";
import { getCategories } from "@/app/admin/actions/categories";
import { getRegions } from "@/app/admin/actions/regions";
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

  const [categories, tags, posts, regions] = await Promise.all([
    getCategories(),
    getTags(),
    getPosts(),
    getRegions(),
  ]);

  return (
    <PostEditorClient
      post={post}
      categories={categories}
      tags={tags}
      posts={posts}
      regions={regions}
      isNew={isNew}
    />
  );
}
