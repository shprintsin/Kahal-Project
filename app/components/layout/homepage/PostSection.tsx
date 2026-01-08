import React from 'react';
import { FaArrowLeft, FaBook, FaDatabase, FaDownload } from 'react-icons/fa';

import { Card, CardContent, CardFooter, CardHeader, Section, SectionTitle, SeeMoreButton } from '../ui/Components';

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
        {/* Posts Section */}
        <Section>
          <SectionTitle>
            נתונים
          </SectionTitle>
          <div className="grid grid-cols-2 gap-8 w-full flex-grow">
            {posts.map((post) => (
              <Card key={post.id} >
                <CardHeader className='flex items-center gap-2'> {post.title} </CardHeader>
                <CardContent>{post.excerpt}</CardContent>
                <CardFooter>
                  <span>עדכון אחרון: {post.date}</span>
                  <span className='text-emerald-900 text-base'><FaDownload /></span>

                  {/* <span>{post.author}</span> */}
                </CardFooter>
              </Card>
            ))}
          </div>
          <SeeMoreButton>כל המאמרים</SeeMoreButton>
        </Section>

        {/* End Posts Section */}
        {/* Sources Section */}
        <Section>
          <SectionTitle>מקורות</SectionTitle>
          <ul className="space-y-4 flex-grow">
            {sources.map((source) => (
              <li key={source.id}>
                <a
                  href={source.url}
                  className="flex flex-row gap-2 hover:bg-gray-50 p-2 "
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaBook className="mt-1 text-sm" />
                  <div className="flex flex-col">
                    <h3 className="text-base secular text-blue-800">{source.title}</h3>
                  </div>
                </a>
              </li>
            ))}
          </ul>
          <SeeMoreButton>כל המקורות</SeeMoreButton>

        </Section>
      </div>
    </section>
  );
} 
