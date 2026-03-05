import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Loader from '../common/Loader';
import Skeleton from '../common/Skeleton';
import { api } from '../utils/axios';
import { FiSearch, FiSliders, FiCheckCircle } from 'react-icons/fi';

const API_BASE = import.meta.env.VITE_API_URL || '';
const PAGE_SIZE = 12;

function portfolioThumbnailUrl(id, filename) {
  if (!id || !filename) return null;
  const base = API_BASE.replace(/\/$/, '');
  return `${base}/api/uploads/portfolios/${id}/${filename}`;
}

function avatarUrl(avatar) {
  if (!avatar) return null;
  const base = API_BASE.replace(/\/$/, '');
  return `${base}/api/uploads/avatars/${avatar}`;
}

export default function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const programFromUrl = searchParams.get('program') ?? '';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');
  const [showFilters, setShowFilters] = useState(!!programFromUrl);
  const [filters, setFilters] = useState({
    program: (programFromUrl || searchParams.get('program')) ?? '',
    classBatch: searchParams.get('classBatch') ?? '',
    semester: searchParams.get('semester') ?? '',
  });

  const fetchPortfolios = useCallback(async (opts = {}) => {
    const page = opts.page ?? pagination.page;
    const q = opts.q !== undefined ? opts.q : search;
    const program = opts.program !== undefined ? opts.program : filters.program;
    const classBatch = opts.classBatch !== undefined ? opts.classBatch : filters.classBatch;
    const semester = opts.semester !== undefined ? opts.semester : filters.semester;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(PAGE_SIZE));
      if (String(q).trim()) params.set('q', String(q).trim());
      if (program) params.set('program', program);
      if (classBatch) params.set('classBatch', classBatch);
      if (semester) params.set('semester', semester);
      const { data: res } = await api.get(`/api/portfolios?${params.toString()}`);
      setData(res.data || []);
      setPagination(res.pagination || { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load portfolios.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, search, filters.program, filters.classBatch, filters.semester]);

  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    const program = searchParams.get('program') ?? '';
    const classBatch = searchParams.get('classBatch') ?? '';
    const semester = searchParams.get('semester') ?? '';
    setSearch(q);
    setFilters((f) => ({ ...f, program: program || f.program, classBatch: classBatch || f.classBatch, semester: semester || f.semester }));
    setSearchInput(q);
    fetchPortfolios({ page: 1, q, program, classBatch, semester });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (programFromUrl) {
      setFilters((prev) => ({ ...prev, program: programFromUrl }));
      setShowFilters(true);
    }
  }, [programFromUrl]);

  const handleApplyFilters = () => {
    const q = searchInput.trim();
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (q) next.set('q', q);
      else next.delete('q');
      if (filters.program) next.set('program', filters.program);
      else next.delete('program');
      if (filters.classBatch) next.set('classBatch', filters.classBatch);
      else next.delete('classBatch');
      if (filters.semester) next.set('semester', filters.semester);
      else next.delete('semester');
      return next;
    });
    setSearch(q);
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchPortfolios({ page: 1, q, program: filters.program, classBatch: filters.classBatch, semester: filters.semester });
  };

  const handlePageChange = (nextPage) => {
    setPagination((prev) => ({ ...prev, page: nextPage }));
    fetchPortfolios({ page: nextPage });
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#303030] tracking-tight">Discover Portfolios</h1>
          <p className="mt-2 text-[#303030]/60 max-w-2xl leading-relaxed">
            Verified student portfolios from Binus University International. Each project has been reviewed and approved by the course lecturer.
          </p>
        </div>

        <div className="bg-base-100 rounded-2xl border border-base-200/80 shadow-sm mb-8 overflow-hidden">
          <div className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#303030]/40" />
                <input
                  type="text"
                  placeholder="Search by project name, category..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                  className="input input-bordered w-full pl-10 rounded-xl h-11 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={`flex items-center gap-2 h-11 px-4 rounded-xl border text-sm font-medium transition-colors flex-shrink-0 ${showFilters ? 'bg-[#3B613A]/8 border-[#3B613A]/20 text-[#3B613A]' : 'border-base-300 text-[#303030]/70 hover:bg-base-200'}`}
                  onClick={() => setShowFilters((s) => !s)}
                >
                  <FiSliders className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary h-11 px-4 rounded-xl text-sm"
                  onClick={handleApplyFilters}
                >
                  Apply
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-base-200/60">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="label py-0 text-xs text-[#5e6c84]">Program</label>
                    <input
                      type="text"
                      placeholder="All Programs"
                      value={filters.program}
                      onChange={(e) => setFilters((f) => ({ ...f, program: e.target.value }))}
                      className="input input-bordered input-sm w-full rounded-lg h-10 text-sm"
                    />
                  </div>
                  <div>
                    <label className="label py-0 text-xs text-[#5e6c84]">Class / Batch</label>
                    <input
                      type="text"
                      placeholder="All Batches"
                      value={filters.classBatch}
                      onChange={(e) => setFilters((f) => ({ ...f, classBatch: e.target.value }))}
                      className="input input-bordered input-sm w-full rounded-lg h-10 text-sm"
                    />
                  </div>
                  <div>
                    <label className="label py-0 text-xs text-[#5e6c84]">Semester</label>
                    <input
                      type="text"
                      placeholder="All Semesters"
                      value={filters.semester}
                      onChange={(e) => setFilters((f) => ({ ...f, semester: e.target.value }))}
                      className="input input-bordered input-sm w-full rounded-lg h-10 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-error/10 text-error text-sm">{error}</div>
        )}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-base-100 border border-base-200/80">
            <FiSearch className="w-12 h-12 text-[#303030]/20 mx-auto mb-4" />
            <p className="text-[#303030]/50 font-medium">No portfolios to display yet</p>
            <p className="text-sm text-[#303030]/40 mt-1">Verified portfolios will appear here once published.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-[#5e6c84] mb-4">
              Showing {data.length} of {pagination.total} results
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="group bg-base-100 rounded-2xl border border-base-200/80 shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:border-[#3B613A]/20 transition-all duration-200"
                >
                  <div className="relative aspect-video bg-base-200 overflow-hidden">
                    {p.thumbnail ? (
                      <img
                        src={portfolioThumbnailUrl(p.id, p.thumbnail)}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-base-300">
                        <span className="text-4xl font-light text-[#5e6c84]/50">Project</span>
                      </div>
                    )}
                    <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/90 text-white text-[10px] font-medium">
                      <FiCheckCircle className="w-3 h-3" /> Verified
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-[#172b4d] line-clamp-2 group-hover:text-[#3B613A] transition-colors">
                      {p.projectName || 'Untitled project'}
                    </h3>
                    {p.category && (
                      <p className="text-xs text-[#5e6c84] mt-0.5">{p.category}</p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#3B613A]/20 flex items-center justify-center text-[#3B613A] text-xs font-semibold shrink-0">
                        {p.student?.avatarUrl ? (
                          <img
                            src={avatarUrl(p.student.avatarUrl)}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          (p.student?.name || 'S').charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="text-xs text-[#5e6c84] truncate">{p.student?.name || 'Student'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </button>
                <span className="flex items-center px-4 text-sm text-[#5e6c84]">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
