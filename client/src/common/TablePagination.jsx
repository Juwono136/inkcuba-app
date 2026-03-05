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
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-base-100/80 border border-base-200/60 text-sm ${className}`}
    >
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <label className="text-[#5e6c84] font-medium" htmlFor="pagination-rows">
          Rows per page
        </label>
        <select
          id="pagination-rows"
          className="select select-bordered select-sm h-9 min-h-9 rounded-lg border-base-300 bg-base-100 text-sm focus:border-[#3B613A]/50 focus:outline-none w-20"
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
        <span className="text-[#5e6c84] text-xs sm:text-sm">
          {total > 0 ? `${from}–${to} of ${total}` : '0 of 0'}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-[#5e6c84] text-xs sm:text-sm whitespace-nowrap">
          Page {page} of {totalPages}
        </span>
        <div className="join border border-base-200 rounded-lg overflow-hidden">
          <button
            type="button"
            className="join-item btn btn-ghost btn-sm h-9 min-w-9 rounded-none border-0 border-r border-base-200"
            onClick={() => canPrev && onPageChange(page - 1)}
            disabled={!canPrev}
            aria-label="Previous page"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="join-item btn btn-ghost btn-sm h-9 min-w-9 rounded-none border-0"
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
