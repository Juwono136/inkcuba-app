import Submission from '../models/Submission.js';
import Workspace from '../models/Workspace.js';
import Card from '../models/Card.js';
import logger from '../logger/index.js';
import { createForUsers } from '../services/notificationService.js';

/** GET /api/lecturer/submissions/summary - counts for dashboard cards */
export async function getSubmissionSummary(req, res, next) {
  try {
    const lecturerId = req.user.id;
    const workspaces = await Workspace.find({ createdBy: lecturerId }).select('_id').lean();
    const workspaceIds = workspaces.map((w) => w._id);
    if (workspaceIds.length === 0) {
      return res.json({ success: true, total: 0, pendingReview: 0, approvedThisWeek: 0 });
    }

    const baseFilter = { workspace: { $in: workspaceIds } };
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(startOfWeek.getDate() + diff);

    const [total, pendingReview, approvedThisWeek] = await Promise.all([
      Submission.countDocuments(baseFilter),
      Submission.countDocuments({ ...baseFilter, status: { $in: ['submitted', 'need_revision'] } }),
      Submission.countDocuments({
        ...baseFilter,
        status: { $in: ['approved', 'published'] },
        $or: [{ reviewedAt: { $gte: startOfWeek } }, { publishedAt: { $gte: startOfWeek } }],
      }),
    ]);

    res.json({ success: true, total, pendingReview, approvedThisWeek });
  } catch (err) {
    logger.error('Submission summary error', { error: err.message });
    next(err);
  }
}

