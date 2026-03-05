import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Breadcrumb from '../common/Breadcrumb';
import Loader from '../common/Loader';
import { api } from '../utils/axios';
import { FiFolder, FiSend, FiCalendar, FiSearch, FiFilter, FiFileText, FiClock, FiCheckCircle } from 'react-icons/fi';

function formatDate(d) {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Workspace status label and style */
function workspaceStatusBadge(status) {
  const s = (status || 'active').toLowerCase();
  if (s === 'active') return { label: 'Active', className: 'bg-success/15 text-success border-success/30' };
  if (s === 'archived') return { label: 'Archived', className: 'bg-base-300 text-base-content/70 border-base-300' };
  return { label: 'Draft', className: 'bg-warning/15 text-warning border-warning/30' };
}

/** Portfolio submission status label and style */
function portfolioStatusBadge(submissionStatus) {
  const s = submissionStatus || 'draft';
  const map = {
    draft: { label: 'Draft', className: 'bg-base-300 text-base-content/70 border-base-300' },
    submitted: { label: 'In Review', className: 'bg-warning/15 text-warning border-warning/30' },
    need_revision: { label: 'Need Revision', className: 'bg-error/15 text-error border-error/30' },
    approved: { label: 'Approved', className: 'bg-success/15 text-success border-success/30' },
    published: { label: 'Published', className: 'bg-success/20 text-success border-success/40' },
    taken_down: { label: 'Taken down', className: 'bg-base-300 text-base-content/60 border-base-300' },
  };
  return map[s] || map.draft;
}

export default function StudentWorkspacePage() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [courseFilter, setCourseFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  useEffect(() => {
    api.get('/api/student/workspaces')
      .then(({ data }) => setWorkspaces(data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load workspaces'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, courseFilter, semesterFilter]);

  const courseOptions = useMemo(
    () => Array.from(new Set((workspaces || []).map((w) => w.course).filter(Boolean))),
    [workspaces]
  );
  const semesterOptions = useMemo(
    () => Array.from(new Set((workspaces || []).map((w) => w.semester).filter(Boolean))),
    [workspaces]
  );

  const filtered = useMemo(() => {
    let list = [...workspaces];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((w) =>
        [w.name, w.course, w.classBatch, w.semester]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }
    if (courseFilter) {
      list = list.filter((w) => w.course === courseFilter);
    }
    if (semesterFilter) {
      list = list.filter((w) => w.semester === semesterFilter);
    }
    list.sort((a, b) => {
      if (sortBy === 'name-asc' || sortBy === 'name-desc') {
        const va = (a.name || '').toLowerCase();
        const vb = (b.name || '').toLowerCase();
        const cmp = va.localeCompare(vb);
        return sortBy === 'name-asc' ? cmp : -cmp;
      }
      if (sortBy === 'course-asc' || sortBy === 'course-desc') {
        const va = (a.course || '').toLowerCase();
        const vb = (b.course || '').toLowerCase();
        const cmp = va.localeCompare(vb);
        return sortBy === 'course-asc' ? cmp : -cmp;
      }
      return 0;
    });
    return list;
  }, [workspaces, search, sortBy, courseFilter, semesterFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage, PAGE_SIZE]
  );

  /** Summary counts: all cards across workspaces by portfolio status */
  const summaryCounts = useMemo(() => {
    let draft = 0, inReview = 0, approvedPublished = 0;
    workspaces.forEach((ws) => {
      (ws.cards || []).forEach((card) => {
        const st = card.submissionStatus || 'draft';
        if (st === 'draft') draft += 1;
        else if (st === 'submitted' || st === 'need_revision') inReview += 1;
        else if (st === 'approved' || st === 'published') approvedPublished += 1;
      });
    });
    return { draft, inReview, approvedPublished };
  }, [workspaces]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-6 flex justify-center items-center min-h-[60vh]">
          <Loader text="Loading workspaces..." />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <Breadcrumb items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'My Workspace' }]} />
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-[#172b4d] flex items-center gap-2">
            <FiFolder className="w-7 h-7 text-[#3B613A]" />
            My Workspace
          </h1>
          <p className="text-sm text-[#5e6c84] mt-1">
            Workspaces and project cards assigned to you. Click <strong>Submit portfolio</strong> on a card to create or edit your submission. You can edit or delete until your lecturer reviews it.
          </p>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-error/10 text-error text-sm">{error}</div>
        )}

        {!error && workspaces.length > 0 && (summaryCounts.draft + summaryCounts.inReview + summaryCounts.approvedPublished > 0) && (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-base-200 bg-base-100 p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-base-200 flex items-center justify-center">
                <FiFileText className="w-5 h-5 text-[#5e6c84]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#172b4d]">{summaryCounts.draft}</p>
                <p className="text-xs text-[#5e6c84]">In Progress / Draft</p>
              </div>
            </div>
            <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                <FiClock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#172b4d]">{summaryCounts.inReview}</p>
                <p className="text-xs text-[#5e6c84]">In Review</p>
              </div>
            </div>
            <div className="rounded-xl border border-success/30 bg-success/5 p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                <FiCheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#172b4d]">{summaryCounts.approvedPublished}</p>
                <p className="text-xs text-[#5e6c84]">Approved / Published</p>
              </div>
            </div>
          </div>
        )}

        {!error && workspaces.length === 0 && (
          <div className="mt-8 p-8 rounded-2xl border-2 border-dashed border-base-300 bg-base-100/50 text-center">
            <FiFolder className="w-12 h-12 text-[#5e6c84] mx-auto mb-3" />
            <p className="text-[#172b4d] font-medium">No workspaces yet</p>
            <p className="text-sm text-[#5e6c84] mt-1">When a lecturer adds you to a workspace, it will appear here. You will also get a notification.</p>
          </div>
        )}

        {!error && workspaces.length > 0 && (
          <>
            <div className="mt-5 flex flex-col md:flex-row md:items-end gap-3">
              <div className="flex-1 min-w-[200px]">
                <label className="label py-0 mb-1">
                  <span className="label-text text-sm font-medium text-[#172b4d]">Search</span>
                </label>
                <div className="relative">
                  <FiSearch className="w-4 h-4 text-[#5e6c84] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    className="input input-bordered w-full pl-9 rounded-xl"
                    placeholder="Search by workspace, course, class, semester..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="min-w-[160px]">
                  <label className="label py-0 mb-1 flex items-center gap-1">
                    <FiFilter className="w-4 h-4 text-[#5e6c84]" />
                    <span className="label-text text-sm font-medium text-[#172b4d]">Course</span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full rounded-xl"
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                  >
                    <option value="">All</option>
                    {courseOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="min-w-[150px]">
                  <label className="label py-0 mb-1">
                    <span className="label-text text-sm font-medium text-[#172b4d]">Semester</span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full rounded-xl"
                    value={semesterFilter}
                    onChange={(e) => setSemesterFilter(e.target.value)}
                  >
                    <option value="">All</option>
                    {semesterOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="min-w-[150px]">
                  <label className="label py-0 mb-1">
                    <span className="label-text text-sm font-medium text-[#172b4d]">Sort by</span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full rounded-xl"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="name-asc">Name A–Z</option>
                    <option value="name-desc">Name Z–A</option>
                    <option value="course-asc">Course A–Z</option>
                    <option value="course-desc">Course Z–A</option>
                  </select>
                </div>
              </div>
            </div>

            {paged.length === 0 ? (
              <div className="mt-8 p-6 rounded-2xl border border-base-200 bg-base-100 text-center text-sm text-[#5e6c84]">
                No workspaces match your filters.
              </div>
            ) : (
              <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {paged.map((ws) => (
                  <section
                    key={ws.id}
                    className="bg-base-100 rounded-2xl border border-base-200/70 shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="px-4 sm:px-5 py-3 border-b border-base-200/60 bg-gradient-to-r from-[#3B613A]/8 via-base-100 to-[#3B613A]/5 relative">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h2 className="font-semibold text-sm sm:text-base text-[#172b4d] line-clamp-2">{ws.name}</h2>
                          <p className="text-[11px] text-[#5e6c84] mt-0.5 line-clamp-1">
                            {ws.course} · {ws.classBatch} · {ws.semester}
                          </p>
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-medium border ${workspaceStatusBadge(ws.status).className}`}>
                          {workspaceStatusBadge(ws.status).label}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 p-4 space-y-2">
                      {(!ws.cards || ws.cards.length === 0) ? (
                        <p className="text-xs text-[#5e6c84]">No project cards in this workspace yet.</p>
                      ) : (
                        ws.cards.slice(0, 3).map((card) => {
                          const pStatus = portfolioStatusBadge(card.submissionStatus);
                          return (
                            <div
                              key={card.id}
                              className="rounded-xl border border-base-200/60 bg-base-200/30 px-3 py-2.5 text-xs flex flex-col gap-1.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-medium text-[#172b4d] line-clamp-1 flex-1 min-w-0">{card.name}</p>
                                <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium border ${pStatus.className}`}>
                                  {pStatus.label}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#5e6c84]">
                                <span className="px-2 py-0.5 rounded-full bg-[#3B613A]/10 text-[#3B613A] font-medium">
                                  {card.isGroupCard ? 'Group' : 'Individual'}
                                </span>
                                {card.dueDate && (
                                  <span className="flex items-center gap-0.5">
                                    <FiCalendar className="w-3 h-3" />
                                    Due {formatDate(card.dueDate)}
                                  </span>
                                )}
                                {card.submittedAt && (
                                  <span className="text-[10px] opacity-80">
                                    Submitted {formatDate(card.submittedAt)}
                                  </span>
                                )}
                              </div>
                              <Link
                                to={`/student/submit?workspaceId=${ws.id}&cardId=${card.id}`}
                                className="mt-0.5 inline-flex items-center justify-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg bg-[#3B613A] text-white hover:bg-[#4a7549] transition-colors font-medium"
                              >
                                <FiSend className="w-3 h-3" />
                                Submit or edit portfolio
                              </Link>
                            </div>
                          );
                        })
                      )}
                    </div>
                    {ws.cards && ws.cards.length > 3 && (
                      <div className="px-4 pb-3 text-[11px] text-[#5e6c84]">
                        + {ws.cards.length - 3} more card(s)
                      </div>
                    )}
                  </section>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <div className="join">
                  <button
                    type="button"
                    className="join-item btn btn-xs"
                    disabled={currentPage === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    «
                  </button>
                  <button type="button" className="join-item btn btn-xs btn-ghost">
                    Page {currentPage} / {totalPages}
                  </button>
                  <button
                    type="button"
                    className="join-item btn btn-xs"
                    disabled={currentPage === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
