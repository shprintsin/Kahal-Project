import React from 'react';
import { BookOpen, Download } from 'lucide-react';
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
    <section className="py-8 sm:py-16">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-between h-full">
        <Section>
          <SectionTitle>נתונים</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 w-full flex-grow">
            {posts.map((post) => (
              <SiteCard key={post.id}>
                <SiteCardHeader className='flex items-center gap-2'>{post.title}</SiteCardHeader>
                <SiteCardContent>{post.excerpt}</SiteCardContent>
                <SiteCardFooter>
                  <span>עדכון אחרון: {post.date}</span>
                  <span className='text-brand-primary text-base'><Download /></span>
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
                  icon={<BookOpen className="mt-1 text-sm" />}
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
