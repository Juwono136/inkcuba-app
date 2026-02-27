import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function TablePagination({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  pageSizeOptions = [10, 20, 50],
  className = '',
}) {
  const totalPages = Math.max(Math.ceil(total / limit) || 1, 1);
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const from = total > 0 ? (page - 1) * limit + 1 : 0;
  const to = Math.min(page * limit, total);

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-[#303030]/70 ${className}`}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[#303030]/60">Rows per page</span>
        <select
          className="select select-bordered select-sm h-9 min-h-9 rounded-xl border-base-300 bg-base-100 text-sm focus:border-[#3B613A]/50 focus:outline-none"
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          aria-label="Rows per page"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="text-[#303030]/60 hidden sm:inline">
          {total > 0 ? `${from}–${to} of ${total}` : '0 of 0'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[#303030]/60">
          Page {page} of {totalPages}
        </span>
        <div className="join">
          <button
            type="button"
            className="join-item btn btn-ghost btn-sm h-9 w-9 rounded-l-xl"
            onClick={() => canPrev && onPageChange(page - 1)}
            disabled={!canPrev}
            aria-label="Previous page"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="join-item btn btn-ghost btn-sm h-9 w-9 rounded-r-xl"
            onClick={() => canNext && onPageChange(page + 1)}
            disabled={!canNext}
            aria-label="Next page"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
