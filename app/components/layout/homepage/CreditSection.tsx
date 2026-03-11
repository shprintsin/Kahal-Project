'use client';

import React from 'react';
import { CreditSectionProps } from '@/app/types';
import { SectionTitle } from '@/components/ui/typography';
import { SiteCard, SiteCardHeader, SiteCardContent, SiteCardFooter } from '@/components/ui/site-card';
import { Section } from '@/components/ui/sections';
import { CitationBox } from '@/components/ui/citation-box';

export default function CreditSection({ authors, citationInfo }: CreditSectionProps) {
  return (
    <div className="flex flex-col gap-5 w-full">
      <SectionTitle>צוות המחקר</SectionTitle>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 flex-wrap">
        {authors.map((author, index) => (
          <SiteCard className="w-full sm:w-auto sm:flex-1" key={index}>
            <SiteCardHeader>{author.name}</SiteCardHeader>
            <SiteCardContent>{author.role}</SiteCardContent>
            <SiteCardFooter>{author.affiliation}</SiteCardFooter>
          </SiteCard>
        ))}
      </div>

      <Section className="w-full">
        <CitationBox text={citationInfo.citationText} />
      </Section>
    </div>
  );
}
