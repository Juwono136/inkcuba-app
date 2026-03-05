import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Breadcrumb from '../common/Breadcrumb';
import Loader from '../common/Loader';
import ConfirmModal from '../common/ConfirmModal';
import { api } from '../utils/axios';
import toast from 'react-hot-toast';
import {
  FiFileText,
  FiImage,
  FiLink,
  FiPlus,
  FiTrash2,
  FiSave,
  FiSend,
  FiFolder,
} from 'react-icons/fi';

const STEPS = [
  { id: 1, label: 'Project Details' },
  { id: 2, label: 'Media & Files' },
  { id: 3, label: 'Review & Submit' },
];

const CATEGORY_OPTIONS = [
  'Web Application',
  'Mobile App',
  'UI/UX Design',
  'Software Engineering',
  'Data Science',
  'Game Development',
  'Other',
];

const API_BASE = import.meta.env.VITE_API_URL || '';

const MAX_POSTER_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_PDF_SIZE = 20 * 1024 * 1024;     // 20MB
const MAX_VIDEO_URL = 500;
const MAX_LINK_TITLE = 120;
const MAX_LINK_URL = 500;

/** Student can edit when status is not in review (approved, published, taken_down). */
const EDITABLE_STATUSES = ['draft', 'submitted', 'need_revision'];
/** Student can delete only before lecturer has requested revision. */
const DELETABLE_STATUSES = ['draft', 'submitted'];

function getVideoEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const u = url.trim();
  const ytMatch = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

function portfolioFileUrl(submissionId, key) {
  if (!key || typeof key !== 'string') return '';
  const filename = key.split('/').pop();
  return `${API_BASE}/api/uploads/portfolios/${submissionId}/${filename}`;
}

