import { CitationInfo } from '@/app/types';
import React from 'react'
import { Section } from '@/components/ui/sections';
import { CitationBox } from '@/components/ui/citation-box';

export default function CitationSection({citationInfo}: {citationInfo: CitationInfo}) {
    return (
    <div>
      <Section>
        <CitationBox text={citationInfo.citationText} />
      </Section>
    </div>
  )
}
