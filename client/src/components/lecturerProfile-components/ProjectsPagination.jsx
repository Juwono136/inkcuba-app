export default function ProjectsPagination({
  currentPage,
  totalPages,
  indexOfFirstProject,
  indexOfLastProject,
  totalProjects,
  onPageChange
}) {
  // Show if there are any projects
  if (totalProjects === 0) return null;

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Left side - Showing info */}
      <p className="text-sm text-gray-600">
        Showing {indexOfFirstProject + 1} to {Math.min(indexOfLastProject, totalProjects)} of {totalProjects} approved projects
      </p>
      
      {/* Center/Right - Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => onPageChange(index + 1)}
              className={`px-4 py-2 rounded-lg border ${
                currentPage === index + 1
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}