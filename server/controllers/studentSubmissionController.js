import Submission from '../models/Submission.js';
import Card from '../models/Card.js';
import WorkspaceStudent from '../models/WorkspaceStudent.js';
import logger from '../logger/index.js';
import { uploadPortfolioFile } from '../services/portfolioService.js';

/** Check if student is assigned to this card (individual slot or group member) */
async function isStudentAssignedToCard(cardId, studentId) {
  const card = await Card.findById(cardId).select('assignments isGroupCard').lean();
  if (!card || !Array.isArray(card.assignments)) return false;
  const sid = String(studentId);
  for (const a of card.assignments) {
    if (a.studentId && String(a.studentId) === sid) return true;
    if (Array.isArray(a.memberIds) && a.memberIds.some((id) => String(id) === sid)) return true;
  }
  return false;
}

/** Ensure student is in workspace */
async function isStudentInWorkspace(workspaceId, studentId) {
  const link = await WorkspaceStudent.findOne({ workspace: workspaceId, student: studentId });
  return !!link;
}

/** Student can edit/update while status is not "in review" (approved, published, taken_down). */
const EDITABLE_STATUSES = ['draft', 'submitted', 'need_revision'];
/** Student can delete only before lecturer has set need_revision (draft or submitted). */
const DELETABLE_STATUSES = ['draft', 'submitted'];

/** POST /api/student/submissions - create or get draft for workspace+card */
export async function createOrGetDraft(req, res, next) {
  try {
    const studentId = req.user.id;
    const { workspaceId, cardId } = req.body || {};
    if (!workspaceId || !cardId) {
      return res.status(400).json({ success: false, message: 'workspaceId and cardId are required.' });
    }

    const inWorkspace = await isStudentInWorkspace(workspaceId, studentId);
    if (!inWorkspace) {
      return res.status(403).json({ success: false, message: 'You are not in this workspace.' });
    }
    const assigned = await isStudentAssignedToCard(cardId, studentId);
    if (!assigned) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this card.' });
    }

    let submission = await Submission.findOne({
      workspace: workspaceId,
      card: cardId,
      student: studentId,
    }).lean();

    if (!submission) {
      try {
        submission = await Submission.create({
          workspace: workspaceId,
          card: cardId,
          student: studentId,
          status: 'draft',
        });
        submission = submission.toObject();
      } catch (err) {
        // Handle rare race-condition where a submission was created between the
        // initial findOne and the create() call due to concurrent requests.
        if (err.code === 11000) {
          const existing = await Submission.findOne({
            workspace: workspaceId,
            card: cardId,
            student: studentId,
          }).lean();
          if (existing) {
            submission = existing;
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
    }

    res.status(200).json({
      success: true,
      submission: toSafeSubmission(submission),
    });
  } catch (err) {
    logger.error('Create or get draft submission error', { error: err.message });
    next(err);
  }
}

/** PATCH /api/student/submissions/:id - update submission (allowed while not in review) */
export async function updateDraft(req, res, next) {
  try {
    const studentId = req.user.id;
    const { id } = req.params;
    const doc = await Submission.findOne({ _id: id, student: studentId });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }
    if (!EDITABLE_STATUSES.includes(doc.status)) {
      return res.status(400).json({ success: false, message: 'This portfolio is in review or completed. You cannot edit it.' });
    }

    const allowed = ['projectName', 'description', 'category', 'tags', 'videoUrl', 'externalLinks', 'screenshots', 'projectPoster', 'detailedReport'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        if (key === 'tags' && Array.isArray(req.body[key])) {
          doc.tags = req.body[key].map((t) => String(t).trim()).filter(Boolean).slice(0, 20);
        } else if (key === 'externalLinks' && Array.isArray(req.body[key])) {
          doc.externalLinks = req.body[key]
            .filter((l) => l && (l.title || l.url))
            .map((l) => ({ title: String(l.title || '').slice(0, 120), url: String(l.url || '').slice(0, 500) }))
            .slice(0, 3);
        } else if (key === 'screenshots' && Array.isArray(req.body[key])) {
          doc.screenshots = req.body[key].filter((s) => typeof s === 'string').slice(0, 5);
        } else if (typeof req.body[key] === 'string') {
          doc[key] = req.body[key].trim().slice(0, key === 'description' ? 5000 : key === 'videoUrl' ? 500 : 200);
        }
      }
    }

    await doc.save();
    res.json({ success: true, submission: toSafeSubmission(doc.toObject()) });
  } catch (err) {
    logger.error('Update draft error', { error: err.message });
    next(err);
  }
}

/** POST /api/student/submissions/:id/upload-screenshot - multer single 'screenshot', index in body */
export async function uploadScreenshot(req, res, next) {
  try {
    const studentId = req.user.id;
    const { id } = req.params;
    const index = Math.max(0, parseInt(req.body.index, 10) || 0);
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: 'No file provided.' });
    }

    const doc = await Submission.findOne({ _id: id, student: studentId });
    if (!doc) return res.status(404).json({ success: false, message: 'Submission not found.' });
    if (!EDITABLE_STATUSES.includes(doc.status)) return res.status(400).json({ success: false, message: 'This portfolio is in review or completed. You cannot edit it.' });

    const key = await uploadPortfolioFile(
      req.file.buffer,
      id,
      `screenshot-${index}.jpg`,
      req.file.mimetype || 'image/jpeg'
    );
    const screenshots = [...(doc.screenshots || [])];
    screenshots[index] = key;
    doc.screenshots = screenshots.slice(0, 5);
    await doc.save();

    res.json({ success: true, key, screenshots: doc.screenshots });
  } catch (err) {
    logger.error('Upload screenshot error', { error: err.message });
    next(err);
  }
}

