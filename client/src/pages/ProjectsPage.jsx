import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Skeleton from '../common/Skeleton';
import { FiSearch, FiSliders, FiImage, FiFileText, FiLink, FiCode } from 'react-icons/fi';

export default function ProjectsPage() {
  const [loading] = useState(false);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    studentName: '',
    class: '',
    semester: '',
    program: '',
    course: '',
    lecturerName: '',
  });

  const filterFields = [
    { key: 'studentName', placeholder: 'Student name' },
    { key: 'class', placeholder: 'Class' },
    { key: 'semester', placeholder: 'Semester' },
    { key: 'program', placeholder: 'Program' },
    { key: 'course', placeholder: 'Course' },
    { key: 'lecturerName', placeholder: 'Lecturer name' },
  ];

  const contentTypes = [
    { icon: FiImage, label: 'Images (up to 5)' },
    { icon: FiFileText, label: 'PDF Report' },
    { icon: FiLink, label: 'URL / Link' },
    { icon: FiCode, label: 'Code Repository' },
  ];

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#303030] tracking-tight">Projects</h1>
          <p className="mt-2 text-[#303030]/60 max-w-2xl leading-relaxed">
            Verified student portfolios from Binus University International. Each project has been reviewed and approved by the course lecturer.
          </p>
        </div>

        {/* Search + filter */}
        <div className="bg-base-100 rounded-2xl border border-base-200/80 shadow-sm mb-8 overflow-hidden">
          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#303030]/40" />
                <input
                  type="text"
                  placeholder="Search by student name, project title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input input-bordered w-full pl-10 rounded-xl h-11 text-sm"
                />
              </div>
              <button
                type="button"
                className={`flex items-center gap-2 h-11 px-4 rounded-xl border text-sm font-medium transition-colors flex-shrink-0 ${showFilters ? 'bg-[#3B613A]/8 border-[#3B613A]/20 text-[#3B613A]' : 'border-base-300 text-[#303030]/70 hover:bg-base-200'}`}
                onClick={() => setShowFilters((s) => !s)}
              >
                <FiSliders className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-base-200/60">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filterFields.map(({ key, placeholder }) => (
                    <input
                      key={key}
                      type="text"
                      placeholder={placeholder}
                      value={filters[key]}
                      onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.value }))}
                      className="input input-bordered input-sm rounded-lg h-10 text-sm"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="px-4 sm:px-5 py-3 bg-base-200/30 border-t border-base-200/60">
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#303030]/50">
              <span>Each portfolio may include:</span>
              {contentTypes.map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1">
                  <Icon className="w-3.5 h-3.5" /> {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Project list */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl bg-base-100 border border-base-200/80">
            <FiImage className="w-12 h-12 text-[#303030]/20 mx-auto mb-4" />
            <p className="text-[#303030]/50 font-medium">No projects to display yet</p>
            <p className="text-sm text-[#303030]/40 mt-1">Verified portfolios will appear here.</p>
          </div>
        )}
      </main>
    </div>
  );
}
