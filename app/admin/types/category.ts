export interface Category {
  id: string;
  slug: string;
  title?: any;
  thumbnailId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CategoryEditorProps {
  category: Category | null;
}
