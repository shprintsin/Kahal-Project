export interface Post {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'archived';
  language?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name?: string;
  };
  thumbnail?: {
    id: string;
    filename: string;
    url: string;
  };
  categories?: Array<{
    id: string;
    title: string;
    slug: string;
  }>;
  tags?: Array<{
    id: string;
    slug: string;
    name: string;
  }>;
}
