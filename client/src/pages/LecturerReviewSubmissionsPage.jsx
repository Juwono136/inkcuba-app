import { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/layout/Navbar';
import Breadcrumb from '../common/Breadcrumb';
import Loader from '../common/Loader';
import ConfirmModal from '../common/ConfirmModal';
import { api } from '../utils/axios';
import toast from 'react-hot-toast';
import { FiSend, FiCheck, FiEye, FiUpload, FiTrash2, FiImage, FiFileText, FiLink, FiSearch, FiFilter, FiFile, FiClock, FiCheckCircle } from 'react-icons/fi';

const PAGE_SIZE = 10;

const API_BASE = import.meta.env.VITE_API_URL || '';
function portfolioFileUrl(submissionId, key) {
  if (!key || typeof key !== 'string') return '';
  const filename = key.split('/').pop();
  return `${API_BASE}/api/uploads/portfolios/${submissionId}/${filename}`;
}

function getVideoEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const u = url.trim();
  const ytMatch = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return u;
}

export default function LecturerReviewSubmissionsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, pendingReview: 0, approvedThisWeek: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const [takeDownConfirmOpen, setTakeDownConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [reviewForm, setReviewForm] = useState({ approved: true, feedback: '', assessment: '' });
  const [takeDownReason, setTakeDownReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSummary = useCallback(() => {
    api.get('/api/lecturer/submissions/summary')
      .then(({ data }) => setSummary({ total: data.total ?? 0, pendingReview: data.pendingReview ?? 0, approvedThisWeek: data.approvedThisWeek ?? 0 }))
      .catch(() => setSummary({ total: 0, pendingReview: 0, approvedThisWeek: 0 }));
  }, []);

  const fetchList = useCallback((page = 1) => {
    setLoading(true);
    const params = { page, limit: PAGE_SIZE };
    if (search.trim()) params.q = search.trim();
    if (statusFilter) params.status = statusFilter;
    api.get('/api/lecturer/submissions', { params })
      .then(({ data }) => {
        setList(data.data || []);
        setPagination(data.pagination || { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
      })
      .catch(() => {
        setList([]);
        setPagination({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
      })
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchList(1);
  }, [search, statusFilter]);

  const handleSearchApply = () => fetchList(1);
  const handlePageChange = (nextPage) => fetchList(nextPage);

  const refetchAll = useCallback(() => {
    fetchSummary();
    fetchList(pagination.page);
  }, [fetchSummary, fetchList, pagination.page]);

  const openDetail = (id) => {
    setSelectedId(id);
    setDetail(null);
    setDetailLoading(true);
    setReviewModalOpen(true);
    api.get(`/api/lecturer/submissions/${id}`)
      .then(({ data }) => setDetail(data.submission))
      .catch(() => {
        toast.error('Failed to load submission');
        setReviewModalOpen(false);
      })
      .finally(() => setDetailLoading(false));
    setReviewForm({ approved: true, feedback: '', assessment: '' });
  };

  const handleReview = async () => {
    if (!selectedId) return;
    setActionLoading(true);
    try {
      await api.patch(`/api/lecturer/submissions/${selectedId}/review`, reviewForm);
      toast.success(reviewForm.approved ? 'Submission approved' : 'Revision requested');
      setReviewModalOpen(false);
      setSelectedId(null);
      refetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save review');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedId) return;
    setActionLoading(true);
    try {
      await api.patch(`/api/lecturer/submissions/${selectedId}/publish`);
      toast.success('Portfolio published');
      setPublishConfirmOpen(false);
      setReviewModalOpen(false);
      setSelectedId(null);
      refetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTakeDown = async () => {
    if (!selectedId) return;
    setActionLoading(true);
    try {
      await api.patch(`/api/lecturer/submissions/${selectedId}/take-down`, { reason: takeDownReason });
      toast.success('Portfolio taken down');
      setTakeDownConfirmOpen(false);
      setTakeDownReason('');
      setReviewModalOpen(false);
      setSelectedId(null);
      refetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to take down');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <Breadcrumb items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'My Workspaces', to: '/lecturer/workspaces' }, { label: 'Review Submissions' }]} />
        <h1 className="text-2xl font-bold text-[#172b4d] mt-4 flex items-center gap-2">
          <FiSend className="w-7 h-7 text-[#3B613A]" />
          Review Dashboard
        </h1>
        <p className="text-sm text-[#5e6c84] mt-1">Review student portfolios and approve or request revisions. Approved items can be published to the home page.</p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-base-200 bg-base-100 p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-[#3B613A]/10 flex items-center justify-center">
              <FiFile className="w-5 h-5 text-[#3B613A]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#172b4d]">{summary.total}</p>
              <p className="text-xs text-[#5e6c84]">Total Submissions</p>
            </div>
          </div>
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <FiClock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#172b4d]">{summary.pendingReview}</p>
              <p className="text-xs text-[#5e6c84]">Pending Review</p>
            </div>
          </div>
          <div className="rounded-xl border border-success/30 bg-success/5 p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#172b4d]">{summary.approvedThisWeek}</p>
              <p className="text-xs text-[#5e6c84]">Approved This Week</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5e6c84]" />
            <input
              type="text"
              placeholder="Search by project name, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchApply()}
              className="input input-bordered w-full pl-9 rounded-xl h-10 text-sm"
            />
          </div>
          <select
            className="select select-bordered rounded-xl h-10 min-w-[140px] text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="submitted">Submitted</option>
            <option value="need_revision">Need Revision</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <button type="button" className="btn btn-primary rounded-xl h-10 gap-2" onClick={handleSearchApply}>
            <FiFilter className="w-4 h-4" /> Apply
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader text="Loading submissions..." /></div>
        ) : list.length === 0 ? (
          <div className="mt-8 p-8 rounded-2xl border-2 border-dashed border-base-300 bg-base-100 text-center">
            <FiSend className="w-12 h-12 text-[#5e6c84] mx-auto mb-3" />
            <p className="text-[#172b4d] font-medium">No submissions yet</p>
            <p className="text-sm text-[#5e6c84] mt-1">When students submit portfolios from your workspace cards, they will appear here.</p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Student</th>
                  <th>Workspace / Card</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s.id}>
                    <td className="font-medium">{s.projectName || '—'}</td>
                    <td>{s.student?.name || s.studentId}</td>
                    <td className="text-sm">{s.workspace?.name} / {s.card?.name}</td>
                    <td>
                      <span className={`badge badge-sm ${s.status === 'submitted' || s.status === 'need_revision' ? 'badge-warning' : s.status === 'approved' ? 'badge-info' : s.status === 'published' ? 'badge-success' : 'badge-ghost'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="text-sm text-[#5e6c84]">{s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '—'}</td>
                    <td>
                      <button type="button" className="btn btn-primary btn-sm gap-1" onClick={() => openDetail(s.id)}>
                        <FiEye className="w-4 h-4" /> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pagination.totalPages > 1 && (
              <div className="flex justify-between items-center px-2 py-3 border-t border-base-200">
                <p className="text-sm text-[#5e6c84]">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </p>
                <div className="join">
                  <button type="button" className="join-item btn btn-sm" disabled={pagination.page <= 1} onClick={() => handlePageChange(pagination.page - 1)}>«</button>
                  <button type="button" className="join-item btn btn-sm btn-ghost no-animation">Page {pagination.page} / {pagination.totalPages}</button>
                  <button type="button" className="join-item btn btn-sm" disabled={pagination.page >= pagination.totalPages} onClick={() => handlePageChange(pagination.page + 1)}>»</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Review modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setReviewModalOpen(false)} />
          <div className="relative bg-base-100 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex-shrink-0 px-4 py-3 border-b flex justify-between items-center">
              <h2 className="font-semibold text-[#172b4d]">Submission detail</h2>
              <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={() => setReviewModalOpen(false)}>×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {detailLoading ? (
                <Loader text="Loading..." />
              ) : detail ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-[#172b4d]">{detail.projectName || '—'}</p>
                    <span className="badge badge-sm">{detail.status}</span>
                  </div>
                  <p className="text-sm text-[#5e6c84]">Student: {detail.student?.name} ({detail.student?.email})</p>
                  {detail.category && <p className="text-sm text-[#5e6c84]">Category: {detail.category}</p>}
                  {detail.description && <div className="rounded-lg bg-base-200/50 p-3"><p className="text-sm text-[#172b4d] whitespace-pre-wrap">{detail.description}</p></div>}

                  {((detail.screenshots && detail.screenshots.length > 0) || detail.projectPoster || detail.detailedReport) && (
                    <div>
                      <p className="text-sm font-medium text-[#172b4d] mb-2 flex items-center gap-1"><FiImage className="w-4 h-4" /> Media</p>
                      <div className="flex flex-wrap gap-2">
                        {detail.screenshots?.filter(Boolean).map((key, i) => (
                          <a key={i} href={portfolioFileUrl(detail.id, key)} target="_blank" rel="noopener noreferrer" className="w-16 h-16 rounded-lg overflow-hidden border border-base-200 flex-shrink-0">
                            <img src={portfolioFileUrl(detail.id, key)} alt="" className="w-full h-full object-cover" />
                          </a>
                        ))}
                        {detail.projectPoster && (
                          <a href={portfolioFileUrl(detail.id, detail.projectPoster)} target="_blank" rel="noopener noreferrer" className="w-16 h-16 rounded-lg overflow-hidden border border-[#3B613A]/30 flex-shrink-0">
                            <img src={portfolioFileUrl(detail.id, detail.projectPoster)} alt="Poster" className="w-full h-full object-cover" />
                          </a>
                        )}
                        {detail.detailedReport && (
                          <a href={portfolioFileUrl(detail.id, detail.detailedReport)} target="_blank" rel="noopener noreferrer" className="w-16 h-16 rounded-lg border border-base-200 bg-base-200 flex items-center justify-center flex-shrink-0">
                            <FiFileText className="w-8 h-8 text-[#5e6c84]" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {detail.videoUrl && (
                    <div>
                      <p className="text-sm font-medium text-[#172b4d] mb-1 flex items-center gap-1"><FiLink className="w-4 h-4" /> Video</p>
                      {getVideoEmbedUrl(detail.videoUrl) && getVideoEmbedUrl(detail.videoUrl).includes('embed') ? (
                        <iframe title="Video" src={getVideoEmbedUrl(detail.videoUrl)} className="w-full aspect-video rounded-xl border border-base-200" allowFullScreen />
                      ) : (
                        <a href={detail.videoUrl} target="_blank" rel="noopener noreferrer" className="text-[#3B613A] underline text-sm">{detail.videoUrl}</a>
                      )}
                    </div>
                  )}

                  {detail.externalLinks?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-[#172b4d] mb-1 flex items-center gap-1"><FiLink className="w-4 h-4" /> External links</p>
                      <ul className="space-y-0.5">
                        {detail.externalLinks.map((l, i) => (l.url ? <li key={i}><a href={l.url} target="_blank" rel="noopener noreferrer" className="text-[#3B613A] text-sm hover:underline">{l.title || l.url}</a></li> : null))}
                      </ul>
                    </div>
                  )}
                  {(detail.status === 'submitted' || detail.status === 'need_revision') && (
                    <div className="border-t pt-4 space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={reviewForm.approved} onChange={() => setReviewForm((f) => ({ ...f, approved: true }))} />
                        Approve
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={!reviewForm.approved} onChange={() => setReviewForm((f) => ({ ...f, approved: false }))} />
                        Request revision
                      </label>
                      <textarea className="textarea textarea-bordered w-full rounded-xl" placeholder="Feedback (required for revision)" value={reviewForm.feedback} onChange={(e) => setReviewForm((f) => ({ ...f, feedback: e.target.value }))} rows={3} />
                      <input type="text" className="input input-bordered w-full rounded-xl" placeholder="Assessment (optional)" value={reviewForm.assessment} onChange={(e) => setReviewForm((f) => ({ ...f, assessment: e.target.value }))} />
                      <button type="button" className="btn btn-sm bg-[#3B613A] text-white border-0" onClick={handleReview} disabled={actionLoading || (!reviewForm.approved && !reviewForm.feedback.trim())}>
                        {actionLoading ? <span className="loading loading-spinner loading-sm" /> : <FiCheck className="w-4 h-4" />} Save review
                      </button>
                    </div>
                  )}
                  {detail.status === 'approved' && (
                    <button type="button" className="btn btn-sm bg-[#3B613A] text-white border-0 gap-1" onClick={() => setPublishConfirmOpen(true)} disabled={actionLoading}>
                      <FiUpload className="w-4 h-4" /> Publish to home page
                    </button>
                  )}
                  {detail.status === 'published' && (
                    <button type="button" className="btn btn-sm btn-outline btn-error gap-1" onClick={() => setTakeDownConfirmOpen(true)} disabled={actionLoading}>
                      <FiTrash2 className="w-4 h-4" /> Take down
                    </button>
                  )}
                </>
              ) : (
                <p className="text-[#5e6c84]">Could not load submission.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal open={publishConfirmOpen} onClose={() => setPublishConfirmOpen(false)} onConfirm={handlePublish} title="Publish portfolio" message="Publish this portfolio to the home page? The student will be notified." confirmLabel="Publish" cancelLabel="Cancel" variant="primary" loading={actionLoading} />
      <ConfirmModal open={takeDownConfirmOpen} onClose={() => setTakeDownConfirmOpen(false)} onConfirm={handleTakeDown} title="Take down portfolio" message="Remove this portfolio from the home page? Optionally provide a reason (the student will be notified)." confirmLabel="Take down" cancelLabel="Cancel" variant="danger" loading={actionLoading}>
        <textarea className="textarea textarea-bordered w-full mt-2 rounded-xl" placeholder="Reason for takedown (optional)" value={takeDownReason} onChange={(e) => setTakeDownReason(e.target.value)} rows={2} />
      </ConfirmModal>
    </div>
  );
}
