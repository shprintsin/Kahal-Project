import { CitationInfo } from '@/app/types';
import React, { useState } from 'react'
import { FaCopy } from 'react-icons/fa';
import { Section } from '../ui/Components';

export default function CitationSection({citationInfo}: {citationInfo: CitationInfo}) {
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
    <div>
      
      <Section>
<div className="relative bg-gray-50 p-6 border border-gray-200 w-full h-[80px]">
            <p className='w-10/12 text-gray-800 border-none overflow-hidden leading-relaxed'>{citationInfo.citationText}</p>
            <button 
              onClick={handleCopyCitation}
              className="absolute top-4 left-4 bg-emerald-900 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-emerald-950 transition-colors"
              title="העתק ציטוט"
            >
              <FaCopy className="text-base" />
              {copySuccess ? 'הועתק!' : 'העתק'}
            </button>
          </div>

</Section>
    </div>
  )
}
