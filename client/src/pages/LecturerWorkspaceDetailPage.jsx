import { useCallback, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  FiArrowLeft,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiX,
  FiCalendar,
} from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import Breadcrumb from '../common/Breadcrumb';
import Loader from '../common/Loader';
import ConfirmModal from '../common/ConfirmModal';
import CardAssignmentModal from '../components/lecturer/CardAssignmentModal';
import { api } from '../utils/axios';
import {
  fetchWorkspaceById,
  fetchWorkspaces,
  deleteWorkspace,
  updateWorkspace,
  createCard,
  updateCard,
  deleteCard,
  clearCurrentWorkspace,
} from '../features/lecturer/workspaceSlice';

const DESCRIPTION_MAX = 750;

function getAvatarUrl(avatarUrl) {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith('data:') || avatarUrl.startsWith('http')) return avatarUrl;
  const base = import.meta.env.VITE_API_URL || '';
  return `${base}/api/uploads/avatars/${avatarUrl}`;
}

export default function LecturerWorkspaceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentWorkspace, items: workspaceList, actionLoading } = useSelector((state) => state.lecturerWorkspaces);

  const [cardForm, setCardForm] = useState({ name: '', cardType: '', quantity: 1, isGroupCard: false, startDate: '', dueDate: '', groupCount: 2 });
  const [addCardExpanded, setAddCardExpanded] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [editCardForm, setEditCardForm] = useState({ name: '', cardType: '', quantity: 1, isGroupCard: false, startDate: '', dueDate: '', groupCount: 2 });
  const [workspaceEditForm, setWorkspaceEditForm] = useState(null);
  const [savingWorkspace, setSavingWorkspace] = useState(false);
  const [confirmDeleteWorkspace, setConfirmDeleteWorkspace] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [confirmDeleteCard, setConfirmDeleteCard] = useState({ open: false, cardId: null });
  const [assignModalCardId, setAssignModalCardId] = useState(null);
  const [savingAssignments, setSavingAssignments] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadFileName, setUploadFileName] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchWorkspaceById(id)).catch(() => {
      toast.error('Workspace not found');
      navigate('/lecturer/workspaces');
    });
  }, [dispatch, id, navigate]);

  useEffect(() => {
    if (!id || (workspaceList?.length ?? 0) > 0) return;
    dispatch(fetchWorkspaces({ limit: 100, page: 1 }));
  }, [id, workspaceList?.length, dispatch]);

  useEffect(() => {
    return () => { dispatch(clearCurrentWorkspace()); };
  }, [dispatch]);

  useEffect(() => {
    if (currentWorkspace?.id) {
      setWorkspaceEditForm({
        name: currentWorkspace.name || '',
        course: currentWorkspace.course || '',
        classBatch: currentWorkspace.classBatch || '',
        semester: currentWorkspace.semester || '',
        description: (currentWorkspace.description || '').slice(0, DESCRIPTION_MAX),
        status: currentWorkspace.status || 'active',
      });
    } else {
      setWorkspaceEditForm(null);
    }
  }, [currentWorkspace?.id]);

  const handleBack = () => {
    navigate('/lecturer/workspaces');
  };

  const handleDownloadTemplate = async () => {
    try {
      const { data } = await api.get('/api/lecturer/workspaces/student-template', {
        responseType: 'arraybuffer',
      });
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'inkcuba_student_list_template.xlsx';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Template downloaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to download template');
    }
  };

  const searchStudents = useCallback(async (query) => {
    const { data } = await api.get('/api/lecturer/students', { params: { q: query, limit: 30 } });
    return data?.data ?? [];
  }, []);

  const addStudentToWorkspace = useCallback(
    async (student) => {
      if (!currentWorkspace?.id) return;
      try {
        await api.post(`/api/lecturer/workspaces/${currentWorkspace.id}/students`, {
          studentId: student.id,
        });
        toast.success('Student added to workspace');
        await dispatch(fetchWorkspaceById(currentWorkspace.id)).unwrap();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to add student');
      }
    },
    [currentWorkspace?.id, dispatch]
  );

  const handleFileSelectInModal = async (file) => {
    if (!file || !(file instanceof File) || !currentWorkspace?.id) return;
    setUploadProgress(0);
    setUploadStatus('uploading');
    setUploadFileName(file.name);
    const formData = new FormData();
    formData.append('studentList', file);
    try {
      await api.post(
        `/api/lecturer/workspaces/${currentWorkspace.id}/students/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            if (e.total) setUploadProgress(Math.round((100 * e.loaded) / e.total));
          },
        }
      );
      setUploadStatus('success');
      toast.success('Students added to workspace');
      await dispatch(fetchWorkspaceById(currentWorkspace.id)).unwrap();
    } catch (err) {
      setUploadStatus('error');
      toast.error(err.response?.data?.message || 'Upload failed. Use the template with Student Email column.');
    } finally {
      setUploadProgress(100);
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadFileName('');
      }, 800);
    }
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!currentWorkspace?.id) return;
    const name = cardForm.name?.trim();
    if (!name) {
      toast.error('Card title is required.');
      return;
    }
    if (!cardForm.startDate || !cardForm.dueDate) {
      toast.error('Start date and due date are required.');
      return;
    }
    const startDate = new Date(cardForm.startDate).toISOString();
    const dueDate = new Date(cardForm.dueDate).toISOString();
    if (isNaN(new Date(cardForm.startDate).getTime()) || isNaN(new Date(cardForm.dueDate).getTime())) {
      toast.error('Start and due dates must be valid.');
      return;
    }
    const cardType = cardForm.isGroupCard ? 'Group' : 'Individual';
    try {
      await dispatch(
        createCard({
          workspaceId: currentWorkspace.id,
          payload: {
            name,
            cardType,
            quantity: Math.max(1, parseInt(cardForm.quantity, 10) || 1),
            isGroupCard: cardForm.isGroupCard,
            startDate,
            dueDate,
            groupCount: cardForm.isGroupCard ? Math.max(1, parseInt(cardForm.groupCount, 10) || 1) : undefined,
          },
        })
      ).unwrap();
      toast.success('Card created');
      setCardForm({ name: '', cardType: '', quantity: 1, isGroupCard: false, startDate: '', dueDate: '', groupCount: 2 });
      setAddCardExpanded(false);
    } catch (err) {
      toast.error(err || 'Failed to create card');
    }
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    const d = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    return isNaN(d.getTime()) ? null : d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const startEditCard = (card) => {
    setEditingCardId(card.id);
    setEditCardForm({
      name: card.name,
      cardType: card.cardType,
      quantity: card.quantity ?? 1,
      isGroupCard: card.isGroupCard ?? false,
      startDate: card.startDate ? (typeof card.startDate === 'string' ? card.startDate.slice(0, 10) : new Date(card.startDate).toISOString().slice(0, 10)) : '',
      dueDate: card.dueDate ? (typeof card.dueDate === 'string' ? card.dueDate.slice(0, 10) : new Date(card.dueDate).toISOString().slice(0, 10)) : '',
      groupCount: card.groupCount ?? 2,
    });
  };

  const cancelEditCard = () => {
    setEditingCardId(null);
    setEditCardForm({ name: '', cardType: '', quantity: 1, isGroupCard: false, startDate: '', dueDate: '', groupCount: 2 });
  };

  const handleSaveAssignments = async (assignments) => {
    if (!currentWorkspace?.id || !assignModalCardId) return;
    setSavingAssignments(true);
    try {
      await dispatch(
        updateCard({
          workspaceId: currentWorkspace.id,
          cardId: assignModalCardId,
          payload: { assignments },
        })
      ).unwrap();
      toast.success('Assignments saved');
      await dispatch(fetchWorkspaceById(currentWorkspace.id)).unwrap();
      setAssignModalCardId(null);
    } catch (err) {
      toast.error(err?.message || err || 'Failed to save assignments');
    } finally {
      setSavingAssignments(false);
    }
  };

  const handleSaveWorkspace = async (e) => {
    e.preventDefault();
    if (!currentWorkspace?.id || !workspaceEditForm) return;
    setSavingWorkspace(true);
    try {
      await dispatch(updateWorkspace({
        id: currentWorkspace.id,
        payload: {
          name: workspaceEditForm.name.trim(),
          course: workspaceEditForm.course.trim(),
          classBatch: workspaceEditForm.classBatch.trim(),
          semester: workspaceEditForm.semester.trim(),
          description: workspaceEditForm.description.trim().slice(0, DESCRIPTION_MAX),
          status: workspaceEditForm.status,
        },
      })).unwrap();
      toast.success('Workspace updated');
      await dispatch(fetchWorkspaceById(currentWorkspace.id)).unwrap();
    } catch (err) {
      toast.error(err?.message || err || 'Failed to update workspace');
    } finally {
      setSavingWorkspace(false);
    }
  };

  const handleSaveCard = async (e) => {
    e.preventDefault();
    if (!currentWorkspace?.id || !editingCardId) return;
    const name = editCardForm.name?.trim();
    if (!name) {
      toast.error('Card title is required.');
      return;
    }
    if (!editCardForm.startDate || !editCardForm.dueDate) {
      toast.error('Start date and due date are required.');
      return;
    }
    const startDate = new Date(editCardForm.startDate).toISOString();
    const dueDate = new Date(editCardForm.dueDate).toISOString();
    if (isNaN(new Date(editCardForm.startDate).getTime()) || isNaN(new Date(editCardForm.dueDate).getTime())) {
      toast.error('Start and due dates must be valid.');
      return;
    }
    const cardType = editCardForm.isGroupCard ? 'Group' : 'Individual';
    try {
      await dispatch(
        updateCard({
          workspaceId: currentWorkspace.id,
          cardId: editingCardId,
          payload: {
            name,
            cardType,
            quantity: Math.max(1, parseInt(editCardForm.quantity, 10) || 1),
            isGroupCard: editCardForm.isGroupCard,
            startDate,
            dueDate,
            groupCount: editCardForm.isGroupCard ? Math.max(1, parseInt(editCardForm.groupCount, 10) || 1) : undefined,
          },
        })
      ).unwrap();
      toast.success('Card updated');
      setEditingCardId(null);
      await dispatch(fetchWorkspaceById(currentWorkspace.id)).unwrap();
    } catch (err) {
      toast.error(err || 'Failed to update card');
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!currentWorkspace?.id) return;
    try {
      await dispatch(
        deleteCard({ workspaceId: currentWorkspace.id, cardId })
      ).unwrap();
      toast.success('Card deleted');
      setConfirmDeleteCard({ open: false, cardId: null });
    } catch (err) {
      toast.error(err || 'Failed to delete card');
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!currentWorkspace || deleteConfirmText.trim() !== (currentWorkspace.name || '').trim()) return;
    try {
      await dispatch(deleteWorkspace(currentWorkspace.id)).unwrap();
      toast.success('Workspace deleted');
      navigate('/lecturer/workspaces');
    } catch (err) {
      toast.error(err || 'Failed to delete workspace');
    }
  };

  const loading = !currentWorkspace;

  return (
    <div className="min-h-screen bg-[#F0F2E5]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Breadcrumb
          items={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'Workspaces', to: '/lecturer/workspaces' },
            { label: currentWorkspace?.name ?? 'Workspace', to: null },
          ]}
        />

        {loading ? (
          <div className="flex items-center justify-center min-h-[320px]">
            <Loader size="lg" text="Loading workspace..." />
          </div>
        ) : !currentWorkspace ? (
          <div className="bg-base-100 rounded-xl p-8 text-center">
            <p className="text-[#5e6c84]">Workspace not found.</p>
            <button
              type="button"
              className="btn btn-primary mt-4 bg-[#3B613A] hover:bg-[#4a7549] border-0"
              onClick={handleBack}
            >
              Back to Workspaces
            </button>
          </div>
        ) : (
          <>
            <header className="mb-4 sm:mb-5">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-circle flex-shrink-0"
                  onClick={handleBack}
                  aria-label="Back to workspaces"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </button>
                {workspaceList?.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      className="select select-bordered select-sm max-w-[220px] sm:max-w-xs rounded-xl text-sm font-medium border-base-300"
                      value={currentWorkspace.id}
                      onChange={(e) => {
                        const nextId = e.target.value;
                        if (nextId && nextId !== currentWorkspace.id) navigate(`/lecturer/workspaces/${nextId}`);
                      }}
                      aria-label="Switch workspace"
                    >
                      {workspaceList.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-error btn-outline btn-sm rounded-lg"
                    onClick={() => setConfirmDeleteWorkspace(true)}
                  >
                    Delete workspace
                  </button>
                </div>
              </div>
            </header>

            {/* Section 1: Workspace Details (editable) — same layout as create */}
            {workspaceEditForm && (
              <section className="bg-base-100 rounded-xl border border-base-200/60 shadow-sm overflow-visible relative z-10 mb-6 sm:mb-8">
                <div className="px-4 sm:px-6 py-3 border-b border-base-200/60 bg-[#3B613A]/5 rounded-t-xl">
                  <h2 className="font-semibold text-[#172b4d] flex items-center gap-2 text-base sm:text-lg">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#3B613A] text-white text-sm font-bold flex-shrink-0">1</span>
                    Workspace Details
                  </h2>
                  <p className="text-xs text-[#5e6c84] mt-1 ml-9">Update name, course, class, semester, description, and status.</p>
                </div>
                <form onSubmit={handleSaveWorkspace} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                  <div>
                    <label className="label py-0 mb-1"><span className="label-text font-medium text-[#172b4d]">Workspace Name</span> <span className="text-error">*</span></label>
                    <input
                      type="text"
                      className="input input-bordered w-full rounded-xl h-11 border-base-300 focus:border-[#3B613A]/50"
                      placeholder="e.g., UI/UX Final Project Fall 2023"
                      value={workspaceEditForm.name}
                      onChange={(e) => setWorkspaceEditForm((p) => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="label py-0 mb-1"><span className="label-text font-medium text-[#172b4d]">Course / Program</span> <span className="text-error">*</span></label>
                      <input
                        type="text"
                        className="input input-bordered w-full rounded-xl h-11 border-base-300"
                        value={workspaceEditForm.course}
                        onChange={(e) => setWorkspaceEditForm((p) => ({ ...p, course: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="label py-0 mb-1"><span className="label-text font-medium text-[#172b4d]">Class / Batch</span> <span className="text-error">*</span></label>
                      <input
                        type="text"
                        className="input input-bordered w-full rounded-xl h-11 border-base-300"
                        value={workspaceEditForm.classBatch}
                        onChange={(e) => setWorkspaceEditForm((p) => ({ ...p, classBatch: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="label py-0 mb-1"><span className="label-text font-medium text-[#172b4d]">Semester</span> <span className="text-error">*</span></label>
                      <input
                        type="text"
                        className="input input-bordered w-full rounded-xl h-11 border-base-300"
                        value={workspaceEditForm.semester}
                        onChange={(e) => setWorkspaceEditForm((p) => ({ ...p, semester: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label py-0 mb-1"><span className="label-text font-medium text-[#172b4d]">Status</span></label>
                    <select
                      className="select select-bordered w-full rounded-xl h-11 border-base-300"
                      value={workspaceEditForm.status}
                      onChange={(e) => setWorkspaceEditForm((p) => ({ ...p, status: e.target.value }))}
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="label py-0 mb-1"><span className="label-text font-medium text-[#172b4d]">Description</span> <span className="text-xs text-[#5e6c84]">(max {DESCRIPTION_MAX})</span></label>
                    <textarea
                      className="textarea textarea-bordered w-full rounded-xl min-h-[80px] border-base-300"
                      placeholder="Brief description of the workspace and project goals..."
                      value={workspaceEditForm.description}
                      onChange={(e) => setWorkspaceEditForm((p) => ({ ...p, description: e.target.value.slice(0, DESCRIPTION_MAX) }))}
                      maxLength={DESCRIPTION_MAX}
                    />
                    <p className="text-right text-xs text-[#5e6c84] mt-0.5">{workspaceEditForm.description.length} / {DESCRIPTION_MAX}</p>
                  </div>
                  <button type="submit" className="btn btn-sm rounded-xl bg-[#3B613A] hover:bg-[#4a7549] border-0 text-white" disabled={savingWorkspace}>
                    {savingWorkspace ? <span className="loading loading-spinner loading-sm" /> : 'Update workspace'}
                  </button>
                </form>
              </section>
            )}

            {/* Section 2: Create & Define Cards — same layout as create page */}
            <section className="bg-base-100 rounded-xl border border-base-200/60 shadow-sm overflow-hidden">
              <div className="px-4 sm:px-6 py-3 border-b border-base-200/60 bg-[#3B613A]/5 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-[#172b4d] flex items-center gap-2 text-base sm:text-lg">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#3B613A] text-white text-sm font-bold flex-shrink-0">2</span>
                    Create & Define Cards (Projects)
                  </h2>
                  <p className="text-xs text-[#5e6c84] mt-1 ml-9">
                    Add project cards, then click Assign to add students (manual or upload) and assign them to slots or groups.
                  </p>
                </div>
                {!addCardExpanded && (
                  <button
                    type="button"
                    className="btn btn-sm rounded-xl bg-[#3B613A] hover:bg-[#4a7549] border-0 text-white gap-1.5 flex-shrink-0"
                    onClick={() => {
                      const today = new Date().toISOString().slice(0, 10);
                      setCardForm({ name: '', cardType: '', quantity: 1, isGroupCard: false, startDate: today, dueDate: today, groupCount: 2 });
                      setAddCardExpanded(true);
                    }}
                  >
                    <FiPlus className="w-4 h-4" />
                    Add New Card
                  </button>
                )}
              </div>
              <div className="p-4 sm:p-6 space-y-5">
                {addCardExpanded && (
                  <form onSubmit={handleCreateCard} className="p-4 sm:p-5 rounded-xl border-2 border-[#3B613A]/25 bg-[#3B613A]/5 space-y-5">
                    <h3 className="font-semibold text-[#172b4d] text-sm border-b border-base-200/60 pb-2">New project card — fill in the fields below</h3>
                    <div>
                      <label className="label py-0 mb-1">
                        <span className="label-text font-medium text-[#172b4d]">Card title</span>
                        <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full rounded-xl h-11 border-base-300 focus:border-[#3B613A]/50 focus:outline-none"
                        placeholder="e.g. Portfolio Project Part 1, Final Implementation"
                        value={cardForm.name}
                        onChange={(e) => setCardForm((c) => ({ ...c, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <p className="label-text font-medium text-[#172b4d] mb-2">Assignment type</p>
                      <p className="text-xs text-[#5e6c84] mb-2">Individual = one student per submission; Group = multiple students per submission.</p>
                      <div className="flex flex-wrap gap-4">
                        <label
                          className={`flex items-center gap-2 cursor-pointer text-sm text-[#172b4d] px-3 py-2.5 rounded-lg border-2 transition-colors ${
                            !cardForm.isGroupCard ? 'border-[#3B613A] bg-[#3B613A]/10' : 'border-base-200 bg-base-100 hover:border-[#3B613A]/40'
                          }`}
                        >
                          <input type="radio" name="newCardType" className="radio radio-sm radio-primary" checked={!cardForm.isGroupCard} onChange={() => setCardForm((c) => ({ ...c, isGroupCard: false }))} />
                          Individual
                        </label>
                        <label
                          className={`flex items-center gap-2 cursor-pointer text-sm text-[#172b4d] px-3 py-2.5 rounded-lg border-2 transition-colors ${
                            cardForm.isGroupCard ? 'border-[#3B613A] bg-[#3B613A]/10' : 'border-base-200 bg-base-100 hover:border-[#3B613A]/40'
                          }`}
                        >
                          <input type="radio" name="newCardType" className="radio radio-sm radio-primary" checked={cardForm.isGroupCard} onChange={() => setCardForm((c) => ({ ...c, isGroupCard: true }))} />
                          Group
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label py-0 mb-1">
                          <span className="label-text font-medium text-[#172b4d]">{cardForm.isGroupCard ? 'Students per group' : 'Quantity'}</span>
                        </label>
                        <p className="text-xs text-[#5e6c84] mb-1">{cardForm.isGroupCard ? 'Number of students in each group.' : 'Number of individual slots.'}</p>
                        <input type="number" min={1} className="input input-bordered w-full rounded-xl h-11" value={cardForm.quantity} onChange={(e) => setCardForm((c) => ({ ...c, quantity: Math.max(1, parseInt(e.target.value, 10) || 1) }))} />
                      </div>
                      {cardForm.isGroupCard && (
                        <div>
                          <label className="label py-0 mb-1"><span className="label-text font-medium text-[#172b4d]">Number of groups</span></label>
                          <p className="text-xs text-[#5e6c84] mb-1">Total groups for this card.</p>
                          <input type="number" min={1} className="input input-bordered w-full rounded-xl h-11" value={cardForm.groupCount} onChange={(e) => setCardForm((c) => ({ ...c, groupCount: Math.max(1, parseInt(e.target.value, 10) || 1) }))} />
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label py-0 mb-1">
                          <span className="label-text font-medium text-[#172b4d] flex items-center gap-1"><FiCalendar className="w-4 h-4 text-[#3B613A]" /> Start date</span>
                          <span className="text-error">*</span>
                        </label>
                        <p className="text-xs text-[#5e6c84] mb-1">When this card becomes visible to students.</p>
                        <input type="date" className="input input-bordered w-full rounded-xl h-11" value={cardForm.startDate} onChange={(e) => setCardForm((c) => ({ ...c, startDate: e.target.value }))} required />
                      </div>
                      <div>
                        <label className="label py-0 mb-1">
                          <span className="label-text font-medium text-[#172b4d] flex items-center gap-1"><FiCalendar className="w-4 h-4 text-[#3B613A]" /> Due date</span>
                          <span className="text-error">*</span>
                        </label>
                        <input type="date" className="input input-bordered w-full rounded-xl h-11" value={cardForm.dueDate} onChange={(e) => setCardForm((c) => ({ ...c, dueDate: e.target.value }))} required />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button type="submit" className="btn btn-sm bg-[#3B613A] hover:bg-[#4a7549] border-0 text-white rounded-xl">Add card</button>
                      <button type="button" className="btn btn-ghost btn-sm rounded-xl" onClick={() => { setAddCardExpanded(false); setCardForm({ name: '', cardType: '', quantity: 1, isGroupCard: false, startDate: '', dueDate: '', groupCount: 2 }); }}>Cancel</button>
                    </div>
                  </form>
                )}

                {currentWorkspace.cards?.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium text-[#172b4d] mb-3">Your cards ({currentWorkspace.cards.length}) — you can edit or remove any, or assign students.</p>
                    <ul className="space-y-3">
                      {currentWorkspace.cards.map((card) =>
                        editingCardId === card.id ? (
                          <li key={card.id}>
                            <form onSubmit={handleSaveCard} className="p-4 sm:p-5 rounded-xl border-2 border-[#3B613A]/25 bg-[#3B613A]/5 space-y-5">
                              <h3 className="font-semibold text-[#172b4d] text-sm border-b border-base-200/60 pb-2">Edit this card</h3>
                              <div>
                                <label className="label py-0 mb-1"><span className="label-text font-medium text-[#172b4d]">Card title</span><span className="text-error">*</span></label>
                                <input type="text" className="input input-bordered w-full rounded-xl h-11 border-base-300 focus:border-[#3B613A]/50 focus:outline-none" placeholder="e.g. Portfolio Project Part 1" value={editCardForm.name} onChange={(e) => setEditCardForm((c) => ({ ...c, name: e.target.value }))} required />
                              </div>
                              <div>
                                <p className="label-text font-medium text-[#172b4d] mb-2">Assignment type</p>
                                <div className="flex flex-wrap gap-4">
                                  <label className={`flex items-center gap-2 cursor-pointer text-sm text-[#172b4d] px-3 py-2.5 rounded-lg border-2 transition-colors ${!editCardForm.isGroupCard ? 'border-[#3B613A] bg-[#3B613A]/10' : 'border-base-200 bg-base-100 hover:border-[#3B613A]/40'}`}>
                                    <input type="radio" name="editCardType" className="radio radio-sm radio-primary" checked={!editCardForm.isGroupCard} onChange={() => setEditCardForm((c) => ({ ...c, isGroupCard: false }))} />
                                    Individual
                                  </label>
                                  <label className={`flex items-center gap-2 cursor-pointer text-sm text-[#172b4d] px-3 py-2.5 rounded-lg border-2 transition-colors ${editCardForm.isGroupCard ? 'border-[#3B613A] bg-[#3B613A]/10' : 'border-base-200 bg-base-100 hover:border-[#3B613A]/40'}`}>
                                    <input type="radio" name="editCardType" className="radio radio-sm radio-primary" checked={editCardForm.isGroupCard} onChange={() => setEditCardForm((c) => ({ ...c, isGroupCard: true }))} />
                                    Group
                                  </label>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="label py-0 mb-1"><span className="label-text font-medium text-[#172b4d]">{editCardForm.isGroupCard ? 'Students per group' : 'Quantity'}</span></label>
                                  <input type="number" min={1} className="input input-bordered w-full rounded-xl h-11" value={editCardForm.quantity} onChange={(e) => setEditCardForm((c) => ({ ...c, quantity: Math.max(1, parseInt(e.target.value, 10) || 1) }))} />
                                </div>
                                {editCardForm.isGroupCard && (
                                  <div>
                                    <label className="label py-0 mb-1"><span className="label-text font-medium text-[#172b4d]">Number of groups</span></label>
                                    <input type="number" min={1} className="input input-bordered w-full rounded-xl h-11" value={editCardForm.groupCount} onChange={(e) => setEditCardForm((c) => ({ ...c, groupCount: Math.max(1, parseInt(e.target.value, 10) || 1) }))} />
                                  </div>
                                )}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="label py-0 mb-1"><span className="label-text font-medium text-[#172b4d] flex items-center gap-1"><FiCalendar className="w-4 h-4 text-[#3B613A]" /> Start date</span><span className="text-error">*</span></label>
                                  <input type="date" className="input input-bordered w-full rounded-xl h-11" value={editCardForm.startDate} onChange={(e) => setEditCardForm((c) => ({ ...c, startDate: e.target.value }))} required />
                                </div>
                                <div>
                                  <label className="label py-0 mb-1"><span className="label-text font-medium text-[#172b4d] flex items-center gap-1"><FiCalendar className="w-4 h-4 text-[#3B613A]" /> Due date</span><span className="text-error">*</span></label>
                                  <input type="date" className="input input-bordered w-full rounded-xl h-11" value={editCardForm.dueDate} onChange={(e) => setEditCardForm((c) => ({ ...c, dueDate: e.target.value }))} required />
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 pt-1">
                                <button type="submit" className="btn btn-sm bg-[#3B613A] hover:bg-[#4a7549] border-0 text-white rounded-xl">Save card</button>
                                <button type="button" className="btn btn-ghost btn-sm rounded-xl" onClick={cancelEditCard}>Cancel</button>
                              </div>
                            </form>
                          </li>
                        ) : (
                          <li key={card.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-base-200/60 bg-base-200/20 hover:border-[#3B613A]/30 transition-colors group">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-[#172b4d]">{card.name}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                                <span className="px-2 py-0.5 rounded-md bg-[#3B613A]/10 text-[#3B613A] font-medium">{card.isGroupCard ? 'Group' : 'Individual'}</span>
                                <span className="text-[#5e6c84]">{card.isGroupCard ? `${card.groupCount ?? 2} groups × ${card.quantity} students` : `Quantity: ${card.quantity}`}</span>
                                {card.startDate && (<span className="flex items-center gap-0.5 text-[#5e6c84]"><FiCalendar className="w-3.5 h-3.5" /> From {formatDueDate(card.startDate)}</span>)}
                                {card.dueDate && (<span className="flex items-center gap-0.5 text-[#5e6c84]"><FiCalendar className="w-3.5 h-3.5" /> Due {formatDueDate(card.dueDate)}</span>)}
                                {card.assignments && (card.isGroupCard ? (
                                  <span className="text-[#3B613A] font-medium flex items-center gap-0.5"><FiUsers className="w-3.5 h-3.5" />{card.assignments.reduce((sum, a) => sum + (a.memberIds?.length || 0), 0)} assigned</span>
                                ) : (
                                  <span className="text-[#3B613A] font-medium">{card.assignments.filter((a) => a.studentId).length}/{card.quantity} assigned</span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0 flex-wrap justify-end sm:justify-start">
                              <button type="button" className="btn btn-sm rounded-lg bg-[#3B613A]/10 hover:bg-[#3B613A]/20 text-[#3B613A] gap-1.5" onClick={() => setAssignModalCardId(card.id)}><FiUsers className="w-4 h-4" /> Assign</button>
                              <button type="button" className="btn btn-ghost btn-xs btn-square text-[#5e6c84] hover:bg-[#3B613A]/10 hover:text-[#3B613A]" onClick={() => startEditCard(card)} aria-label="Edit card"><FiEdit2 className="w-4 h-4" /></button>
                              <button type="button" className="btn btn-ghost btn-xs btn-square text-[#5e6c84] hover:bg-error/10 hover:text-error" onClick={() => setConfirmDeleteCard({ open: true, cardId: card.id })} aria-label="Delete card"><FiTrash2 className="w-4 h-4" /></button>
                            </div>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                ) : !addCardExpanded && (
                  <div className="text-center py-6 sm:py-8 rounded-xl border-2 border-dashed border-base-300 bg-base-200/20">
                    <p className="text-sm text-[#5e6c84] mb-2">No project cards yet.</p>
                    <p className="text-xs text-[#5e6c84] mb-4 max-w-sm mx-auto">Click &quot;Add New Card&quot; above to create a project or assignment, then use &quot;Assign&quot; to assign students.</p>
                    <button type="button" className="btn btn-sm rounded-xl bg-[#3B613A] hover:bg-[#4a7549] border-0 text-white gap-1.5" onClick={() => { const today = new Date().toISOString().slice(0, 10); setCardForm({ name: '', cardType: '', quantity: 1, isGroupCard: false, startDate: today, dueDate: today, groupCount: 2 }); setAddCardExpanded(true); }}>
                      <FiPlus className="w-4 h-4" />
                      Add New Card
                    </button>
                  </div>
                )}

                {currentWorkspace.cards?.length === 0 && addCardExpanded && (
                  <p className="text-sm text-[#5e6c84]">Fill in the form above to add your first card.</p>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      <ConfirmModal
        open={confirmDeleteWorkspace}
        onClose={() => {
          setConfirmDeleteWorkspace(false);
          setDeleteConfirmText('');
        }}
        onConfirm={handleDeleteWorkspace}
        title="Delete workspace"
        message={
          currentWorkspace
            ? `Permanently delete "${currentWorkspace.name}"? This will remove all students and cards.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        confirmDisabled={
          !currentWorkspace || deleteConfirmText.trim() !== (currentWorkspace?.name || '').trim()
        }
      >
        {currentWorkspace && (
          <div className="space-y-2 mt-2">
            <p className="text-xs text-[#303030]/70">
              Type <span className="font-semibold">{currentWorkspace.name}</span> to confirm.
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

      <ConfirmModal
        open={confirmDeleteCard.open}
        onClose={() => setConfirmDeleteCard({ open: false, cardId: null })}
        onConfirm={() => handleDeleteCard(confirmDeleteCard.cardId)}
        title="Delete card"
        message="Remove this project card? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />

      <CardAssignmentModal
        open={assignModalCardId !== null}
        onClose={() => setAssignModalCardId(null)}
        card={assignModalCardId ? currentWorkspace?.cards?.find((c) => c.id === assignModalCardId) ?? null : null}
        students={(currentWorkspace?.students || []).map((s) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          avatarUrl: s.avatarUrl || '',
        }))}
        onSave={handleSaveAssignments}
        showPoolManagement
        onDownloadTemplate={handleDownloadTemplate}
        onFileSelect={handleFileSelectInModal}
        fileInputRef={fileInputRef}
        uploadProgress={uploadProgress}
        uploadStatus={uploadStatus}
        uploadFileName={uploadFileName}
        onSearchStudents={searchStudents}
        onAddStudent={addStudentToWorkspace}
      />
    </div>
  );
}
