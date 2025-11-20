import { useState } from 'react';
import ReviewProjectCard from './ReviewProjectCard';
import ApprovedProjectCard from './ApprovedProjectCard';

export default function ProjectColumn({ 
  title, 
  count, 
  projects, 
  type, // 'approved', 'awaiting', or 'revision'
  onAction,
  loading 
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Changed from 3 to 4

  // Determine empty state message based on type
  const getEmptyMessage = () => {
    switch(type) {
      case 'awaiting':
        return 'No projects awaiting review at the moment.';
      case 'revision':
        return 'No projects need revision.';
      case 'approved':
      default:
        return 'No approved projects yet.';
    }
  };

  // Pagination
  const totalPages = Math.ceil(projects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = projects.slice(startIndex, endIndex);

  // Reset to page 1 when projects change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Column Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {title}
          <span className="ml-2 text-sm font-normal text-gray-500">
            {count} Projects
          </span>
        </h2>
      </div>

      {/* Extended Box - No scrolling, increased height */}
      <div className="border border-gray-300 rounded-lg bg-white flex flex-col h-[900px]">
        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-4 text-gray-600 text-sm">Loading projects...</p>
            </div>
          </div>
        ) : projects.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full px-4">
            <svg
              className="h-16 w-16 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-4 text-sm font-medium text-gray-900">No projects</h3>
            <p className="mt-1 text-sm text-gray-500">
              {getEmptyMessage()}
            </p>
          </div>
        ) : (
          <>
            {/* Project Cards - No scrolling, all 4 cards visible */}
            <div className="p-6 space-y-6 flex-1 flex flex-col justify-start">
              {currentProjects.map((project) => (
                type === 'approved' || type === 'revision' ? (
                  <ApprovedProjectCard
                    key={project._id || project.id}
                    project={project}
                    onView={() => onAction(project)}
                  />
                ) : (
                  <ReviewProjectCard
                    key={project._id || project.id}
                    project={project}
                    onReview={() => onAction(project)}
                  />
                )
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200 px-4 py-4 flex items-center justify-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-4 py-2 text-sm rounded ${
                      currentPage === index + 1
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
          </>
        )}
      </div>
    </div>
  );
}