import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCalendar,
  FiUsers,
} from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import Breadcrumb from '../common/Breadcrumb';
import Loader from '../common/Loader';
import ConfirmModal from '../common/ConfirmModal';
import Combobox from '../common/Combobox';
import CardAssignmentModal from '../components/lecturer/CardAssignmentModal';
import { api } from '../utils/axios';
import {
  fetchWorkspaces,
  createWorkspace,
  fetchWorkspaceById,
  addStudentsBatch,
  createCard,
} from '../features/lecturer/workspaceSlice';

const COURSE_OPTIONS = [
  'Computer Science',
  'Graphic Design',
  'Information Systems',
  'Digital Marketing',
  'Multimedia',
  'Software Engineering',
];

export default function LecturerCreateWorkspacePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: existingWorkspaces, actionLoading } = useSelector((s) => s.lecturerWorkspaces);

  const [stepConfirmCancel, setStepConfirmCancel] = useState(false);
  const [stepConfirmSave, setStepConfirmSave] = useState(false);
  const [saving, setSaving] = useState(false);

  const [details, setDetails] = useState({
    name: '',
    course: '',
    classBatch: '',
    semester: '',
    description: '',
  });
  const DESCRIPTION_MAX = 750;
  const [pendingStudents, setPendingStudents] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadFileName, setUploadFileName] = useState('');
  const fileInputRef = useRef(null);

  const [pendingCards, setPendingCards] = useState([]);
  const [editingCardIndex, setEditingCardIndex] = useState(null);
  const [cardForm, setCardForm] = useState({
    name: '',
    cardType: '',
    quantity: 1,
    isGroupCard: false,
    startDate: '',
    dueDate: '',
    groupCount: 2,
  });
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [confirmDeleteCardIndex, setConfirmDeleteCardIndex] = useState(null);
  const [assignModalCardIndex, setAssignModalCardIndex] = useState(null);

  const courseOptions = [
    ...new Set([
      ...COURSE_OPTIONS,
      ...(existingWorkspaces?.map((w) => w.course).filter(Boolean) || []),
    ]),
  ].sort((a, b) => a.localeCompare(b));
  const classBatchOptions = [
    ...new Set((existingWorkspaces?.map((w) => w.classBatch).filter(Boolean) || [])),
  ].sort((a, b) => a.localeCompare(b));
  const semesterOptions = [
    ...new Set((existingWorkspaces?.map((w) => w.semester).filter(Boolean) || [])),
  ].sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    if (!existingWorkspaces?.length) dispatch(fetchWorkspaces({ limit: 100, page: 1 }));
  }, [dispatch, existingWorkspaces?.length]);

  useEffect(() => {
    if (assignModalCardIndex === null || pendingStudents.length > 0) return;
    api.get('/api/lecturer/students', { params: { limit: 50 } })
      .then((r) => {
        const list = r.data?.data ?? [];
        if (list.length) {
          setPendingStudents(
            list.map((s) => ({
              id: (s.id ?? s._id)?.toString?.() ?? String(s.id),
              name: s.name ?? '',
              email: s.email ?? '',
              avatarUrl: s.avatarUrl ?? '',
            }))
          );
        }
      })
      .catch(() => {});
  }, [assignModalCardIndex, pendingStudents.length]);

  const hasUnsavedChanges =
    details.name.trim() ||
    details.course.trim() ||
    details.classBatch.trim() ||
    details.semester.trim() ||
    details.description.trim() ||
    pendingStudents.length > 0 ||
    pendingCards.length > 0;

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      setStepConfirmCancel(true);
    } else {
      navigate('/lecturer/workspaces');
    }
  }, [hasUnsavedChanges, navigate]);

  const doCancel = () => {
    setStepConfirmCancel(false);
    navigate('/lecturer/workspaces');
  };

  const handleSave = useCallback(() => {
    const name = details.name.trim();
    const course = details.course.trim();
    const classBatch = details.classBatch.trim();
    const semester = details.semester.trim();
    if (!name) {
      toast.error('Workspace name is required.');
      return;
    }
    if (!course) {
      toast.error('Course / Program is required.');
      return;
    }
    if (!classBatch) {
      toast.error('Class / Batch is required.');
      return;
    }
    if (!semester) {
      toast.error('Semester is required.');
      return;
    }
    if (details.description.length > DESCRIPTION_MAX) {
      toast.error(`Description must be at most ${DESCRIPTION_MAX} characters.`);
      return;
    }
    setStepConfirmSave(true);
  }, [details.name, details.course, details.classBatch, details.semester, details.description.length]);

  const doSave = async () => {
    setStepConfirmSave(false);
    setSaving(true);
    try {
      const { workspace } = await dispatch(
        createWorkspace({
          name: details.name.trim(),
          description: details.description.trim().slice(0, DESCRIPTION_MAX),
          course: details.course.trim(),
          classBatch: details.classBatch.trim(),
          semester: details.semester.trim(),
          status: 'active',
        })
      ).unwrap();
      const workspaceId = workspace.id;

      if (pendingStudents.length > 0) {
        try {
          const studentIds = pendingStudents.map((s) => s.id);
          await dispatch(addStudentsBatch({ workspaceId, studentIds })).unwrap();
        } catch (batchErr) {
          toast.error(batchErr || 'Failed to add some students.');
        }
      }
      for (const card of pendingCards) {
        try {
          await dispatch(
            createCard({
              workspaceId,
              payload: {
                name: card.name.trim(),
                cardType: card.cardType.trim() || 'Project',
                quantity: Math.max(1, card.quantity || 1),
                isGroupCard: !!card.isGroupCard,
                startDate: card.startDate,
                dueDate: card.dueDate,
                groupCount: card.isGroupCard ? (card.groupCount || 2) : undefined,
                assignments: Array.isArray(card.assignments) ? card.assignments : [],
              },
            })
          ).unwrap();
        } catch (cardErr) {
          toast.error(cardErr || `Failed to create card "${card.name}".`);
        }
      }

      toast.success('Workspace created successfully.');
      await dispatch(fetchWorkspaceById(workspaceId)).unwrap();
      navigate(`/lecturer/workspaces/${workspaceId}`);
    } catch (err) {
      toast.error(err || 'Failed to create workspace.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelectInModal = useCallback(async (file) => {
    if (!file || !(file instanceof File)) return;
    setUploadProgress(0);
    setUploadStatus('uploading');
    setUploadFileName(file.name);
    const formData = new FormData();
    formData.append('studentList', file);
    try {
      const { data } = await api.post('/api/lecturer/students/match-from-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((100 * e.loaded) / e.total));
        },
      });
      const { matched = [], notFoundCount = 0 } = data?.data || {};
      setPendingStudents((prev) => {
        const ids = new Set(prev.map((s) => s.id));
        const added = matched.filter((m) => !ids.has(m.id));
        return [...prev, ...added];
      });
      setUploadStatus('success');
      if (matched.length) toast.success(`${matched.length} student(s) matched and added.`);
      if (notFoundCount > 0) toast(`${notFoundCount} row(s) had no matching account.`, { icon: 'ℹ️' });
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
  }, []);

  const searchStudents = useCallback(async (query) => {
    const { data } = await api.get('/api/lecturer/students', { params: { q: query, limit: 30 } });
    return data?.data ?? [];
  }, []);

  const addStudentToPool = useCallback((student) => {
    setPendingStudents((prev) => {
      if (prev.some((s) => s.id === student.id)) return prev;
      return [
        ...prev,
        {
          id: student.id,
          name: student.name,
          email: student.email,
          avatarUrl: student.avatarUrl || '',
        },
      ];
    });
  }, []);

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
      toast.success('Template downloaded.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to download template.');
    }
  };

  const openAddCard = () => {
    setEditingCardIndex(null);
    const today = new Date().toISOString().slice(0, 10);
    setCardForm({ name: '', cardType: '', quantity: 1, isGroupCard: false, startDate: today, dueDate: '', groupCount: 2 });
    setAddCardOpen(true);
  };

  const openEditCard = (index) => {
    const c = pendingCards[index];
    setEditingCardIndex(index);
    setCardForm({
      name: c.name || '',
      cardType: c.cardType || '',
      quantity: c.quantity ?? 1,
      isGroupCard: !!c.isGroupCard,
      startDate: c.startDate ? (typeof c.startDate === 'string' ? c.startDate.slice(0, 10) : new Date(c.startDate).toISOString().slice(0, 10)) : '',
      dueDate: c.dueDate ? (typeof c.dueDate === 'string' ? c.dueDate.slice(0, 10) : new Date(c.dueDate).toISOString().slice(0, 10)) : '',
      groupCount: c.groupCount ?? 2,
    });
    setAddCardOpen(true);
  };

  const saveCard = (e) => {
    e.preventDefault();
    const name = cardForm.name?.trim();
    if (!name) {
      toast.error('Card name is required.');
      return;
    }
    if (!cardForm.startDate) {
      toast.error('Start date is required.');
      return;
    }
    if (!cardForm.dueDate) {
      toast.error('Due date is required.');
      return;
    }
    const card = {
      name,
      cardType: (cardForm.cardType || '').trim() || 'Project',
      quantity: Math.max(1, parseInt(cardForm.quantity, 10) || 1),
      isGroupCard: !!cardForm.isGroupCard,
      startDate: cardForm.startDate,
      dueDate: cardForm.dueDate,
      groupCount: cardForm.isGroupCard ? Math.max(1, parseInt(cardForm.groupCount, 10) || 1) : null,
      assignments: editingCardIndex !== null ? (pendingCards[editingCardIndex]?.assignments || []) : [],
    };
    if (editingCardIndex !== null) {
      setPendingCards((prev) => {
        const next = [...prev];
        next[editingCardIndex] = card;
        return next;
      });
    } else {
      setPendingCards((prev) => [...prev, card]);
    }
    setAddCardOpen(false);
    setEditingCardIndex(null);
    const today = new Date().toISOString().slice(0, 10);
    setCardForm({ name: '', cardType: '', quantity: 1, isGroupCard: false, startDate: today, dueDate: '', groupCount: 2 });
  };

  const closeCardForm = () => {
    setAddCardOpen(false);
    setEditingCardIndex(null);
    const today = new Date().toISOString().slice(0, 10);
    setCardForm({ name: '', cardType: '', quantity: 1, isGroupCard: false, startDate: today, dueDate: '', groupCount: 2 });
  };

  const deleteCardAt = (index) => {
    setPendingCards((prev) => prev.filter((_, i) => i !== index));
    setConfirmDeleteCardIndex(null);
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return '—';
    const d = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#F0F2E5]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Breadcrumb
          items={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'Workspaces', to: '/lecturer/workspaces' },
            { label: 'Create Workspace', to: null },
          ]}
        />

        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#172b4d]">Create Workspace</h1>
            <p className="text-sm text-[#5e6c84] mt-0.5">Setup a new project environment for your students.</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              className="btn btn-ghost rounded-xl border border-base-300 hover:bg-base-200"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn rounded-xl bg-[#3B613A] hover:bg-[#4a7549] border-0 text-white gap-2"
              onClick={handleSave}
              disabled={saving || actionLoading}
            >
              {saving || actionLoading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : null}
              Save Workspace
            </button>
          </div>
        </header>

        {saving && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <Loader size="lg" text="Creating workspace..." />
          </div>
        )}

        <div className="space-y-6 sm:space-y-8">
          {/* 1 Workspace Details — overflow-visible so Course dropdown is not clipped */}
          <section className="bg-base-100 rounded-xl border border-base-200/60 shadow-sm overflow-visible relative z-10">
            <div className="px-4 sm:px-6 py-3 border-b border-base-200/60 bg-[#3B613A]/5 rounded-t-xl">
              <h2 className="font-semibold text-[#172b4d] flex items-center gap-2 text-base sm:text-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#3B613A] text-white text-sm font-bold flex-shrink-0">1</span>
                Workspace Details
              </h2>
              <p className="text-xs text-[#5e6c84] mt-1 ml-9">Name, course, class, semester, and optional description.</p>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div>
                <label className="label py-0 mb-1">
                  <span className="label-text font-medium text-[#172b4d]">Workspace Name</span>
                  <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full rounded-xl h-11 border-base-300 focus:border-[#3B613A]/50 focus:outline-none transition-colors"
                  placeholder="e.g., UI/UX Final Project Fall 2023"
                  value={details.name}
                  onChange={(e) => setDetails((d) => ({ ...d, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="label py-0 mb-1">
                    <span className="label-text font-medium text-[#172b4d]">Course / Program</span>
                    <span className="text-error">*</span>
                  </label>
                  <Combobox
                    value={details.course}
                    onChange={(v) => setDetails((d) => ({ ...d, course: v }))}
                    options={courseOptions}
                    placeholder="e.g. Computer Science"
                    label=""
                    inputClassName="input input-bordered w-full rounded-xl h-11 border-base-300 text-sm focus:border-[#3B613A]/50 focus:outline-none"
                    dropdownClassName="z-[100]"
                  />
                </div>
                <div>
                  <label className="label py-0 mb-1">
                    <span className="label-text font-medium text-[#172b4d]">Class / Batch</span>
                    <span className="text-error">*</span>
                  </label>
                  <Combobox
                    value={details.classBatch}
                    onChange={(v) => setDetails((d) => ({ ...d, classBatch: v }))}
                    options={classBatchOptions}
                    placeholder="e.g. CS-01"
                    label=""
                    inputClassName="input input-bordered w-full rounded-xl h-11 border-base-300 text-sm focus:border-[#3B613A]/50 focus:outline-none"
                    dropdownClassName="z-[100]"
                  />
                </div>
                <div>
                  <label className="label py-0 mb-1">
                    <span className="label-text font-medium text-[#172b4d]">Semester</span>
                    <span className="text-error">*</span>
                  </label>
                  <Combobox
                    value={details.semester}
                    onChange={(v) => setDetails((d) => ({ ...d, semester: v }))}
                    options={semesterOptions}
                    placeholder="e.g. Odd 2025"
                    label=""
                    inputClassName="input input-bordered w-full rounded-xl h-11 border-base-300 text-sm focus:border-[#3B613A]/50 focus:outline-none"
                    dropdownClassName="z-[100]"
                  />
                </div>
              </div>
              <div>
                <label className="label py-0 mb-1">
                  <span className="label-text font-medium text-[#172b4d]">Description</span>
                  <span className="text-[#5e6c84] text-xs ml-1">(optional, max {DESCRIPTION_MAX} characters)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full rounded-xl border-base-300 min-h-[88px] text-sm resize-y focus:border-[#3B613A]/50 focus:outline-none transition-colors"
                  placeholder="Brief description of the workspace and project goals..."
                  value={details.description}
                  onChange={(e) => setDetails((d) => ({ ...d, description: e.target.value.slice(0, DESCRIPTION_MAX) }))}
                  maxLength={DESCRIPTION_MAX}
                />
                <p className="text-right text-xs text-[#5e6c84] mt-0.5">
                  {details.description.length} / {DESCRIPTION_MAX}
                </p>
              </div>
            </div>
          </section>

          {/* 2 Create & Define Cards (Projects) */}
          <section className="bg-base-100 rounded-xl border border-base-200/60 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-3 border-b border-base-200/60 bg-[#3B613A]/5 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold text-[#172b4d] flex items-center gap-2 text-base sm:text-lg">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#3B613A] text-white text-sm font-bold flex-shrink-0">2</span>
                  Create & Define Cards (Projects)
                </h2>
                <p className="text-xs text-[#5e6c84] mt-1 ml-9">Define each project card, then click Assign to add students (manual or upload) and assign them to slots or groups.</p>
              </div>
              {!addCardOpen && (
                <button
                  type="button"
                  className="btn btn-sm rounded-xl bg-[#3B613A] hover:bg-[#4a7549] border-0 text-white gap-1.5 flex-shrink-0"
                  onClick={openAddCard}
                >
                  <FiPlus className="w-4 h-4" />
                  Add New Card
                </button>
              )}
            </div>
            <div className="p-4 sm:p-6 space-y-5">
              {addCardOpen && (
                <form onSubmit={saveCard} className="p-4 sm:p-5 rounded-xl border-2 border-[#3B613A]/25 bg-[#3B613A]/5 space-y-5">
                  <h3 className="font-semibold text-[#172b4d] text-sm border-b border-base-200/60 pb-2">
                    {editingCardIndex !== null ? 'Edit this card' : 'New project card — fill in the fields below'}
                  </h3>
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
                        <input
                          type="radio"
                          name="cardType"
                          className="radio radio-sm radio-primary"
                          checked={!cardForm.isGroupCard}
                          onChange={() => setCardForm((c) => ({ ...c, isGroupCard: false }))}
                        />
                        Individual
                      </label>
                      <label
                        className={`flex items-center gap-2 cursor-pointer text-sm text-[#172b4d] px-3 py-2.5 rounded-lg border-2 transition-colors ${
                          cardForm.isGroupCard ? 'border-[#3B613A] bg-[#3B613A]/10' : 'border-base-200 bg-base-100 hover:border-[#3B613A]/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name="cardType"
                          className="radio radio-sm radio-primary"
                          checked={cardForm.isGroupCard}
                          onChange={() => setCardForm((c) => ({ ...c, isGroupCard: true }))}
                        />
                        Group
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label py-0 mb-1">
                        <span className="label-text font-medium text-[#172b4d]">
                          {cardForm.isGroupCard ? 'Students per group' : 'Quantity'}
                        </span>
                      </label>
                      <p className="text-xs text-[#5e6c84] mb-1">
                        {cardForm.isGroupCard ? 'Number of students in each group.' : 'Number of individual slots.'}
                      </p>
                      <input
                        type="number"
                        min={1}
                        className="input input-bordered w-full rounded-xl h-11"
                        value={cardForm.quantity}
                        onChange={(e) =>
                          setCardForm((c) => ({ ...c, quantity: Math.max(1, parseInt(e.target.value, 10) || 1) }))
                        }
                      />
                    </div>
                    {cardForm.isGroupCard && (
                      <div>
                        <label className="label py-0 mb-1">
                          <span className="label-text font-medium text-[#172b4d]">Number of groups</span>
                        </label>
                        <p className="text-xs text-[#5e6c84] mb-1">Total groups for this card.</p>
                        <input
                          type="number"
                          min={1}
                          className="input input-bordered w-full rounded-xl h-11"
                          value={cardForm.groupCount}
                          onChange={(e) =>
                            setCardForm((c) => ({ ...c, groupCount: Math.max(1, parseInt(e.target.value, 10) || 1) }))
                          }
                        />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label py-0 mb-1">
                        <span className="label-text font-medium text-[#172b4d] flex items-center gap-1">
                          <FiCalendar className="w-4 h-4 text-[#3B613A]" />
                          Start date
                        </span>
                        <span className="text-error">*</span>
                      </label>
                      <p className="text-xs text-[#5e6c84] mb-1">When this card becomes visible to students.</p>
                      <input
                        type="date"
                        className="input input-bordered w-full rounded-xl h-11"
                        value={cardForm.startDate}
                        onChange={(e) => setCardForm((c) => ({ ...c, startDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="label py-0 mb-1">
                        <span className="label-text font-medium text-[#172b4d] flex items-center gap-1">
                          <FiCalendar className="w-4 h-4 text-[#3B613A]" />
                          Due date
                        </span>
                        <span className="text-error">*</span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered w-full rounded-xl h-11"
                        value={cardForm.dueDate}
                        onChange={(e) => setCardForm((c) => ({ ...c, dueDate: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button type="submit" className="btn btn-sm bg-[#3B613A] hover:bg-[#4a7549] border-0 text-white rounded-xl">
                      {editingCardIndex !== null ? 'Save card' : 'Add card'}
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm rounded-xl" onClick={closeCardForm}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {pendingCards.length > 0 ? (
                <div>
                  <p className="text-sm font-medium text-[#172b4d] mb-3">
                    Your cards ({pendingCards.length}) — you can edit or remove any before saving the workspace.
                  </p>
                  <ul className="space-y-3">
                    {pendingCards.map((card, index) => (
                      <li
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-base-200/60 bg-base-200/20 hover:border-[#3B613A]/30 transition-colors group"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-[#172b4d]">{card.name}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                            <span className="px-2 py-0.5 rounded-md bg-[#3B613A]/10 text-[#3B613A] font-medium">
                              {card.isGroupCard ? 'Group' : 'Individual'}
                            </span>
                            <span className="text-[#5e6c84]">
                              {card.isGroupCard
                                ? `${card.groupCount ?? 2} groups × ${card.quantity} students`
                                : `Quantity: ${card.quantity}`}
                            </span>
                            {card.startDate && (
                              <span className="flex items-center gap-0.5 text-[#5e6c84]">
                                <FiCalendar className="w-3.5 h-3.5" />
                                From {formatDueDate(card.startDate)}
                              </span>
                            )}
                            {card.dueDate && (
                              <span className="flex items-center gap-0.5 text-[#5e6c84]">
                                <FiCalendar className="w-3.5 h-3.5" />
                                Due {formatDueDate(card.dueDate)}
                              </span>
                            )}
                            {(() => {
                              const assignments = card.assignments || [];
                              if (card.isGroupCard) {
                                const totalAssigned = assignments.reduce((sum, a) => sum + (a.memberIds?.length || 0), 0);
                                return (
                                  <span className="text-[#3B613A] font-medium flex items-center gap-0.5">
                                    <FiUsers className="w-3.5 h-3.5" />
                                    {totalAssigned} assigned
                                  </span>
                                );
                              }
                              const assignedCount = assignments.filter((a) => a.studentId).length;
                              return (
                                <span className="text-[#3B613A] font-medium">
                                  {assignedCount}/{card.quantity} assigned
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 flex-wrap justify-end sm:justify-start">
                          <button
                            type="button"
                            className="btn btn-sm rounded-lg bg-[#3B613A]/10 hover:bg-[#3B613A]/20 text-[#3B613A] gap-1.5"
                            onClick={() => setAssignModalCardIndex(index)}
                          >
                            <FiUsers className="w-4 h-4" />
                            Assign
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm btn-square text-[#5e6c84] hover:bg-[#3B613A]/10 hover:text-[#3B613A]"
                            onClick={() => openEditCard(index)}
                            aria-label="Edit card"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm btn-square text-[#5e6c84] hover:bg-error/10 hover:text-error"
                            onClick={() => setConfirmDeleteCardIndex(index)}
                            aria-label="Delete card"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : !addCardOpen && (
                <div className="text-center py-6 sm:py-8 rounded-xl border-2 border-dashed border-base-300 bg-base-200/20">
                  <p className="text-sm text-[#5e6c84] mb-2">No project cards yet.</p>
                  <p className="text-xs text-[#5e6c84] mb-4 max-w-sm mx-auto">
                    Click &quot;Add New Card&quot; to define each project or assignment, then use &quot;Assign&quot; to assign students from the enrollment list.
                  </p>
                  <button
                    type="button"
                    className="btn btn-sm rounded-xl bg-[#3B613A] hover:bg-[#4a7549] border-0 text-white gap-1.5"
                    onClick={openAddCard}
                  >
                    <FiPlus className="w-4 h-4" />
                    Add New Card
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <ConfirmModal
        open={stepConfirmCancel}
        onClose={() => setStepConfirmCancel(false)}
        onConfirm={doCancel}
        title="Discard changes?"
        message="You have unsaved changes. Leave without saving?"
        confirmLabel="Leave"
        cancelLabel="Stay"
        variant="danger"
      />

      <ConfirmModal
        open={stepConfirmSave}
        onClose={() => setStepConfirmSave(false)}
        onConfirm={doSave}
        title="Save Workspace"
        message="Create this workspace with the entered details, enrolled students, and project cards?"
        confirmLabel="Save Workspace"
        cancelLabel="Cancel"
        variant="primary"
      />

      <ConfirmModal
        open={confirmDeleteCardIndex !== null}
        onClose={() => setConfirmDeleteCardIndex(null)}
        onConfirm={() => deleteCardAt(confirmDeleteCardIndex)}
        title="Delete card"
        message={
          confirmDeleteCardIndex !== null && pendingCards[confirmDeleteCardIndex]
            ? `Remove "${pendingCards[confirmDeleteCardIndex].name}" from the list?`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />

      <CardAssignmentModal
        open={assignModalCardIndex !== null}
        onClose={() => setAssignModalCardIndex(null)}
        card={assignModalCardIndex !== null ? pendingCards[assignModalCardIndex] : null}
        students={pendingStudents}
        onSave={(assignments) => {
          if (assignModalCardIndex === null) return;
          setPendingCards((prev) => {
            const next = [...prev];
            next[assignModalCardIndex] = { ...next[assignModalCardIndex], assignments };
            return next;
          });
          setAssignModalCardIndex(null);
        }}
        showPoolManagement
        onDownloadTemplate={handleDownloadTemplate}
        onFileSelect={handleFileSelectInModal}
        fileInputRef={fileInputRef}
        uploadProgress={uploadProgress}
        uploadStatus={uploadStatus}
        uploadFileName={uploadFileName}
        onSearchStudents={searchStudents}
        onAddStudent={addStudentToPool}
      />
    </div>
  );
}
