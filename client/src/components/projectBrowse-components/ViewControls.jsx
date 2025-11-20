export default function ViewControls({ 
  viewMode, 
  onViewModeChange, 
  itemsPerPage, 
  onItemsPerPageChange,
  totalProjects,
  startIndex,
  endIndex
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <p className="text-sm text-gray-600">
        Showing {totalProjects > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, totalProjects)}{" "}
        of {totalProjects} projects
      </p>
      
      <div className="flex items-center gap-4">
        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">View:</span>
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-2 rounded border ${
              viewMode === "grid"
                ? "bg-black text-white border-black"
                : "border-gray-300 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <rect x="3" y="3" width="7" height="7" strokeWidth="2" />
              <rect x="14" y="3" width="7" height="7" strokeWidth="2" />
              <rect x="3" y="14" width="7" height="7" strokeWidth="2" />
              <rect x="14" y="14" width="7" height="7" strokeWidth="2" />
            </svg>
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-2 rounded border ${
              viewMode === "list"
                ? "bg-black text-white border-black"
                : "border-gray-300 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <line x1="4" y1="6" x2="20" y2="6" strokeWidth="2" />
              <line x1="4" y1="12" x2="20" y2="12" strokeWidth="2" />
              <line x1="4" y1="18" x2="20" y2="18" strokeWidth="2" />
            </svg>
          </button>
        </div>

        {/* Items per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Items per page:</span>
          <select 
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          >
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
        </div>
      </div>
    </div>
  );
}
