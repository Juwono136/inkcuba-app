import React from 'react';

const ActivityFilter = ({
  roleFilter,
  setRoleFilter,
  dateFilter,
  setDateFilter
}) => {
  return (
    <div className="flex items-center gap-3">
      {/* Role Filter Dropdown */}
      <div className="relative">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="appearance-none px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 bg-white cursor-pointer min-w-[130px] text-sm font-medium"
        >
          <option value="All Roles">All Roles</option>
          <option value="Student">Student</option>
          <option value="Lecturer">Lecturer</option>
          <option value="Admin">Admin</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Date Range Filter Dropdown */}
      <div className="relative">
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="appearance-none px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 bg-white cursor-pointer min-w-[140px] text-sm font-medium"
        >
          <option value="Last 7 days">Last 7 days</option>
          <option value="Last 30 days">Last 30 days</option>
          <option value="Last 90 days">Last 90 days</option>
          <option value="All time">All time</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ActivityFilter;
