import type { Prisma } from "@prisma/client";

export type PostForEditor = Prisma.PostGetPayload<{
  include: {
    author: { select: { id: true; name: true; email: true } };
    thumbnail: { select: { id: true; url: true; altTextI18n: true } };
    tags: { include: { tag: true } };
    categories: true;
    regions: true;
  };
}>;

export type PageForEditor = Prisma.PageGetPayload<{
  include: {
    author: true;
    thumbnail: true;
    tags: true;
    regions: true;
  };
}>;

export type DocumentForEditor = Prisma.DocumentGetPayload<{
  include: {
    pages: true;
  };
}>;

export type DocumentListItem = {
  id: string;
  title: string;
  slug: string;
  status: string;
  category?: string | null;
  year?: number | null;
  createdAt: Date;
};

export type CategoryOption = Pick<
  Prisma.CategoryGetPayload<{}>,
  "id" | "title" | "slug"
>;

export type TagOption = Pick<
  Prisma.TagGetPayload<{}>,
  "id" | "name" | "slug" | "nameI18n"
>;

export type PostListItem = Pick<
  Prisma.PostGetPayload<{}>,
  "id" | "title" | "slug" | "status" | "createdAt"
>;

export type PageListItem = Pick<
  Prisma.PageGetPayload<{}>,
  "id" | "title" | "slug" | "status" | "template" | "createdAt"
>;