/** GET /api/lecturer/submissions - list submissions (optional workspaceId, cardId, status, q for search) */
export async function listSubmissions(req, res, next) {
  try {
    const lecturerId = req.user.id;
    const { workspaceId, cardId, status, q } = req.query;
    const search = typeof q === 'string' ? q.trim() : '';

    const workspaces = await Workspace.find({ createdBy: lecturerId }).select('_id').lean();
    const workspaceIds = workspaces.map((w) => w._id);
    if (workspaceIds.length === 0) {
      return res.json({ success: true, data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
    }

    const filter = { workspace: { $in: workspaceIds } };
    if (workspaceId) filter.workspace = workspaceId;
    if (cardId) filter.card = cardId;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { projectName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [list, total] = await Promise.all([
      Submission.find(filter)
        .populate('workspace', 'name course classBatch semester')
        .populate('card', 'name dueDate isGroupCard')
        .populate('student', 'name email avatarUrl')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Submission.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: list.map(toSafeSubmissionForLecturer),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    logger.error('List submissions error', { error: err.message });
    next(err);
  }
}

/** GET /api/lecturer/submissions/:id */
export async function getOne(req, res, next) {
  try {
    const lecturerId = req.user.id;
    const { id } = req.params;

    const doc = await Submission.findById(id)
      .populate('workspace', 'name course classBatch semester')
      .populate('card', 'name dueDate isGroupCard startDate')
      .populate('student', 'name email avatarUrl')
      .lean();
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    const workspace = await Workspace.findOne({ _id: doc.workspace._id || doc.workspace, createdBy: lecturerId });
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    res.json({ success: true, submission: toSafeSubmissionForLecturer(doc) });
  } catch (err) {
    logger.error('Get submission error', { error: err.message });
    next(err);
  }
}

/** PATCH /api/lecturer/submissions/:id/review - approve or reject with feedback */
export async function review(req, res, next) {
  try {
    const lecturerId = req.user.id;
    const { id } = req.params;
    const { approved, feedback, assessment } = req.body || {};

    const doc = await Submission.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Submission not found.' });

    const workspace = await Workspace.findOne({ _id: doc.workspace, createdBy: lecturerId });
    if (!workspace) return res.status(404).json({ success: false, message: 'Submission not found.' });

    if (doc.status !== 'submitted' && doc.status !== 'need_revision') {
      return res.status(400).json({ success: false, message: 'Only submitted or need_revision can be reviewed.' });
    }

    doc.reviewedBy = lecturerId;
    doc.reviewedAt = new Date();
    doc.feedback = typeof feedback === 'string' ? feedback.trim().slice(0, 2000) : '';
    doc.assessment = typeof assessment === 'string' ? assessment.trim().slice(0, 500) : '';

    if (approved) {
      doc.status = 'approved';
      await doc.save();
      await createForUsers(
        [doc.student],
        'submission_approved',
        'Portfolio approved',
        `Your submission "${(doc.projectName || '').slice(0, 50)}" has been approved.`,
        doc._id.toString(),
        { submissionId: doc._id.toString(), workspaceId: doc.workspace.toString(), cardId: doc.card.toString() }
      );
    } else {
      doc.status = 'need_revision';
      await doc.save();
      await createForUsers(
        [doc.student],
        'revision_requested',
        'Revision requested',
        `Your submission "${(doc.projectName || '').slice(0, 50)}" needs revision. Check feedback.`,
        doc._id.toString(),
        { submissionId: doc._id.toString(), workspaceId: doc.workspace.toString(), cardId: doc.card.toString() }
      );
    }

    res.json({ success: true, submission: toSafeSubmissionForLecturer(doc.toObject()) });
  } catch (err) {
    logger.error('Review submission error', { error: err.message });
    next(err);
  }
}

/** PATCH /api/lecturer/submissions/:id/publish - set status published and notify student */
export async function publish(req, res, next) {
  try {
    const lecturerId = req.user.id;
    const { id } = req.params;

    const doc = await Submission.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Submission not found.' });

    const workspace = await Workspace.findOne({ _id: doc.workspace, createdBy: lecturerId });
    if (!workspace) return res.status(404).json({ success: false, message: 'Submission not found.' });

    if (doc.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Only approved submissions can be published.' });
    }

    doc.status = 'published';
    doc.publishedAt = new Date();
    await doc.save();

    await createForUsers(
      [doc.student],
      'submission_published',
      'Portfolio published',
      `Your project "${(doc.projectName || '').slice(0, 50)}" is now published on the home page.`,
      doc._id.toString(),
      { submissionId: doc._id.toString(), workspaceId: doc.workspace.toString(), cardId: doc.card.toString() }
    );

    res.json({ success: true, submission: toSafeSubmissionForLecturer(doc.toObject()) });
  } catch (err) {
    logger.error('Publish submission error', { error: err.message });
    next(err);
  }
}

/** PATCH /api/lecturer/submissions/:id/take-down - set status taken_down, reason, notify student */
export async function takeDown(req, res, next) {
  try {
    const lecturerId = req.user.id;
    const { id } = req.params;
    const { reason } = req.body || {};

    const doc = await Submission.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Submission not found.' });

    const workspace = await Workspace.findOne({ _id: doc.workspace, createdBy: lecturerId });
    if (!workspace) return res.status(404).json({ success: false, message: 'Submission not found.' });

    if (doc.status !== 'published') {
      return res.status(400).json({ success: false, message: 'Only published submissions can be taken down.' });
    }

    doc.status = 'taken_down';
    doc.takenDownReason = typeof reason === 'string' ? reason.trim().slice(0, 500) : '';
    await doc.save();

    await createForUsers(
      [doc.student],
      'submission_taken_down',
      'Portfolio taken down',
      reason ? `Your project has been taken down: ${doc.takenDownReason.slice(0, 100)}` : 'Your project has been removed from the home page.',
      doc._id.toString(),
      { submissionId: doc._id.toString(), workspaceId: doc.workspace.toString(), cardId: doc.card.toString() }
    );

    res.json({ success: true, submission: toSafeSubmissionForLecturer(doc.toObject()) });
  } catch (err) {
    logger.error('Take down submission error', { error: err.message });
    next(err);
  }
}

function toSafeSubmissionForLecturer(s) {
  const w = s.workspace;
  const c = s.card;
  const st = s.student;
  return {
    id: s._id,
    workspaceId: w?._id || s.workspace,
    cardId: c?._id || s.card,
    studentId: st?._id || s.student,
    workspace: w ? { id: w._id, name: w.name, course: w.course, classBatch: w.classBatch, semester: w.semester } : undefined,
    card: c ? { id: c._id, name: c.name, dueDate: c.dueDate, isGroupCard: c.isGroupCard, startDate: c.startDate } : undefined,
    student: st ? { id: st._id, name: st.name, email: st.email, avatarUrl: st.avatarUrl } : undefined,
    status: s.status,
    projectName: s.projectName,
    description: s.description,
    category: s.category,
    tags: s.tags || [],
    screenshots: s.screenshots || [],
    projectPoster: s.projectPoster,
    detailedReport: s.detailedReport,
    videoUrl: s.videoUrl,
    externalLinks: s.externalLinks || [],
    feedback: s.feedback,
    assessment: s.assessment,
    submittedAt: s.submittedAt,
    reviewedAt: s.reviewedAt,
    publishedAt: s.publishedAt,
    takenDownReason: s.takenDownReason,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}
