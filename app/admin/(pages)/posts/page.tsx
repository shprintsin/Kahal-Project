import { redirect } from "next/navigation";
import { getPosts } from "@/app/admin/actions/posts";
import { PostsClientPage } from "./posts-client-page";

export default async function PostsPage() {
  const posts = await getPosts();
  
  return <PostsClientPage initialPosts={posts} />;
}
