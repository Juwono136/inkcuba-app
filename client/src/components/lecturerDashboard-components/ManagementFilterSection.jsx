export default function ManagementFilterSection({ 
  searchQuery, 
  onSearchChange, 
  filters, 
  onFilterChange, 
  onReset 
}) {
  return (
    <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Filter Projects</h2>
        <button
          onClick={onReset}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Reset Filters
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Projects
        </label>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by project name, student..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Batch/Program */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Batch Program
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            value={filters.batch}
            onChange={(e) => onFilterChange("batch", e.target.value)}
          >
            <option value="">All Batches</option>
            <option value="B25">B25</option>
            <option value="B24">B24</option>
            <option value="B23">B23</option>
          </select>
        </div>

        {/* Course */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            value={filters.course}
            onChange={(e) => onFilterChange("course", e.target.value)}
          >
            <option value="">All Courses</option>
            <optgroup label="Computer Science (CSC)">
              <option value="Web Application Development and Security">Web Application Development and Security</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Game Development and Programming">Game Development and Programming</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
            </optgroup>
            <optgroup label="Business Information Systems (BIS)">
              <option value="Enterprise Systems">Enterprise Systems</option>
              <option value="Business Analytics">Business Analytics</option>
              <option value="Customer Relationship Management">Customer Relationship Management</option>
              <option value="Digital Business Strategy">Digital Business Strategy</option>
              <option value="Supply Chain Management">Supply Chain Management</option>
            </optgroup>
            <optgroup label="Graphic Design and New Media (GDNM)">
              <option value="Brand Identity Design">Brand Identity Design</option>
              <option value="Interactive Media Design">Interactive Media Design</option>
              <option value="Motion Graphics and Animation">Motion Graphics and Animation</option>
              <option value="User Experience Design">User Experience Design</option>
              <option value="Typography and Layout Design">Typography and Layout Design</option>
              <option value="3D Modeling and Visualization">3D Modeling and Visualization</option>
              <option value="Visual Communication Design">Visual Communication Design</option>
            </optgroup>
          </select>
        </div>

        {/* Program */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Program
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            value={filters.program}
            onChange={(e) => onFilterChange("program", e.target.value)}
          >
            <option value="">All Program</option>
            <option value="CSC">Computer Science</option>
            <option value="BIS">Business Information System</option>
            <option value="GDNM">Graphic Design and New Media</option>
            <option value="SE">Software Engineering</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort by
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            value={filters.sortBy}
            onChange={(e) => onFilterChange("sortBy", e.target.value)}
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Project Type Filter */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Type
        </label>
        <select
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
          value={filters.projectType}
          onChange={(e) => onFilterChange("projectType", e.target.value)}
        >
          <option value="">All Types</option>
          <option value="individual">Individual</option>
          <option value="group">Group</option>
        </select>
      </div>
    </div>
  );
}