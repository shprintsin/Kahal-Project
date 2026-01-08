'use client';

import React, { useState } from 'react';
import { CreditSectionProps } from '@/app/types';
import { FaCopy } from 'react-icons/fa';
import { SectionTitle, Card, CardHeader, CardContent, CardFooter, Section } from '../ui/Components';
import { Row } from '../../StyledComponent';

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
    <>
    <div className='flex w-12/12 gap-5 flex-col'>
      <SectionTitle>צוות המחקר</SectionTitle>
      
      <Row className=' gap-8 justify-between flex'>
      {authors.map((author, index) => (
              <Card className='w-4/12' key={index}>
                <CardHeader>{author.name}</CardHeader>
                <CardContent>{author.role}</CardContent>
                <CardFooter>{author.affiliation}</CardFooter>
              </Card>
              
            ))}
      

      <Section className='w-full'>
<div className="relative bg-gray-50 p-6 border border-gray-200 w-full h-[80px]">
            <textarea
              rows={1}
              className="w-10/12 text-gray-800 border-none overflow-hidden leading-relaxed resize-none bg-transparent"
              defaultValue={citationInfo.citationText}
              readOnly
            />
            <button 
              onClick={handleCopyCitation}
              className="absolute text top-4 left-4 bg-emerald-900 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-emerald-950 transition-colors"
              title="העתק ציטוט"
            >
              <FaCopy className="text-base" />
              {copySuccess ? 'הועתק!' : 'העתק'}
            </button>
          </div>

</Section>
      </Row>
      
      
      
    </div>



    </>

  );
} 

