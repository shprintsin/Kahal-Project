'use client'

import { useState } from 'react'
import { Copy as FaCopy } from 'lucide-react'
import { CopyButton } from '@/components/ui/action-button'

interface CitationBoxProps {
  text: string
  className?: string
}

export function CitationBox({ text, className }: CitationBoxProps) {
  const [copySuccess, setCopySuccess] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy citation:', err)
    }
  }

  return (
    <div className={`relative bg-surface-light p-6 border border-border w-full h-[80px] ${className || ''}`}>
      <textarea
        rows={1}
        className="w-10/12 text-foreground border-none overflow-hidden leading-relaxed resize-none bg-transparent"
        defaultValue={text}
        readOnly
      />
      <CopyButton onClick={handleCopy} className="absolute top-4 left-4">
        <FaCopy className="text-base" />
        {copySuccess ? 'הועתק!' : 'העתק'}
      </CopyButton>
    </div>
  )
}