function isValidUrl(s) {
  if (!s || typeof s !== 'string') return false;
  try {
    const u = new URL(s.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function StudentSubmitPortfolioPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const workspaceId = searchParams.get('workspaceId');
  const cardId = searchParams.get('cardId');

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  const [form, setForm] = useState({
    projectName: '',
    description: '',
    category: '',
    tags: '',
    videoUrl: '',
    externalLinks: [{ title: '', url: '' }, { title: '', url: '' }],
  });
  const [screenshots, setScreenshots] = useState([]);
  const [projectPoster, setProjectPoster] = useState('');
  const [detailedReport, setDetailedReport] = useState('');
  const [uploading, setUploading] = useState({ screenshot: null, poster: false, report: false });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [mediaErrors, setMediaErrors] = useState({ videoUrl: '', externalLinks: [], upload: '' });

  const loadDraft = useCallback(async () => {
    if (!workspaceId || !cardId) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.post('/api/student/submissions', { workspaceId, cardId });
      const sub = data.submission;
      setSubmission(sub);
      setForm({
        projectName: sub.projectName || '',
        description: sub.description || '',
        category: sub.category || '',
        tags: Array.isArray(sub.tags) ? sub.tags.join(', ') : (sub.tags || ''),
        videoUrl: sub.videoUrl || '',
        externalLinks: (sub.externalLinks && sub.externalLinks.length > 0)
          ? sub.externalLinks.map((l) => ({ title: l.title || '', url: l.url || '' }))
          : [{ title: '', url: '' }, { title: '', url: '' }],
      });
      setScreenshots(sub.screenshots || []);
      setProjectPoster(sub.projectPoster || '');
      setDetailedReport(sub.detailedReport || '');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load submission');
      setSubmission(null);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, cardId]);

  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  const saveDraft = async () => {
    if (!submission || !EDITABLE_STATUSES.includes(submission.status)) return null;
    setSaving(true);
    const links = form.externalLinks
      .filter((l) => l.title.trim() || l.url.trim())
      .slice(0, 3)
      .map((l) => ({ title: l.title.trim(), url: l.url.trim() }));
    try {
      const { data } = await api.patch(`/api/student/submissions/${submission.id}`, {
        projectName: form.projectName.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        videoUrl: form.videoUrl.trim(),
        externalLinks: links,
        screenshots,
        projectPoster,
        detailedReport,
      });
      setSubmission(data.submission);
      toast.success(submission.status === 'draft' ? 'Draft saved' : 'Changes saved');
      return data.submission;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const validateMediaStep = useCallback(() => {
    const errors = { videoUrl: '', externalLinks: [], upload: '' };
    if (form.videoUrl.trim()) {
      if (form.videoUrl.length > MAX_VIDEO_URL) errors.videoUrl = 'Video URL is too long.';
      else if (!isValidUrl(form.videoUrl)) errors.videoUrl = 'Please enter a valid URL (e.g. https://youtube.com/...).';
    }
    form.externalLinks.forEach((l, i) => {
      if (!l.url.trim()) errors.externalLinks[i] = '';
      else if (!isValidUrl(l.url)) errors.externalLinks[i] = 'Please enter a valid URL.';
      else errors.externalLinks[i] = '';
    });
    setMediaErrors(errors);
    return !errors.videoUrl && errors.externalLinks.every((e) => !e);
  }, [form.videoUrl, form.externalLinks]);

  const handleFile = async (file, type, index) => {
    if (!submission || !EDITABLE_STATUSES.includes(submission.status)) return;
    setMediaErrors((e) => ({ ...e, upload: '' }));
    const isImage = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type);
    const isPdf = file.type === 'application/pdf';
    if (type === 'screenshot' || type === 'poster') {
      if (!isImage) {
        toast.error('Please use a valid image (PNG, JPG, WebP).');
        setMediaErrors((e) => ({ ...e, upload: 'Invalid file type for image.' }));
        return;
      }
      if (file.size > MAX_POSTER_SIZE) {
        toast.error('Image must be 10MB or smaller.');
        setMediaErrors((e) => ({ ...e, upload: 'File too large (max 10MB).' }));
        return;
      }
    }
    if (type === 'report') {
      if (!isPdf) {
        toast.error('Please use a PDF file.');
        setMediaErrors((e) => ({ ...e, upload: 'Only PDF is allowed.' }));
        return;
      }
      if (file.size > MAX_PDF_SIZE) {
        toast.error('PDF must be 20MB or smaller.');
        setMediaErrors((e) => ({ ...e, upload: 'File too large (max 20MB).' }));
        return;
      }
    }
    if (type === 'screenshot') setUploading((u) => ({ ...u, screenshot: index }));
    if (type === 'poster') setUploading((u) => ({ ...u, poster: true }));
    if (type === 'report') setUploading((u) => ({ ...u, report: true }));
    const fd = new FormData();
    if (type === 'screenshot') {
      fd.append('screenshot', file);
      fd.append('index', String(index));
    } else if (type === 'poster') fd.append('poster', file);
    else fd.append('report', file);

    const endpoint = type === 'screenshot'
      ? `/api/student/submissions/${submission.id}/upload-screenshot`
      : type === 'poster'
        ? `/api/student/submissions/${submission.id}/upload-poster`
        : `/api/student/submissions/${submission.id}/upload-report`;

    try {
      const { data } = await api.post(endpoint, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (type === 'screenshot') {
        const next = [...screenshots];
        next[index] = data.key;
        setScreenshots(next.slice(0, 5));
      } else if (type === 'poster') setProjectPoster(data.key);
      else setDetailedReport(data.key);
      toast.success('File uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
      setMediaErrors((e) => ({ ...e, upload: err.response?.data?.message || 'Upload failed.' }));
    } finally {
      if (type === 'screenshot') setUploading((u) => ({ ...u, screenshot: null }));
      if (type === 'poster') setUploading((u) => ({ ...u, poster: false }));
      if (type === 'report') setUploading((u) => ({ ...u, report: false }));
    }
  };

  const handleSubmitConfirm = async () => {
    if (!submission) return;
    setSaving(true);
    try {
      const updated = await saveDraft();
      if (updated) {
        await api.post(`/api/student/submissions/${updated.id}/submit`);
        toast.success('Portfolio submitted');
        setConfirmSubmitOpen(false);
        navigate('/student/workspace');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submit failed');
    } finally {
      setSaving(false);
    }
  };

  const addLink = () => {
    setForm((f) => ({
      ...f,
      externalLinks: [...f.externalLinks, { title: '', url: '' }].slice(0, 3),
    }));
  };
  const removeLink = (i) => {
    setForm((f) => ({
      ...f,
      externalLinks: f.externalLinks.filter((_, idx) => idx !== i),
    }));
  };
  const setLink = (i, field, value) => {
    setForm((f) => ({
      ...f,
      externalLinks: f.externalLinks.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-6 flex justify-center items-center min-h-[60vh]">
          <Loader text="Loading..." />
        </main>
      </div>
    );
  }

  if (!workspaceId || !cardId) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-6">
          <Breadcrumb items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'My Workspace', to: '/student/workspace' }, { label: 'Submit Portfolio' }]} />
          <div className="mt-8 p-8 rounded-2xl border-2 border-dashed border-base-300 bg-base-100 text-center">
            <FiFolder className="w-12 h-12 text-[#5e6c84] mx-auto mb-3" />
            <p className="text-[#172b4d] font-medium">Select a card to submit</p>
            <p className="text-sm text-[#5e6c84] mt-1">Go to My Workspace and click &quot;Submit portfolio&quot; on a card.</p>
            <button type="button" className="btn btn-sm mt-4 bg-[#3B613A] text-white border-0" onClick={() => navigate('/student/workspace')}>
              My Workspace
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-6">
          <div className="p-4 rounded-xl bg-error/10 text-error">Could not load submission. You may not be assigned to this card.</div>
          <button type="button" className="btn btn-ghost mt-4" onClick={() => navigate('/student/workspace')}>Back to Workspace</button>
        </main>
      </div>
    );
  }

  const isLocked = !EDITABLE_STATUSES.includes(submission.status);
  if (isLocked) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-6">
          <Breadcrumb items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'My Workspace', to: '/student/workspace' }, { label: 'Portfolio' }]} />
          <div className="mt-8 p-8 rounded-2xl border border-base-200 bg-base-100 text-center">
            <FiSend className="w-12 h-12 text-[#3B613A] mx-auto mb-3" />
            <p className="text-[#172b4d] font-medium">This portfolio is in review or completed</p>
            <p className="text-sm text-[#5e6c84] mt-1">Status: {submission.status}. You can no longer edit it. Check notifications for updates.</p>
            <button type="button" className="btn btn-sm mt-4 bg-[#3B613A] text-white border-0" onClick={() => navigate('/student/workspace')}>Back to Workspace</button>
          </div>
        </main>
      </div>
    );
  }

  const isStep1Valid =
    form.projectName.trim().length > 0 &&
    form.description.trim().length > 0 &&
    form.category.trim().length > 0;

  const canSubmit = isStep1Valid;
  const linksForSubmit = form.externalLinks.filter((l) => l.title.trim() || l.url.trim()).slice(0, 3);
  const pageTitle =
    submission.status === 'need_revision'
      ? 'Revise your portfolio'
      : submission.status === 'submitted'
        ? 'Edit your submission'
        : 'Submit new project';
  const showSubmitButton = submission.status === 'draft' || submission.status === 'need_revision';
  const submitButtonLabel = submission.status === 'need_revision' ? 'Submit revision' : 'Submit';
  const canDelete = DELETABLE_STATUSES.includes(submission.status);

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-12">
        <Breadcrumb
          items={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'My Workspace', to: '/student/workspace' },
            { label: submission.status === 'need_revision' ? 'Revise portfolio' : submission.status === 'submitted' ? 'Edit portfolio' : 'Submit portfolio' },
          ]}
        />

        {submission.status === 'need_revision' && submission.feedback && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-left">
            <p className="font-medium text-amber-800 text-sm">Feedback from your lecturer</p>
            <p className="text-sm text-amber-900 mt-1">{submission.feedback}</p>
            <p className="text-xs text-amber-700 mt-2">Update your portfolio below and click &quot;Submit revision&quot; when ready.</p>
          </div>
        )}

        <h1 className="text-2xl font-bold text-[#172b4d] mt-4">{pageTitle}</h1>
        <p className="text-sm text-[#5e6c84] mt-1">
          {submission.status === 'submitted' && 'You can still edit until your lecturer reviews. Save changes or delete this submission.'}
          {submission.status === 'need_revision' && 'Make the requested changes and submit your revision.'}
          {submission.status === 'draft' && 'Fill in all required fields (Step 1) to continue to media and review.'}
        </p>
        <div className="flex flex-wrap gap-2 mt-3 mb-2">
          {STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                if (s.id === 1 || isStep1Valid) {
                  setStep(s.id);
                }
              }}
              disabled={s.id > 1 && !isStep1Valid}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                step === s.id
                  ? 'bg-[#3B613A] text-white shadow-sm'
                  : s.id > 1 && !isStep1Valid
                    ? 'bg-base-200 text-[#c0c6d0] cursor-not-allowed'
                    : 'bg-base-200 text-[#5e6c84] hover:bg-base-300'
              }`}
            >
              {s.id}. {s.label}
            </button>
          ))}
        </div>
        {!isStep1Valid && (
          <p className="text-xs text-[#5e6c84] mb-4">Complete all required fields in Step 1 (Project name, Description, Category) to continue.</p>
        )}

        {step === 1 && (
          <section className="bg-base-100 rounded-2xl border border-base-200/60 shadow-sm p-4 sm:p-6 space-y-4 animate-in fade-in duration-150">
            <h2 className="font-semibold text-[#172b4d] flex items-center gap-2">
              <FiFileText className="w-5 h-5 text-[#3B613A]" />
              Basic Information
            </h2>
            <div>
              <label className="label py-0 mb-1"><span className="label-text font-medium">Project Name *</span></label>
              <input
                type="text"
                className="input input-bordered w-full rounded-xl"
                placeholder="e.g. Smart City Mobile App"
                value={form.projectName}
                onChange={(e) => setForm((f) => ({ ...f, projectName: e.target.value }))}
              />
            </div>
            <div>
              <label className="label py-0 mb-1"><span className="label-text font-medium">Project Description *</span></label>
              <p className="text-xs text-[#5e6c84] mb-1">Provide a comprehensive overview of your project, its goals, and your role.</p>
              <textarea
                className="textarea textarea-bordered w-full rounded-xl min-h-[120px]"
                placeholder="Describe your project..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <label className="label py-0 mb-1"><span className="label-text font-medium">Category *</span></label>
              <select
                className="select select-bordered w-full rounded-xl"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                <option value="">Select a category</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label py-0 mb-1"><span className="label-text font-medium">Tags</span></label>
              <input
                type="text"
                className="input input-bordered w-full rounded-xl"
                placeholder="e.g. React, UI/UX, AI (comma separated)"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              />
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-6 animate-in fade-in duration-150">
            <div className="bg-base-100 rounded-2xl border border-base-200/60 shadow-sm p-4 sm:p-6 space-y-4">
              <h2 className="font-semibold text-[#172b4d] flex items-center gap-2">
                <FiImage className="w-5 h-5 text-[#3B613A]" />
                Media & Visuals
              </h2>
              <div>
                <label className="label py-0 mb-1"><span className="label-text font-medium">Project Screenshots (Up to 5)</span></label>
                <div className="flex flex-wrap gap-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="relative w-24 h-24 rounded-xl border-2 border-dashed border-base-300 flex items-center justify-center overflow-hidden bg-base-200/30 group transition-transform duration-150 hover:-translate-y-0.5"
                    >
                      {screenshots[i] ? (
                        <>
                          <img src={portfolioFileUrl(submission.id, screenshots[i])} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            className="absolute top-1 right-1 btn btn-ghost btn-xs btn-circle bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              setScreenshots((prev) => {
                                const next = [...prev];
                                next[i] = undefined;
                                return next;
                              });
                            }}
                            aria-label="Remove screenshot"
                          >
                            <FiTrash2 className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <label className="cursor-pointer w-full h-full flex items-center justify-center">
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            disabled={uploading.screenshot !== null}
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f, 'screenshot', i); e.target.value = ''; }}
                          />
                          {uploading.screenshot === i ? <span className="loading loading-spinner loading-sm" /> : <FiPlus className="w-6 h-6 text-[#5e6c84]" />}
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="label py-0 mb-1"><span className="label-text font-medium">Project Poster</span></label>
                <p className="text-xs text-[#5e6c84] mb-2">PNG, JPG up to 10MB. This image will represent your project.</p>
                {projectPoster ? (
                  <div className="rounded-xl border border-base-200/70 bg-base-200/20 overflow-hidden flex flex-col sm:flex-row sm:items-center gap-4 p-4">
                    <div className="flex-shrink-0 w-full sm:w-40 h-32 rounded-lg overflow-hidden bg-base-300 border border-base-200">
                      <img src={portfolioFileUrl(submission.id, projectPoster)} alt="Poster" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-[#3B613A]">Uploaded</span>
                      <label className="btn btn-ghost btn-sm rounded-lg gap-1 text-[#172b4d] cursor-pointer">
                        <FiImage className="w-4 h-4" />
                        Replace
                        <input type="file" accept="image/jpeg,image/png,image/jpg" className="hidden" disabled={uploading.poster} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f, 'poster'); e.target.value = ''; }} />
                      </label>
                      <button type="button" className="btn btn-ghost btn-sm rounded-lg gap-1 text-error hover:bg-error/10" onClick={() => setProjectPoster('')}>
                        <FiTrash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-base-300 bg-base-200/30 p-8 cursor-pointer hover:border-[#3B613A]/40 hover:bg-base-200/50 transition-colors">
                    <input type="file" accept="image/jpeg,image/png,image/jpg" className="hidden" disabled={uploading.poster} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f, 'poster'); e.target.value = ''; }} />
                    {uploading.poster ? <span className="loading loading-spinner loading-md text-[#3B613A]" /> : <><FiImage className="w-12 h-12 text-[#5e6c84] mb-2" /><p className="text-sm font-medium text-[#172b4d]">Upload poster</p><p className="text-xs text-[#5e6c84] mt-0.5">PNG or JPG, max 10MB</p></>}
                  </label>
                )}
              </div>
              <div>
                <label className="label py-0 mb-1"><span className="label-text font-medium">Detailed Report (PDF)</span></label>
                <p className="text-xs text-[#5e6c84] mb-2">PDF up to 20MB. Optional project report or documentation.</p>
                {detailedReport ? (
                  <div className="rounded-xl border border-base-200/70 bg-base-200/20 flex flex-col sm:flex-row sm:items-center gap-4 p-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-error/10 flex items-center justify-center">
                      <FiFileText className="w-8 h-8 text-error" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#172b4d]">report.pdf</p>
                      <p className="text-xs text-[#5e6c84]">PDF uploaded. Lecturer can open from review.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <label className="btn btn-ghost btn-sm rounded-lg gap-1 text-[#172b4d] cursor-pointer">
                        <FiFileText className="w-4 h-4" />
                        Replace
                        <input type="file" accept="application/pdf" className="hidden" disabled={uploading.report} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f, 'report'); e.target.value = ''; }} />
                      </label>
                      <button type="button" className="btn btn-ghost btn-sm rounded-lg gap-1 text-error hover:bg-error/10" onClick={() => setDetailedReport('')}>
                        <FiTrash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-base-300 bg-base-200/30 p-8 cursor-pointer hover:border-[#3B613A]/40 hover:bg-base-200/50 transition-colors">
                    <input type="file" accept="application/pdf" className="hidden" disabled={uploading.report} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f, 'report'); e.target.value = ''; }} />
                    {uploading.report ? <span className="loading loading-spinner loading-md text-[#3B613A]" /> : <><FiFileText className="w-12 h-12 text-[#5e6c84] mb-2" /><p className="text-sm font-medium text-[#172b4d]">Upload PDF report</p><p className="text-xs text-[#5e6c84] mt-0.5">PDF only, max 20MB</p></>}
                  </label>
                )}
              </div>
              {mediaErrors.upload && <p className="text-sm text-error">{mediaErrors.upload}</p>}
            </div>
            <div className="bg-base-100 rounded-2xl border border-base-200/60 shadow-sm p-4 sm:p-6 space-y-4">
              <h2 className="font-semibold text-[#172b4d] flex items-center gap-2">
                <FiLink className="w-5 h-5 text-[#3B613A]" />
                Links & Additional Resources
              </h2>
              <div>
                <label className="label py-0 mb-1"><span className="label-text font-medium">Presentation Video URL</span></label>
                <p className="text-xs text-[#5e6c84] mb-1">Optional. YouTube or Vimeo link; will be shown as embed for reviewers.</p>
                <input
                  type="url"
                  className={`input w-full rounded-xl ${mediaErrors.videoUrl ? 'input-error border-error' : 'input-bordered'}`}
                  placeholder="e.g. https://www.youtube.com/watch?v=..."
                  value={form.videoUrl}
                  maxLength={MAX_VIDEO_URL}
                  onChange={(e) => { setForm((f) => ({ ...f, videoUrl: e.target.value.slice(0, MAX_VIDEO_URL) })); setMediaErrors((m) => ({ ...m, videoUrl: '' })); }}
                />
                {mediaErrors.videoUrl && <p className="text-sm text-error mt-1">{mediaErrors.videoUrl}</p>}
                {form.videoUrl.trim() && getVideoEmbedUrl(form.videoUrl) && !mediaErrors.videoUrl && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-base-200/60 aspect-video max-w-lg">
                    <iframe
                      title="Video preview"
                      src={getVideoEmbedUrl(form.videoUrl)}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="label py-0 mb-1"><span className="label-text font-medium">External Links (Up to 3)</span></label>
                <p className="text-xs text-[#5e6c84] mb-2">Add links to your live project, GitHub repository, or design files. URL must be valid (https).</p>
                {form.externalLinks.map((l, i) => (
                  <div key={i} className="flex flex-wrap gap-2 mb-2">
                    <input type="text" className="input input-bordered flex-1 min-w-[120px] rounded-lg input-sm" placeholder="Link Title" maxLength={MAX_LINK_TITLE} value={l.title} onChange={(e) => setLink(i, 'title', e.target.value.slice(0, MAX_LINK_TITLE))} />
                    <input type="url" className={`input flex-1 min-w-[120px] rounded-lg input-sm ${mediaErrors.externalLinks[i] ? 'input-error border-error' : 'input-bordered'}`} placeholder="https://..." maxLength={MAX_LINK_URL} value={l.url} onChange={(e) => { setLink(i, 'url', e.target.value.slice(0, MAX_LINK_URL)); setMediaErrors((m) => ({ ...m, externalLinks: m.externalLinks.map((err, j) => (j === i ? '' : err)) })); }} />
                    <button type="button" className="btn btn-ghost btn-sm btn-square text-error" onClick={() => removeLink(i)} aria-label="Remove"><FiTrash2 className="w-4 h-4" /></button>
                    {mediaErrors.externalLinks[i] && <p className="text-xs text-error w-full mt-0.5">{mediaErrors.externalLinks[i]}</p>}
                  </div>
                ))}
                {form.externalLinks.length < 3 && (
                  <button type="button" className="btn btn-ghost btn-sm gap-1 text-[#3B613A]" onClick={addLink}><FiPlus className="w-4 h-4" /> Add another link</button>
                )}
              </div>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-6 animate-in fade-in duration-150">
            <div className="bg-base-100 rounded-2xl border border-base-200/60 shadow-sm overflow-hidden">
              <div className="px-4 sm:px-6 py-3 border-b border-base-200/60 bg-gradient-to-r from-[#3B613A]/10 to-transparent">
                <h2 className="font-semibold text-[#172b4d]">Review your project</h2>
                <p className="text-xs text-[#5e6c84] mt-0.5">This is how your portfolio will appear to your lecturer. Submit when ready.</p>
              </div>
              <div className="p-4 sm:p-6 space-y-6">
                <div className="rounded-xl bg-base-200/30 p-4 sm:p-5 border border-base-200/60">
                  <h3 className="text-sm font-semibold text-[#172b4d] mb-3 flex items-center gap-2">
                    <FiFileText className="w-4 h-4 text-[#3B613A]" />
                    Project overview
                  </h3>
                  <p className="font-medium text-[#172b4d] text-lg">{form.projectName || '—'}</p>
                  {form.category && <p className="text-sm text-[#5e6c84] mt-0.5">{form.category}</p>}
                  <p className="text-sm text-[#172b4d] mt-3 whitespace-pre-wrap">{form.description || '—'}</p>
                  {form.tags.trim() && <p className="text-xs text-[#5e6c84] mt-2">Tags: {form.tags}</p>}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#172b4d] mb-3 flex items-center gap-2">
                    <FiImage className="w-4 h-4 text-[#3B613A]" />
                    Media
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {screenshots.filter(Boolean).map((key, i) => (
                      <div key={i} className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-base-200 shadow-sm flex-shrink-0">
                        <img src={portfolioFileUrl(submission.id, key)} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {projectPoster && (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 border-[#3B613A]/30 shadow-sm flex-shrink-0">
                        <img src={portfolioFileUrl(submission.id, projectPoster)} alt="Poster" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {detailedReport && (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border border-base-200 bg-base-200/50 flex items-center justify-center flex-shrink-0">
                        <FiFileText className="w-10 h-10 text-[#5e6c84]" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-[#5e6c84] mt-2">
                    {screenshots.filter(Boolean).length} screenshot(s), {projectPoster ? 'poster' : 'no poster'}, {detailedReport ? 'PDF report' : 'no report'}
                  </p>
                </div>

                {form.videoUrl.trim() && getVideoEmbedUrl(form.videoUrl) && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#172b4d] mb-2 flex items-center gap-2">
                      <FiLink className="w-4 h-4 text-[#3B613A]" />
                      Video
                    </h3>
                    <div className="rounded-xl overflow-hidden border border-base-200/60 aspect-video max-w-2xl">
                      <iframe title="Video" src={getVideoEmbedUrl(form.videoUrl)} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                    </div>
                  </div>
                )}

                {linksForSubmit.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#172b4d] mb-2 flex items-center gap-2">
                      <FiLink className="w-4 h-4 text-[#3B613A]" />
                      External links
                    </h3>
                    <ul className="space-y-1">
                      {linksForSubmit.map((l, i) => (
                        <li key={i} className="text-sm">
                          <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-[#3B613A] hover:underline truncate block max-w-full">{l.title || l.url}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <div className="flex flex-wrap gap-2 justify-between mt-8">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-ghost rounded-xl"
              onClick={saveDraft}
              disabled={saving}
            >
              {saving ? <span className="loading loading-spinner loading-sm" /> : <FiSave className="w-4 h-4" />}
              {submission.status === 'draft' ? 'Save as draft' : 'Save changes'}
            </button>
            {canDelete && (
              <button
                type="button"
                className="btn btn-outline btn-error rounded-xl"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                <FiTrash2 className="w-4 h-4" />
                {submission.status === 'draft' ? 'Delete draft' : 'Delete submission'}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {step < 3 && (
              <button
                type="button"
                className="btn rounded-xl bg-[#3B613A] border-0 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  if (step === 1 && !isStep1Valid) return;
                  setStep(step + 1);
                }}
                disabled={step === 1 && !isStep1Valid}
              >
                Continue to Review →
              </button>
            )}
            {step === 3 && showSubmitButton && (
              <button type="button" className="btn rounded-xl bg-[#3B613A] border-0 text-white disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => setConfirmSubmitOpen(true)} disabled={!canSubmit || saving}>
                <FiSend className="w-4 h-4" /> {submitButtonLabel}
              </button>
            )}
          </div>
        </div>
      </main>

      <ConfirmModal
        open={confirmSubmitOpen}
        onClose={() => setConfirmSubmitOpen(false)}
        onConfirm={handleSubmitConfirm}
        title={submission?.status === 'need_revision' ? 'Submit revision' : 'Submit portfolio'}
        message={
          submission?.status === 'need_revision'
            ? 'Submit your revised portfolio for lecturer review?'
            : 'Submit this project for lecturer review? You can still edit or delete until the lecturer reviews it.'
        }
        confirmLabel={submission?.status === 'need_revision' ? 'Submit revision' : 'Submit'}
        cancelLabel="Cancel"
        variant="primary"
      />
      <ConfirmModal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={async () => {
          try {
            await api.delete(`/api/student/submissions/${submission.id}`);
            toast.success(submission.status === 'draft' ? 'Draft deleted' : 'Submission deleted');
            setDeleteConfirmOpen(false);
            navigate('/student/workspace');
          } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete');
          }
        }}
        title={submission?.status === 'draft' ? 'Delete draft' : 'Delete submission'}
        message={
          submission?.status === 'draft'
            ? 'Delete this draft permanently? You can start again from your workspace later.'
            : 'Remove this submission? Your lecturer has not reviewed it yet. You can submit again later from the same card.'
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}
