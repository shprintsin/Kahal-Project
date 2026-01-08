"use client"
import { Download, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PostSideBar } from './PostSideBar'
import Link from 'next/link'
import { Post as ApiPost } from "@/payload-types"
import ButtonIcons, { MetaItem, MetaRow, NoteCard, PageSubtitle, PageTitle, RowSection, Section, SectionSubTitle, SectionTitle, SeeMoreButton } from "../layout/ui/Components"

interface PostData extends Omit<ApiPost, 'content' | 'author' | 'tags'> {
  content: string // HTML string
  subtitle?: string
  author?: string
  category?: string
  date?: string
  imageUrl?: string
  tags: string[]
  sources: { id: string; title: string; author: string; year: string }[]
}

export default function PostPage({ post }: { post: PostData }) {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      {/* Breadcrumbs */}

      <div className="bg-gray-100 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-[#0d4d2c]">
              בית
            </Link>
            <span className="mx-2">
              {/* ChevronRight icon here if needed */}
            </span>
            <Link href="/category/demography" className="hover:text-[#0d4d2c]">
              {post.category}
            </Link>
            <span className="mx-2">
              {/* ChevronRight icon here if needed */}
            </span>
            <span className="text-gray-800">{post.title}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container w-10/12 mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Article */}
          <div className="lg:col-span-2">
            <div className="shadow-md overflow-hidden">
              {/* <img
                src={post.imageUrl || "/placeholder.svg"}
                alt={post.title}
                width={800}
                height={400}
                className="w-full h-64 object-cover"
              /> */}

              <div className="p-6">
                <div className="mb-6">
                  <PageTitle> {post.title} </PageTitle>
                  <PageSubtitle> {post.subtitle} </PageSubtitle>

                  <MetaRow>
      {/* Item 1: Author */}
            <MetaItem icon={User}>
              {post.author}
            </MetaItem>

            {/* Item 2: Date */}
            <MetaItem icon={Calendar}>
              {post.date}
            </MetaItem>

            {/* Item 3: Category (Clickable) */}
            <MetaItem href={`/category/${post.category}`}>
              {post.category}
            </MetaItem>
          </MetaRow>
                </div>

                <div 
                  className="prose prose-lg max-w-none p-8 md:p-12 
                    leading-relaxed text-gray-800 
                    [&>h1]:text-4xl [&>h1]:font-bold [&>h1]:text-[#131e1e] [&>h1]:mb-6 [&>h1]:mt-8 [&>h1]:font-['Secular_One']
                    [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-[#1a472a] [&>h2]:mb-4 [&>h2]:mt-6 [&>h2]:font-['Secular_One']
                    [&>h3]:text-2xl [&>h3]:font-semibold [&>h3]:text-[#1a472a] [&>h3]:mb-3 [&>h3]:mt-5
                    [&>p]:mb-4 [&>p]:leading-8 [&>p]:text-gray-700
                    [&>ul]:mb-4 [&>ul]:mr-6 [&>ul]:list-disc
                    [&>ol]:mb-4 [&>ol]:mr-6 [&>ol]:list-decimal
                    [&>li]:mb-2 [&>li]:text-gray-700
                    [&>blockquote]:border-r-4 [&>blockquote]:border-[#1a472a] [&>blockquote]:pr-4 [&>blockquote]:py-2 [&>blockquote]:my-4 [&>blockquote]:bg-gray-50 [&>blockquote]:italic [&>blockquote]:text-gray-600
                    [&>a]:text-[#5c6d3f] [&>a]:underline [&>a]:hover:text-[#1a472a] [&>a]:transition-colors
                    [&>code]:bg-gray-100 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>code]:text-sm [&>code]:text-gray-800
                    [&>pre]:bg-gray-900 [&>pre]:text-gray-100 [&>pre]:p-4 [&>pre]:rounded-md [&>pre]:overflow-x-auto [&>pre]:my-4
                    [&>img]:rounded-md [&>img]:shadow-sm [&>img]:my-6
                    text-right"
                  dir="rtl"
                  dangerouslySetInnerHTML={{ __html: post.content }} 
                />

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <a
                        key={index}
                        href={`/tag/${tag}`}
                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm hover:bg-gray-200"
                      >
                        {tag}
                      </a>
                    ))}
                  </div>
                </div>

                
              </div>
            </div>

      {/* <div className="mt-8 flex flex-row gap-8 justify-aorund w-full"> */}
        
        
        <NoteCard>
          <p>
            
          citationInfo  
            </p>  
        </NoteCard>
        {/* <RowSection>
                <SectionTitle>
                  מקורות
                </SectionTitle>
                <div className="flex flex-col gap-8 w-full flex-grow">
                  {post.sources.map((source) => (
                    <article className='border-b border-b-1 border-gray-200 pb-2' key={source.id}>
                      <h3 className='text-md font-["Secular_One"] text-gray-800'>{source.title}</h3>
                      <small className='text-gray-500 text-xs'>עדכון אחרון: {source.year} | {source.author}</small>
                    </article>
                  ))}
                </div>
                
          < SeeMoreButton>כל המקורות</SeeMoreButton>
</RowSection> */}
            </div>
            {/* Sources */}
            
          {/* </div> */}

          {/* Sidebar */}
          <Section className="bg-gray-400">
          <PostSideBar post={post} />
          </Section>
        </div>
      </main>

      {/* Footer */}
    </div>
  )
}
