import { Button } from "@/app/components/ui/button"

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pageNumbers: number[] = []
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i)
  }
  return (
    <div className="flex gap-2 rtl-dir">
      {currentPage > 1 && (
        <Button
          variant="outline"
          className="border-[#5c6d3f] text-[#5c6d3f] hover:bg-[#5c6d3f] hover:text-white"
          onClick={() => onPageChange(currentPage - 1)}
        >
          הקודם
        </Button>
      )}
      {pageNumbers.map((number) => (
        <Button
          key={number}
          variant={currentPage === number ? "default" : "outline"}
          className={
            currentPage === number
              ? "bg-[#5c6d3f] text-white hover:bg-[var(--dark-green)]"
              : "border-[#5c6d3f] text-[#5c6d3f] hover:bg-[#5c6d3f] hover:text-white"
          }
          onClick={() => onPageChange(number)}
        >
          {number}
        </Button>
      ))}
      {currentPage < totalPages && (
        <Button
          variant="outline"
          className="border-[#5c6d3f] text-[#5c6d3f] hover:bg-[#5c6d3f] hover:text-white"
          onClick={() => onPageChange(currentPage + 1)}
        >
          הבא
        </Button>
      )}
    </div>
  )
}

