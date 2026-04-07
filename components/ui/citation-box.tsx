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
    <div className={cn("bg-white shadow-sm p-5 sm:p-6 lg:p-8 flex items-start gap-3", className)}>
      <p className="text-sm text-foreground leading-relaxed flex-1" dir="auto">{text}</p>
      <button
        onClick={handleCopy}
        className="flex-shrink-0 flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-brand-primary transition-colors"
        aria-label="Copy citation"
        title={text}
      >
        {copySuccess ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  )
}
