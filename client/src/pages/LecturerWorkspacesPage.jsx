import { useEffect, useMemo, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiGrid,
  FiList,
  FiUpload,
  FiUsers,
  FiBook,
  FiX,
} from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import Breadcrumb from '../common/Breadcrumb';
import Loader from '../common/Loader';
import SearchInput from '../common/SearchInput';
import TablePagination from '../common/TablePagination';
import ConfirmModal from '../common/ConfirmModal';
import {
  fetchWorkspaces,
  deleteWorkspace,
  setQuery,
} from '../features/lecturer/workspaceSlice';

const statusOptions = [
  { value: 'all', label: 'All status' },
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

const sortConfig = [
  { value: 'createdAt_desc', label: 'Newest first' },
  { value: 'createdAt_asc', label: 'Oldest first' },
  { value: 'name_asc', label: 'Name A–Z' },
  { value: 'name_desc', label: 'Name Z–A' },
  { value: 'status_asc', label: 'Status A–Z' },
];

const selectClass =
  'select select-bordered select-sm h-11 min-h-11 rounded-xl border-base-300 bg-base-100 text-sm focus:border-[#3B613A]/50 focus:outline-none transition-colors w-full';

export default function LecturerWorkspacesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    items,
    page,
    limit,
    total,
    search,
    status,
    sortBy,
    sortOrder,
    loading,
    actionLoading,
    currentWorkspace,
  } = useSelector((state) => state.lecturerWorkspaces);

  const [localSearch, setLocalSearch] = useState(search);
  const [viewMode, setViewMode] = useState('board');
  const [confirmDelete, setConfirmDelete] = useState({ open: false, workspace: null });
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const queryParams = useMemo(
    () => ({ page, limit, search, status, sortBy, sortOrder }),
    [page, limit, search, status, sortBy, sortOrder]
  );

  useEffect(() => {
    dispatch(
      fetchWorkspaces({
        page,
        limit,
        search: status === 'all' ? search : search || undefined,
        status: status === 'all' ? undefined : status,
        sortBy,
        sortOrder,
      })
    );
  }, [dispatch, page, limit, search, status, sortBy, sortOrder]);

  useEffect(() => {
    const t = setTimeout(() => {
      dispatch(setQuery({ search: localSearch, page: 1 }));
    }, 400);
    return () => clearTimeout(t);
  }, [localSearch, dispatch]);

  const currentSortValue = useMemo(() => `${sortBy}_${sortOrder}`, [sortBy, sortOrder]);

  const openDetail = (ws) => {
    navigate(`/lecturer/workspaces/${ws.id}`);
  };

  const handleDeleteWorkspace = async () => {
    if (!confirmDelete.workspace) return;
    if (deleteConfirmText.trim() !== (confirmDelete.workspace.name || '').trim()) return;
    try {
      await dispatch(deleteWorkspace(confirmDelete.workspace.id)).unwrap();
      toast.success('Workspace deleted');
      setConfirmDelete({ open: false, workspace: null });
      setDeleteConfirmText('');
    } catch (err) {
      toast.error(err || 'Failed to delete workspace');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2E5]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8">
        <Breadcrumb
          items={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'Workspaces' },
          ]}
        />

        {/* Trello-style header: compact row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-5 md:mb-6">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-[#172b4d] tracking-tight truncate">
              Workspaces
            </h1>
            <p className="text-sm text-[#5e6c84] mt-0.5 hidden sm:block max-w-xl">
              Course workspaces for portfolio submission and verification. Approved work appears on the public site.
            </p>
          </div>
          <Link
            to="/lecturer/workspaces/create"
            className="btn gap-2 bg-[#3B613A] hover:bg-[#4a7549] border-0 text-white rounded-lg h-10 sm:h-11 px-4 sm:px-5 font-semibold shadow-sm flex-shrink-0"
          >
            <FiPlus className="w-4 h-4" />
            <span className="hidden min-[400px]:inline">Create workspace</span>
            <span className="min-[400px]:hidden">New workspace</span>
          </Link>
        </div>

        {/* Toolbar: single compact row, responsive */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4">
          <div className="flex-1 min-w-[140px] max-w-full sm:max-w-xs">
            <SearchInput
              id="ws-search"
              label=""
              value={localSearch}
              onChange={setLocalSearch}
              placeholder="Search workspaces..."
              className="mb-0"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <select
              className="select select-bordered select-sm h-9 min-h-9 rounded-lg border-base-300 bg-base-100 text-sm w-auto min-w-[100px]"
              value={status}
              onChange={(e) => dispatch(setQuery({ status: e.target.value, page: 1 }))}
              aria-label="Filter by status"
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <select
              className="select select-bordered select-sm h-9 min-h-9 rounded-lg border-base-300 bg-base-100 text-sm w-auto min-w-[120px]"
              value={currentSortValue}
              onChange={(e) => {
                const [field, order] = e.target.value.split('_');
                dispatch(setQuery({ sortBy: field, sortOrder: order, page: 1 }));
              }}
              aria-label="Sort"
            >
              {sortConfig.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="flex rounded-lg border border-base-300 overflow-hidden bg-base-100">
              <button
                type="button"
                className={`p-2.5 transition-colors ${viewMode === 'table' ? 'bg-[#3B613A] text-white' : 'text-[#5e6c84] hover:bg-base-200'}`}
                onClick={() => setViewMode('table')}
                aria-label="Table view"
                title="Table view"
              >
                <FiList className="w-4 h-4" />
              </button>
              <button
                type="button"
                className={`p-2.5 transition-colors ${viewMode === 'board' ? 'bg-[#3B613A] text-white' : 'text-[#5e6c84] hover:bg-base-200'}`}
                onClick={() => setViewMode('board')}
                aria-label="Grid view"
                title="Grid view"
              >
                <FiGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="relative min-h-[220px]">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#F0F2E5]/90 rounded-xl">
              <Loader size="lg" text="Loading..." />
            </div>
          )}
          {!loading && items.length === 0 ? (
            <div className="bg-base-100 rounded-xl border border-base-200/60 shadow-sm py-14 sm:py-20 px-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#3B613A]/10 flex items-center justify-center mb-4">
                <FiGrid className="w-8 h-8 text-[#3B613A]" />
              </div>
              <h2 className="text-lg font-semibold text-[#172b4d] mb-1">No workspaces yet</h2>
              <p className="text-sm text-[#5e6c84] max-w-sm mx-auto mb-6">
                Create your first workspace to manage a course or class. Add students and project cards, then verify portfolios for the public site.
              </p>
              <Link
                to="/lecturer/workspaces/create"
                className="btn bg-[#3B613A] hover:bg-[#4a7549] text-white rounded-lg gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Create workspace
              </Link>
            </div>
          ) : viewMode === 'board' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {items.map((ws) => (
                <div
                  key={ws.id}
                  className="group bg-base-100 rounded-xl border border-base-200/70 shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-[#3B613A]/40 flex flex-col min-h-[140px]"
                >
                  <button
                    type="button"
                    className="flex-1 flex flex-col text-left w-full min-h-[120px]"
                    onClick={() => openDetail(ws)}
                  >
                    <div className="h-12 sm:h-14 w-full bg-gradient-to-br from-[#3B613A] to-[#4a7549] flex-shrink-0" />
                    <div className="p-3 sm:p-4 flex-1">
                      <h3 className="font-semibold text-[#172b4d] text-base line-clamp-2 mb-2">
                        {ws.name}
                      </h3>
                      {(ws.course || ws.classBatch || ws.semester) && (
                        <p className="text-xs text-[#5e6c84] truncate mb-2">
                          {[ws.course, ws.classBatch, ws.semester].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-[#5e6c84]">
                          <span className="flex items-center gap-1">
                            <FiUsers className="w-3.5 h-3.5" />
                            {ws.studentCount ?? 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiBook className="w-3.5 h-3.5" />
                            {ws.cardCount ?? 0}
                          </span>
                        </div>
                        <span
                          className={`badge badge-sm capitalize border-0 ${
                            ws.status === 'active'
                              ? 'badge-success'
                              : ws.status === 'archived'
                              ? 'badge-ghost'
                              : 'badge-warning'
                          }`}
                        >
                          {ws.status}
                        </span>
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center justify-end gap-0.5 px-2 py-2 border-t border-base-200/60 bg-base-100/80 opacity-0 group-hover:opacity-100 transition-opacity sm:opacity-100">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-square text-[#5e6c84] hover:bg-base-200 hover:text-[#172b4d]"
                      onClick={(e) => { e.stopPropagation(); navigate(`/lecturer/workspaces/${ws.id}`); }}
                      aria-label="Edit workspace"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-square text-[#5e6c84] hover:bg-error/10 hover:text-error"
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete({ open: true, workspace: ws }); }}
                      aria-label="Delete workspace"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
              <div className="overflow-x-auto">
                <table className="table table-auto w-full">
                  <thead>
                    <tr className="bg-base-200/50 border-b border-base-200">
                      <th className="w-10 text-center text-xs font-semibold uppercase tracking-wider text-[#303030]/70 py-4 whitespace-nowrap">
                        No
                      </th>
                      <th className="text-xs font-semibold uppercase tracking-wider text-[#303030]/70 py-4 whitespace-nowrap">
                        Name
                      </th>
                      <th className="hidden md:table-cell text-xs font-semibold uppercase tracking-wider text-[#303030]/70 py-4">
                        Course
                      </th>
                      <th className="hidden lg:table-cell text-xs font-semibold uppercase tracking-wider text-[#303030]/70 py-4">
                        Class / Batch
                      </th>
                      <th className="hidden lg:table-cell text-xs font-semibold uppercase tracking-wider text-[#303030]/70 py-4">
                        Semester
                      </th>
                      <th className="text-xs font-semibold uppercase tracking-wider text-[#303030]/70 py-4 whitespace-nowrap">
                        Status
                      </th>
                      <th className="text-xs font-semibold uppercase tracking-wider text-[#303030]/70 py-4 whitespace-nowrap">
                        Students
                      </th>
                      <th className="text-xs font-semibold uppercase tracking-wider text-[#303030]/70 py-4 whitespace-nowrap">
                        Cards
                      </th>
                      <th className="text-right text-xs font-semibold uppercase tracking-wider text-[#303030]/70 py-4 whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((ws, index) => (
                      <tr
                        key={ws.id}
                        className="border-b border-base-200/60 hover:bg-base-200/30 transition-colors"
                      >
                        <td className="py-4 px-3 text-center align-middle text-xs text-[#303030]/70">
                          {(page - 1) * limit + index + 1}
                        </td>
                        <td className="py-4 align-middle">
                          <span className="font-medium text-[#303030]">{ws.name}</span>
                        </td>
                        <td className="hidden md:table-cell py-4 text-sm text-[#303030]/70">
                          {ws.course || '—'}
                        </td>
                        <td className="hidden lg:table-cell py-4 text-sm text-[#303030]/70">
                          {ws.classBatch || '—'}
                        </td>
                        <td className="hidden lg:table-cell py-4 text-sm text-[#303030]/70">
                          {ws.semester || '—'}
                        </td>
                        <td className="py-4 align-middle">
                          <span
                            className={`badge badge-sm font-medium capitalize ${
                              ws.status === 'active'
                                ? 'badge-success text-success-content'
                                : ws.status === 'archived'
                                ? 'badge-ghost text-[#303030]/60'
                                : 'badge-warning text-warning-content'
                            }`}
                          >
                            {ws.status}
                          </span>
                        </td>
                        <td className="py-4 align-middle text-sm text-[#303030]/80">
                          {ws.studentCount ?? 0}
                        </td>
                        <td className="py-4 align-middle text-sm text-[#303030]/80">
                          {ws.cardCount ?? 0}
                        </td>
                        <td className="py-4 text-right align-middle">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs sm:btn-sm btn-circle text-[#3B613A] hover:bg-[#3B613A]/10"
                              onClick={() => openDetail(ws)}
                              aria-label="Open workspace"
                              title="Open workspace"
                            >
                              <FiGrid className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs sm:btn-sm btn-circle text-[#303030]/70 hover:bg-base-200"
                              onClick={() => navigate(`/lecturer/workspaces/${ws.id}`)}
                              aria-label="Edit workspace"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs sm:btn-sm btn-circle text-error hover:bg-error/10"
                              onClick={() => setConfirmDelete({ open: true, workspace: ws })}
                              aria-label="Delete workspace"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {total > 0 && (
            <div className="px-4 sm:px-5 py-4 border-t border-base-200/60 bg-base-100">
              <TablePagination
                page={page}
                limit={limit}
                total={total}
                onPageChange={(next) => dispatch(setQuery({ page: next }))}
                onLimitChange={(nextLimit) =>
                  dispatch(setQuery({ limit: nextLimit, page: 1 }))
                }
              />
            </div>
          )}
      </main>

      {false && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
          <div
            className="relative bg-[#F0F2E5] rounded-t-2xl sm:rounded-2xl shadow-xl border border-base-200/60 w-full sm:max-w-4xl max-h-[92vh] sm:max-h-[88vh] overflow-hidden flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="workspace-detail-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-2 w-full bg-gradient-to-r from-[#3B613A] to-[#4a7549] flex-shrink-0" />
            <header className="flex-shrink-0 px-4 py-3 sm:px-5 sm:py-4 bg-base-100 border-b border-base-200/60">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 id="workspace-detail-title" className="text-lg font-bold text-[#172b4d] truncate">
                    {currentWorkspace.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {(currentWorkspace.course || currentWorkspace.classBatch || currentWorkspace.semester) && (
                      <span className="text-sm text-[#5e6c84]">
                        {[currentWorkspace.course, currentWorkspace.classBatch, currentWorkspace.semester].filter(Boolean).join(' · ')}
                      </span>
                    )}
                    <span className={`badge badge-sm capitalize ${currentWorkspace.status === 'active' ? 'badge-success' : currentWorkspace.status === 'archived' ? 'badge-ghost' : 'badge-warning'}`}>
                      {currentWorkspace.status}
                    </span>
                    <span className="text-xs text-[#5e6c84]">
                      {currentWorkspace.studentCount ?? 0} students · {currentWorkspace.cardCount ?? 0} cards
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-circle flex-shrink-0"
                  onClick={() => { setDetailOpen(false); dispatch(clearCurrentWorkspace()); setAddCardExpanded(false); }}
                  aria-label="Close"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                {/* Class roster */}
                <section className="bg-base-100 rounded-xl border border-base-200/60 overflow-hidden shadow-sm">
                  <div className="px-4 py-3 flex items-center justify-between gap-2 border-b border-base-200/60 bg-base-200/40">
                    <h3 className="font-semibold text-[#172b4d] flex items-center gap-2 text-sm">
                      <FiUsers className="w-4 h-4 text-[#3B613A]" />
                      Class roster
                    </h3>
                    <input ref={fileInputRef} type="file" accept=".csv,text/csv,text/plain" className="hidden" onChange={handleUploadCsv} />
                    <button
                      type="button"
                      className="btn btn-sm bg-[#3B613A] hover:bg-[#4a7549] border-0 text-white rounded-lg gap-1.5"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FiUpload className="w-4 h-4" />
                      Upload CSV
                    </button>
                  </div>
                  <div className="p-3 max-h-52 overflow-y-auto">
                    {currentWorkspace.students?.length > 0 ? (
                      <ul className="space-y-1">
                        {currentWorkspace.students.map((s) => (
                          <li key={s.id} className="flex justify-between items-center py-2 px-3 rounded-lg bg-base-200/30 text-sm gap-2">
                            <span className="font-medium text-[#172b4d] truncate">{s.name || '—'}</span>
                            <span className="text-[#5e6c84] text-xs truncate">{s.email}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-[#5e6c84] py-4 text-center">No students. Upload a CSV to add the roster.</p>
                    )}
                  </div>
                </section>

                {/* Project cards — Trello list with collapsible Add card */}
                <section className="bg-base-100 rounded-xl border border-base-200/60 overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-base-200/60 bg-base-200/40">
                    <h3 className="font-semibold text-[#172b4d] flex items-center gap-2 text-sm">
                      <FiBook className="w-4 h-4 text-[#3B613A]" />
                      Project cards
                      {(currentWorkspace.cardCount ?? 0) > 0 && (
                        <span className="text-xs font-normal text-[#5e6c84]">({currentWorkspace.cardCount})</span>
                      )}
                    </h3>
                  </div>
                  <div className="p-3 max-h-80 overflow-y-auto">
                    {currentWorkspace.cards?.length > 0 && (
                      <ul className="space-y-2 mb-3">
                        {currentWorkspace.cards.map((card) => (
                          <li
                            key={card.id}
                            className="flex items-center justify-between gap-2 p-3 rounded-lg bg-base-200/40 border border-base-200/60 hover:border-[#3B613A]/30 transition-colors group"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-[#172b4d] text-sm truncate">{card.name}</p>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                <span className="text-xs px-2 py-0.5 rounded bg-[#3B613A]/10 text-[#3B613A]">{card.cardType}</span>
                                <span className="text-xs text-[#5e6c84]">×{card.quantity}</span>
                                {card.isGroupCard && <span className="text-xs text-[#5e6c84]">Group</span>}
                                <span className="text-xs text-[#5e6c84] capitalize">{card.status}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs btn-square text-[#5e6c84] hover:bg-error/10 hover:text-error opacity-0 group-hover:opacity-100 sm:opacity-100"
                              onClick={() => handleDeleteCard(card.id)}
                              aria-label="Delete card"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    {!addCardExpanded ? (
                      <button
                        type="button"
                        className="w-full py-2.5 px-3 rounded-lg border-2 border-dashed border-base-300 text-[#5e6c84] hover:border-[#3B613A]/50 hover:bg-[#3B613A]/5 hover:text-[#172b4d] text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        onClick={() => setAddCardExpanded(true)}
                      >
                        <FiPlus className="w-4 h-4" />
                        Add a card
                      </button>
                    ) : (
                      <form onSubmit={handleCreateCard} className="p-3 rounded-lg bg-base-200/40 border border-base-200/60 space-y-3">
                        <input
                          type="text"
                          className="input input-bordered input-sm w-full rounded-lg"
                          placeholder="Card name (e.g. Final project)"
                          value={cardForm.name}
                          onChange={(e) => setCardForm((c) => ({ ...c, name: e.target.value }))}
                          autoFocus
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            className="input input-bordered input-sm w-full rounded-lg"
                            placeholder="Type (e.g. Project)"
                            value={cardForm.cardType}
                            onChange={(e) => setCardForm((c) => ({ ...c, cardType: e.target.value }))}
                          />
                          <input
                            type="number"
                            min={1}
                            className="input input-bordered input-sm w-full rounded-lg"
                            placeholder="Qty"
                            value={cardForm.quantity}
                            onChange={(e) => setCardForm((c) => ({ ...c, quantity: Math.max(1, parseInt(e.target.value, 10) || 1) }))}
                          />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-[#172b4d]">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm checkbox-primary rounded"
                            checked={cardForm.isGroupCard}
                            onChange={(e) => setCardForm((c) => ({ ...c, isGroupCard: e.target.checked }))}
                          />
                          Group card
                        </label>
                        <div className="flex gap-2">
                          <button type="submit" className="btn btn-sm bg-[#3B613A] hover:bg-[#4a7549] border-0 text-white rounded-lg flex-1">
                            Add card
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm rounded-lg"
                            onClick={() => { setAddCardExpanded(false); setCardForm({ name: '', cardType: '', quantity: 1, isGroupCard: false }); }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {!currentWorkspace.cards?.length && !addCardExpanded && (
                      <p className="text-xs text-[#5e6c84] mt-2 text-center">Click “Add a card” to create a project or assignment.</p>
                    )}
                  </div>
                </section>
              </div>
            </div>

            <footer className="flex-shrink-0 p-4 border-t border-base-200/60 flex flex-col-reverse sm:flex-row justify-end gap-2 bg-base-100">
              <button
                type="button"
                className="btn btn-error btn-outline btn-sm sm:btn-ghost rounded-lg text-error hover:bg-error/10"
                onClick={() => {
                  setDetailOpen(false);
                  setConfirmDelete({ open: true, workspace: currentWorkspace });
                  dispatch(clearCurrentWorkspace());
                  setAddCardExpanded(false);
                }}
              >
                Delete workspace
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm bg-[#3B613A] hover:bg-[#4a7549] border-0 rounded-lg"
                onClick={() => { setDetailOpen(false); dispatch(clearCurrentWorkspace()); setAddCardExpanded(false); }}
              >
                Close
              </button>
            </footer>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmDelete.open}
        onClose={() => {
          setConfirmDelete({ open: false, workspace: null });
          setDeleteConfirmText('');
        }}
        onConfirm={handleDeleteWorkspace}
        title="Delete workspace"
        message={
          confirmDelete.workspace
            ? `Permanently delete "${confirmDelete.workspace.name}"? This will remove all students and cards in this workspace.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        confirmDisabled={
          !confirmDelete.workspace ||
          deleteConfirmText.trim() !== (confirmDelete.workspace?.name || '').trim()
        }
      >
        {confirmDelete.workspace && (
          <div className="space-y-2 mt-2">
            <p className="text-xs text-[#303030]/70">
              Type <span className="font-semibold text-[#303030]">{confirmDelete.workspace.name}</span> to confirm.
            </p>
            <input
              type="text"
              className="input input-bordered w-full h-10 text-sm rounded-xl"
              placeholder="Type workspace name to confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
          </div>
        )}
      </ConfirmModal>
    </div>
  );
}
