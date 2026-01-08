import { AppLanguage as Language } from "@prisma/client";


export interface PostEditorProps {
  post: any | null;
  translationGroupPosts: any[];
  currentUser: { id: string; email: string | null; };
  users: any[];
  categories: any[];
  tags: any[];
  media: any[];
  initialTranslationGroupId?: string;
  initialLanguage?: Language;
}
