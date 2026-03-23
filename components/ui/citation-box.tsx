'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CitationBoxProps {
  text: string
  className?: string
  variant?: 'inline' | 'default'
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
    <div className={cn("flex items-center justify-end", className)}>
      <button
        onClick={handleCopy}
        className="group relative flex items-center justify-center w-10 h-10 rounded-md bg-brand-primary-light text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
        title={text}
        aria-label="Copy citation"
      >
        {copySuccess ? <Check size={18} /> : <Copy size={18} />}
        <span className="absolute bottom-full mb-2 end-0 px-2 py-1 text-xs bg-foreground text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {copySuccess ? '✓' : 'Copy citation'}
        </span>
      </button>
    </div>
  )
}
