export interface Tag {
  id: string;
  slug: string;
  // Prisma returns JSON here; keep wide to match DB
  name?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TagEditorProps {
  tag: Tag | null;
}
