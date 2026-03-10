'use client';

import React, { useState } from 'react';
import { CreditSectionProps } from '@/app/types';
import { FaCopy } from 'react-icons/fa';
import { SectionTitle, Card, CardHeader, CardContent, CardFooter, Section } from '../ui/Components';

export default function CreditSection({ authors, citationInfo }: CreditSectionProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyCitation = async () => {
    try {
      await navigator.clipboard.writeText(citationInfo.citationText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy citation:', err);
    }
  };

  return (
    <div className='flex w-full gap-5 flex-col'>
      <SectionTitle>צוות המחקר</SectionTitle>

      <div className='flex flex-col sm:flex-row gap-4 md:gap-8 justify-between flex-wrap'>
        {authors.map((author, index) => (
          <Card className='w-full sm:w-auto sm:flex-1' key={index}>
            <CardHeader>{author.name}</CardHeader>
            <CardContent>{author.role}</CardContent>
            <CardFooter>{author.affiliation}</CardFooter>
          </Card>
        ))}

        <Section className='w-full'>
          <div className="relative bg-gray-50 p-4 md:p-6 border border-gray-200 w-full min-h-[80px]">
            <textarea
              rows={1}
              className="w-full sm:w-10/12 text-gray-800 border-none overflow-hidden leading-relaxed resize-none bg-transparent text-sm md:text-base"
              defaultValue={citationInfo.citationText}
              readOnly
            />
            <button
              onClick={handleCopyCitation}
              className="mt-2 sm:mt-0 sm:absolute sm:top-4 sm:left-4 bg-emerald-900 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-emerald-950 transition-colors text-sm"
              title="העתק ציטוט"
            >
              <FaCopy className="text-base" />
              {copySuccess ? 'הועתק!' : 'העתק'}
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}
