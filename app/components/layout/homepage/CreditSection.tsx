'use client';

import React from 'react';
import { CreditSectionProps } from '@/app/types';
import { SectionTitle } from '@/components/ui/typography';
import { SiteCard, SiteCardHeader, SiteCardContent, SiteCardFooter } from '@/components/ui/site-card';
import { Section } from '@/components/ui/sections';
import { Row } from '@/components/ui/flex';
import { CitationBox } from '@/components/ui/citation-box';

export default function CreditSection({ authors, citationInfo }: CreditSectionProps) {
  return (
    <>
      <div className='flex w-12/12 gap-5 flex-col'>
        <SectionTitle>צוות המחקר</SectionTitle>

        <Row className='gap-8 justify-between flex'>
          {authors.map((author, index) => (
            <SiteCard className='w-4/12' key={index}>
              <SiteCardHeader>{author.name}</SiteCardHeader>
              <SiteCardContent>{author.role}</SiteCardContent>
              <SiteCardFooter>{author.affiliation}</SiteCardFooter>
            </SiteCard>
          ))}

          <Section className='w-full'>
            <CitationBox text={citationInfo.citationText} />
          </Section>
        </Row>
      </div>
    </>
  );
}
