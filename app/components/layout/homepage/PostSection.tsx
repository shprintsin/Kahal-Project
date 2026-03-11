import React from 'react';
import { FaBook, FaDownload } from 'react-icons/fa';
import { SiteCard, SiteCardContent, SiteCardFooter, SiteCardHeader } from '@/components/ui/site-card';
import { Section } from '@/components/ui/sections';
import { SectionTitle } from '@/components/ui/typography';
import { SeeMoreButton } from '@/components/ui/nav-links';
import { SourceLink } from '@/components/ui/update-article';

interface Post {
  id: string | number;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  imageUrl: string;
}

interface Source {
  id: string | number;
  title: string;
  url: string;
}

interface PostSectionProps {
  posts: Post[];
  sources: Source[];
}

export default function PostSection({ posts, sources }: PostSectionProps) {
  return (
    <section className="py-16">
      <div className="flex gap-8 justify-between h-full">
        <Section>
          <SectionTitle>נתונים</SectionTitle>
          <div className="grid grid-cols-2 gap-8 w-full flex-grow">
            {posts.map((post) => (
              <SiteCard key={post.id}>
                <SiteCardHeader className='flex items-center gap-2'>{post.title}</SiteCardHeader>
                <SiteCardContent>{post.excerpt}</SiteCardContent>
                <SiteCardFooter>
                  <span>עדכון אחרון: {post.date}</span>
                  <span className='text-emerald-900 text-base'><FaDownload /></span>
                </SiteCardFooter>
              </SiteCard>
            ))}
          </div>
          <SeeMoreButton>כל המאמרים</SeeMoreButton>
        </Section>

        <Section>
          <SectionTitle>מקורות</SectionTitle>
          <ul className="space-y-4 flex-grow">
            {sources.map((source) => (
              <li key={source.id}>
                <SourceLink
                  href={source.url}
                  title={source.title}
                  icon={<FaBook className="mt-1 text-sm" />}
                />
              </li>
            ))}
          </ul>
          <SeeMoreButton>כל המקורות</SeeMoreButton>
        </Section>
      </div>
    </section>
  );
}
