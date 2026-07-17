import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

interface PaginationProps {
  page: number
  totalPages: number
  totalItems?: number
  pageSize?: number
  pageSizeOptions?: number[]
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  showFirst?: boolean
  firstLabel?: string
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  showFirst = false,
  firstLabel = "最新",
}: PaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1)
  const start = totalItems && pageSize ? (page - 1) * pageSize + 1 : 0
  const end = totalItems && pageSize ? Math.min(page * pageSize, totalItems) : 0

  return (
    <div data-ui-slot="pagination" className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {typeof totalItems === "number" && <span>共 {totalItems} 条</span>}
        {typeof totalItems === "number" && pageSize && <span className="text-muted-foreground/50">|</span>}
        {pageSize && pageSizeOptions && onPageSizeChange && (
          <div className="flex items-center gap-1">
            <span>每页</span>
            <Select value={String(pageSize)} onValueChange={v => onPageSizeChange(Number(v))}>
              <SelectTrigger className="h-7 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map(option => (
                  <SelectItem key={option} value={String(option)}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>条</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-end gap-2">
        {totalItems && pageSize ? (
          <span className="text-xs text-muted-foreground">
            {totalItems > 0 ? `${start}-${end}` : "0-0"}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">第 {page} 页 / 共 {safeTotalPages} 页</span>
        )}
        <div className="flex items-center gap-1">
          {showFirst && page > 1 && (
            <Button variant="outline" size="xs" onClick={() => onPageChange(1)}>
              {firstLabel}
            </Button>
          )}
          <Button variant="outline" size="xs" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft className="h-3.5 w-3.5" />
            {!pageSizeOptions && "上一页"}
          </Button>
          <span className="min-w-[4rem] text-center text-xs text-muted-foreground">
            {page} / {safeTotalPages}
          </span>
          <Button variant="outline" size="xs" disabled={page >= safeTotalPages} onClick={() => onPageChange(page + 1)}>
            {!pageSizeOptions && "下一页"}
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
