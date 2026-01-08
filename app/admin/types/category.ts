export interface Category {
  id: string;
  title: string;
  slug: string;
  titleI18n?: any;
  thumbnailId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CategoryEditorProps {
  category: Category | null;
}
