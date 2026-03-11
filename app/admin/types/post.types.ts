import type { PostForEditor, CategoryOption, TagOption } from "./editor-data";
import type { AppLanguage as Language } from "@prisma/client";

export interface PostEditorProps {
  post: PostForEditor | null;
  translationGroupPosts: PostForEditor[];
  currentUser: { id: string; email: string | null };
  users: { id: string; name: string | null; email: string }[];
  categories: CategoryOption[];
  tags: TagOption[];
  media: { id: string; url: string; altTextI18n: unknown }[];
  initialTranslationGroupId?: string;
  initialLanguage?: Language;
}