/** POST /api/student/submissions/:id/upload-poster */
export async function uploadPoster(req, res, next) {
  try {
    const studentId = req.user.id;
    const { id } = req.params;
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: 'No file provided.' });
    }

    const doc = await Submission.findOne({ _id: id, student: studentId });
    if (!doc) return res.status(404).json({ success: false, message: 'Submission not found.' });
    if (!EDITABLE_STATUSES.includes(doc.status)) return res.status(400).json({ success: false, message: 'This portfolio is in review or completed. You cannot edit it.' });

    const key = await uploadPortfolioFile(req.file.buffer, id, 'poster.jpg', req.file.mimetype || 'image/jpeg');
    doc.projectPoster = key;
    await doc.save();

    res.json({ success: true, key });
  } catch (err) {
    logger.error('Upload poster error', { error: err.message });
    next(err);
  }
}

/** POST /api/student/submissions/:id/upload-report */
export async function uploadReport(req, res, next) {
  try {
    const studentId = req.user.id;
    const { id } = req.params;
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: 'No file provided.' });
    }

    const doc = await Submission.findOne({ _id: id, student: studentId });
    if (!doc) return res.status(404).json({ success: false, message: 'Submission not found.' });
    if (!EDITABLE_STATUSES.includes(doc.status)) return res.status(400).json({ success: false, message: 'This portfolio is in review or completed. You cannot edit it.' });

    const key = await uploadPortfolioFile(req.file.buffer, id, 'report.pdf', req.file.mimetype || 'application/pdf');
    doc.detailedReport = key;
    await doc.save();

    res.json({ success: true, key });
  } catch (err) {
    logger.error('Upload report error', { error: err.message });
    next(err);
  }
}

/** POST /api/student/submissions/:id/submit - first submit (draft) or submit revision (need_revision) */
export async function submit(req, res, next) {
  try {
    const studentId = req.user.id;
    const { id } = req.params;
    const doc = await Submission.findOne({ _id: id, student: studentId });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }
    if (doc.status !== 'draft' && doc.status !== 'need_revision') {
      return res.status(400).json({ success: false, message: 'Only draft can be submitted, or need_revision can be resubmitted.' });
    }

    const name = (doc.projectName || '').trim();
    if (!name) {
      return res.status(400).json({ success: false, message: 'Project name is required.' });
    }
    if (!(doc.description || '').trim()) {
      return res.status(400).json({ success: false, message: 'Project description is required.' });
    }

    const wasNeedRevision = doc.status === 'need_revision';
    doc.status = 'submitted';
    doc.submittedAt = new Date();
    if (wasNeedRevision) {
      doc.feedback = '';
    }
    await doc.save();

    res.json({ success: true, submission: toSafeSubmission(doc.toObject()) });
  } catch (err) {
    logger.error('Submit error', { error: err.message });
    next(err);
  }
}

/** DELETE /api/student/submissions/:id - delete submission (draft or submitted; not after need_revision) */
export async function deleteDraft(req, res, next) {
  try {
    const studentId = req.user.id;
    const { id } = req.params;
    const doc = await Submission.findOne({ _id: id, student: studentId });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }
    if (!DELETABLE_STATUSES.includes(doc.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only draft or submitted (not yet reviewed) portfolios can be deleted.',
      });
    }
    await Submission.deleteOne({ _id: doc._id });
    res.json({ success: true, message: 'Draft deleted.' });
  } catch (err) {
    logger.error('Delete draft error', { error: err.message });
    next(err);
  }
}

/** GET /api/student/submissions - my submissions */
export async function listMy(req, res, next) {
  try {
    const studentId = req.user.id;
    const workspaceId = req.query.workspaceId;
    const cardId = req.query.cardId;

    const filter = { student: studentId };
    if (workspaceId) filter.workspace = workspaceId;
    if (cardId) filter.card = cardId;

    const list = await Submission.find(filter)
      .populate('workspace', 'name course classBatch semester')
      .populate('card', 'name dueDate isGroupCard')
      .sort({ updatedAt: -1 })
      .lean();

    res.json({
      success: true,
      data: list.map((s) => toSafeSubmission(s)),
    });
  } catch (err) {
    logger.error('List my submissions error', { error: err.message });
    next(err);
  }
}

/** GET /api/student/submissions/:id */
export async function getOne(req, res, next) {
  try {
    const studentId = req.user.id;
    const { id } = req.params;
    const doc = await Submission.findOne({ _id: id, student: studentId })
      .populate('workspace', 'name course classBatch semester')
      .populate('card', 'name dueDate isGroupCard startDate')
      .lean();
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }
    res.json({ success: true, submission: toSafeSubmission(doc) });
  } catch (err) {
    logger.error('Get submission error', { error: err.message });
    next(err);
  }
}

function toSafeSubmission(s) {
  const w = s.workspace;
  const c = s.card;
  return {
    id: s._id,
    workspaceId: s.workspace?._id || s.workspace,
    cardId: s.card?._id || s.card,
    workspace: w ? { id: w._id, name: w.name, course: w.course, classBatch: w.classBatch, semester: w.semester } : undefined,
    card: c ? { id: c._id, name: c.name, dueDate: c.dueDate, isGroupCard: c.isGroupCard, startDate: c.startDate } : undefined,
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
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}
