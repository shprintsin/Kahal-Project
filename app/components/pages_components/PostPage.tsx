import { Calendar, User } from "lucide-react"
import type { Post as PrismaPost } from "@prisma/client"
import { PostSideBar } from './PostSideBar'
import { PageTitle, PageSubtitle } from '@/components/ui/typography'
import { MetaRow, MetaItem } from '@/components/ui/metadata'
import { NoteCard, Section } from '@/components/ui/sections'
import { Prose } from '@/components/ui/prose'
import { TagPill, TagPillList } from '@/components/ui/tag-pill'
import { SiteBreadcrumbs } from '@/components/ui/site-breadcrumbs'
import { getTranslations } from 'next-intl/server'
import { defaultLocale } from '@/lib/i18n/config'

// View-model for the rendered post page. Built from a Prisma Post plus
// flattened relation fields (author name, primary category, tag names) and
// page-specific extras (subtitle, date, imageUrl, sources).
interface PostData extends Omit<PrismaPost, 'content' | 'createdAt' | 'updatedAt'> {
  content: string
  subtitle?: string
  author?: string
  category?: string
  date?: string
  imageUrl?: string
  tags: string[]
  sources: { id: string; title: string; author: string; year: string }[]
}

export default async function PostPage({ post, locale }: { post: PostData; locale?: string }) {
  const loc = locale || defaultLocale
  const t = await getTranslations({ locale: loc })

  return (
    <div className="min-h-screen bg-white">
      <SiteBreadcrumbs
        items={[
          { label: t('public.site.name'), href: `/${loc}` },
          { label: post.category || "", href: `/${loc}/categories/${post.category}` },
          { label: post.title },
        ]}
      />

      <main className="container mx-auto px-4 py-6 sm:py-8 w-full lg:w-10/12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="shadow-md overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="mb-6">
                  <PageTitle>{post.title}</PageTitle>
                  <PageSubtitle>{post.subtitle}</PageSubtitle>

                  <MetaRow>
                    <MetaItem icon={User}>{post.author}</MetaItem>
                    <MetaItem icon={Calendar}>{post.date}</MetaItem>
                    <MetaItem href={`/category/${post.category}`}>{post.category}</MetaItem>
                  </MetaRow>
                </div>

                <Prose html={post.content} />

                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                  <TagPillList>
                    {post.tags.map((tag, index) => (
                      <TagPill key={index} variant="interactive" href={`/tag/${tag}`}>
                        {tag}
                      </TagPill>
                    ))}
                  </TagPillList>
                </div>
              </div>
            </div>

            <NoteCard>
              <p>citationInfo</p>
            </NoteCard>
          </div>

          <Section className="bg-gray-400">
            <PostSideBar post={post} />
          </Section>
        </div>
      </main>
    </div>
  )
}
