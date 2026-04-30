import { Calendar, User } from "lucide-react"
import type { Post as PrismaPost } from "@prisma/client"
import { MetaRow, MetaItem } from '@/components/ui/metadata'
import { NoteCard } from '@/components/ui/sections'
import { Prose } from '@/components/ui/prose'
import { TagPill, TagPillList } from '@/components/ui/tag-pill'
import { SiteBreadcrumbs } from '@/components/ui/site-breadcrumbs'
import { TOCWidget } from './TOCWidget'
import { getTranslations } from 'next-intl/server'
import { defaultLocale } from '@/lib/i18n/config'
import { extractTOC } from '@/lib/toc'

interface PostData extends Omit<PrismaPost, 'content' | 'createdAt' | 'updatedAt' | 'sources'> {
  content: string
  subtitle?: string
  author?: string
  category?: string
  date?: string
  imageUrl?: string
  tags: string[]
  sources?: string | null
}

export default async function PostPage({ post, locale }: { post: PostData; locale?: string }) {
  const loc = locale || defaultLocale
  const t = await getTranslations({ locale: loc })
  const { html: contentWithIds, headings } = extractTOC(post.content)

  return (
    <div className="min-h-screen bg-white">
      <SiteBreadcrumbs
        items={[
          { label: t('public.site.name'), href: `/${loc}` },
          { label: post.category || "", href: `/${loc}/categories/${post.category}` },
          { label: post.title },
        ]}
      />

      <main className="px-4 py-8 sm:py-12">
        <div className="relative mx-auto w-full max-w-7xl">
          {headings.length > 0 ? (
            <aside
              className="hidden xl:block absolute top-0 start-0 w-56"
              aria-hidden={false}
            >
              <div className="sticky top-24">
                <TOCWidget headings={headings} title={t('public.collections.toc')} />
              </div>
            </aside>
          ) : null}

          <article className="mx-auto w-full max-w-3xl">
            <header className="mb-8 sm:mb-10">
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-brand-primary leading-tight tracking-tight">
                {post.title}
              </h1>
              {post.subtitle ? (
                <p className="mt-4 text-lg sm:text-xl text-body-secondary leading-relaxed">
                  {post.subtitle}
                </p>
              ) : null}

              <MetaRow className="mt-6 mb-0">
                <MetaItem icon={User}>{post.author}</MetaItem>
                <MetaItem icon={Calendar}>{post.date}</MetaItem>
                {post.category ? (
                  <MetaItem href={`/category/${post.category}`}>{post.category}</MetaItem>
                ) : null}
              </MetaRow>
            </header>

            <Prose html={contentWithIds} />

            {post.tags.length > 0 ? (
              <div className="mt-10 pt-6 border-t border-gray-200">
                <TagPillList>
                  {post.tags.map((tag, index) => (
                    <TagPill key={index} variant="interactive" href={`/tag/${tag}`}>
                      {tag}
                    </TagPill>
                  ))}
                </TagPillList>
              </div>
            ) : null}

            {post.sources && post.sources.trim() ? (
              <NoteCard className="mt-10 rounded-md">
                <h2 className="font-display text-base font-semibold text-brand-primary mb-3 uppercase tracking-wide">
                  {t('public.posts.sources')}
                </h2>
                <div className="text-sm text-body whitespace-pre-line leading-relaxed">
                  {post.sources}
                </div>
              </NoteCard>
            ) : null}
          </article>
        </div>
      </main>
    </div>
  )
}
