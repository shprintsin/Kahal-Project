"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  LoopStyleEditor,
  UnifiedCanvas,
  MetadataSidebar,
  FileTree,
  ContentLanguageProvider,
  useContentLanguage,
  EditorContextMenu,
} from "@/app/admin/components/content";
import type { ContentLanguage, ContentStatus } from "@/app/admin/types/content-system.types";
import type { FileTreeItem } from "@/app/admin/components/content/file-tree";
import { createPost, updatePost } from "@/app/admin/actions/posts";

interface PostEditorClientProps {
  post: any;
  categories: any[];
  tags: any[];
  posts: any[];
  isNew: boolean;
}

function EditorInner({ post, categories, tags, posts, isNew }: PostEditorClientProps) {
  const router = useRouter();
  const postId = post?.id;

  const {
    currentLanguage,
    setLanguage,
    getTranslation,
    updateField,
  } = useContentLanguage();

  // Form state
  const [isDirty, setIsDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);

  // Metadata
  const [status, setStatus] = React.useState<ContentStatus>(post?.status || "draft");
  const [categoryOptions] = React.useState(categories.map((c: any) => ({ value: c.id, label: c.title })));
  const [category, setCategory] = React.useState(post?.categories?.[0]?.id || "");
  const [allTags] = React.useState(tags.map((t: any) => t.name));
  const [postTags, setPostTags] = React.useState(post?.tags?.map((t: any) => t.tag?.name || t.name) || []);
  const [author] = React.useState(post?.author?.name || "");
  const [createdAt] = React.useState(post ? new Date(post.createdAt).toLocaleDateString() : "");
  const [updatedAt] = React.useState(post ? new Date(post.updatedAt).toLocaleDateString() : "");
  const [isPublic, setIsPublic] = React.useState(true);
  const [license, setLicense] = React.useState("");
  const [attachments, setAttachments] = React.useState<any[]>([]);

  // Initialize post data in language provider - only once per ID
  React.useEffect(() => {
    if (post) {
      updateField("title", post.title || "");
      updateField("slug", post.slug || "");
      updateField("content", post.content || "");
      updateField("excerpt", post.excerpt || "");
    }
  }, [postId]); // Only re-run if ID changes

  // Translated values
  const title = getTranslation<string>("title", "") ?? "";
  const slug = getTranslation<string>("slug", "") ?? "";
  const content = getTranslation<string>("content", "") ?? "";
  const excerpt = getTranslation<string>("excerpt", "") ?? "";

  // Handlers
  const handleFieldChange = (field: string, value: string) => {
    updateField(field, value);
    setIsDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        title,
        slug,
        content,
        excerpt,
        status,
        categoryIds: category ? [category] : [],
        tagNames: postTags,
      };

      if (isNew) {
        const newPost = await createPost(data, []);
        toast.success("Created successfully");
        router.push(`/admin/posts/${newPost.id}`);
      } else {
        await updatePost(postId, data);
        toast.success("Saved successfully");
      }
      setIsDirty(false);
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const data = {
        title,
        slug,
        content,
        excerpt,
        status: "published" as ContentStatus,
      };

      if (isNew) {
        const newPost = await createPost(data, []);
        toast.success("Published!");
        router.push(`/admin/posts/${newPost.id}`);
      } else {
        await updatePost(postId, data);
        setStatus("published");
        toast.success("Published!");
      }
      setIsDirty(false);
    } catch (error) {
      console.error("Publish failed:", error);
      toast.error("Failed to publish");
    } finally {
      setPublishing(false);
    }
  };

  const handleLanguageChange = (lang: ContentLanguage) => {
    setLanguage(lang);
    toast.info(`Switched to ${lang.toUpperCase()}`);
  };

  // File tree from posts
  const fileTreeItems: FileTreeItem[] = React.useMemo(() => {
    const byStatus: Record<string, any[]> = { published: [], draft: [], archived: [] };
    posts.forEach(p => {
      const s = p.status || "draft";
      if (!byStatus[s]) byStatus[s] = [];
      byStatus[s].push(p);
    });
    
    return Object.entries(byStatus)
      .filter(([_, items]) => items.length > 0)
      .map(([s, items]) => ({
        id: s,
        name: s.charAt(0).toUpperCase() + s.slice(1),
        type: "folder" as const,
        children: items.slice(0, 8).map(p => ({
          id: p.id,
          name: p.title,
          slug: p.slug,
          type: "file" as const,
          path: `/posts/${p.id}`,
          status: p.status,
        })),
      }));
  }, [posts]);

  const handleFileSelect = (item: FileTreeItem) => {
    if (item.path) {
      router.push(`/admin${item.path}`);
    }
  };

  const fileTree = (
    <FileTree
      items={fileTreeItems}
      currentFileId={postId}
      onFileSelect={handleFileSelect}
      onFileCreate={() => router.push("/admin/posts/new")}
    />
  );

  const sidebar = (
    <MetadataSidebar
      status={status}
      onStatusChange={setStatus}
      category={category}
      onCategoryChange={setCategory}
      categoryOptions={categoryOptions}
      author={author}
      createdAt={createdAt}
      updatedAt={updatedAt}
      isPublic={isPublic}
      onVisibilityChange={setIsPublic}
      license={license}
      onLicenseChange={setLicense}
      tags={postTags}
      onTagsChange={setPostTags}
      tagSuggestions={allTags}
      attachments={attachments}
      onAttachmentsChange={setAttachments}
    />
  );

  return (
    <LoopStyleEditor
      backHref="/admin/posts"
      backLabel="Posts"
      onBack={() => router.push("/admin/posts")}
      onSave={handleSave}
      onPublish={handlePublish}
      saving={saving}
      publishing={publishing}
      isDirty={isDirty}
      currentLanguage={currentLanguage}
      onLanguageChange={handleLanguageChange}
      showLanguageToggle={!isNew}
      fileTree={fileTree}
      sidebar={sidebar}
    >
      <EditorContextMenu onAction={(action) => toast.info(`Action: ${action}`)}>
        <div>
          <UnifiedCanvas
            title={title}
            onTitleChange={(v) => handleFieldChange("title", v)}
            slug={slug}
            onSlugChange={(v) => handleFieldChange("slug", v)}
            slugPrefix="/posts/"
            description={excerpt}
            onDescriptionChange={(v) => handleFieldChange("excerpt", v)}
            content={content}
            onContentChange={(v) => handleFieldChange("content", v)}
            contentPlaceholder="Start writing your post..."
          />
        </div>
      </EditorContextMenu>
    </LoopStyleEditor>
  );
}

export function PostEditorClient(props: PostEditorClientProps) {
  return (
    <ContentLanguageProvider defaultLanguage="en">
      <EditorInner {...props} />
    </ContentLanguageProvider>
  );
}
