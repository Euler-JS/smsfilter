import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useUiStore } from '../../store/uiStore'
import { t } from '../../i18n'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const lang = useUiStore((s) => s.language)
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-end gap-3 pt-4">
      <span className="text-sm text-text-muted">
        {t(lang, 'page')} {page} {t(lang, 'of')} {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="rounded-lg p-2 text-text-muted hover:bg-surface-2 hover:text-text disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="rounded-lg p-2 text-text-muted hover:bg-surface-2 hover:text-text disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
