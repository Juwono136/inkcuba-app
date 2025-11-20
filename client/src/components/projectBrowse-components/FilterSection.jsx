export default function FilterSection({ filters, onFilterChange, onApply, onReset }) {
  return (
    <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Batch Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Batch
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={filters.batch}
            onChange={(e) => onFilterChange("batch", e.target.value)}
          >
            <option value="">All Batches</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>

        {/* Program Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Program
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={filters.program}
            onChange={(e) => onFilterChange("program", e.target.value)}
          >
            <option value="">All Programs</option>
            <option value="CSC">Computer Science</option>
            <option value="BIS">Business Information System</option>
            <option value="GDNM">Graphic Design and New Media</option>
            <option value="SE">Software Engineering</option>
          </select>
        </div>

        {/* Course Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={filters.course}
            onChange={(e) => onFilterChange("course", e.target.value)}
          >
            <option value="">All Courses</option>
            {/* CSC Courses */}
            <optgroup label="Computer Science (CSC)">
              <option value="Web Application Development and Security">Web Application Development and Security</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Game Development and Programming">Game Development and Programming</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
            </optgroup>
            {/* BIS Courses */}
            <optgroup label="Business Information Systems (BIS)">
              <option value="Enterprise Systems">Enterprise Systems</option>
              <option value="Business Analytics">Business Analytics</option>
              <option value="Customer Relationship Management">Customer Relationship Management</option>
              <option value="Digital Business Strategy">Digital Business Strategy</option>
              <option value="Supply Chain Management">Supply Chain Management</option>
            </optgroup>
            {/* GDNM Courses */}
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
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onApply}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
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
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span>Apply Filters</span>
        </button>
        <button
          onClick={onReset}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
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
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}
