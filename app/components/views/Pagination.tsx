"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useLocale } from "next-intl"
import { isRtl, isValidLocale, defaultLocale } from "@/lib/i18n/config"

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const locale = useLocale()
  const rtl = isRtl(isValidLocale(locale) ? locale : defaultLocale)
  const PrevIcon = rtl ? ChevronRight : ChevronLeft
  const NextIcon = rtl ? ChevronLeft : ChevronRight
  const pageNumbers: number[] = []
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i)
  }
  return (
    <div className="flex items-center gap-1.5">
      {currentPage > 1 && (
        <button
          className="w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-brand-primary hover:bg-brand-primary-light transition-colors"
          onClick={() => onPageChange(currentPage - 1)}
        >
          <PrevIcon className="w-4 h-4" />
        </button>
      )}
      {pageNumbers.map((number) => (
        <button
          key={number}
          className={
            currentPage === number
              ? "w-9 h-9 flex items-center justify-center rounded-md text-sm font-semibold bg-brand-primary text-white"
              : "w-9 h-9 flex items-center justify-center rounded-md text-sm font-medium text-muted-foreground hover:text-brand-primary hover:bg-brand-primary-light transition-colors"
          }
          onClick={() => onPageChange(number)}
        >
          {number}
        </button>
      ))}
      {currentPage < totalPages && (
        <button
          className="w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-brand-primary hover:bg-brand-primary-light transition-colors"
          onClick={() => onPageChange(currentPage + 1)}
        >
          <NextIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
