import Workspace from '../models/Workspace.js';
import WorkspaceStudent from '../models/WorkspaceStudent.js';
import Card from '../models/Card.js';
import Submission from '../models/Submission.js';
import logger from '../logger/index.js';

/** GET /api/student/workspaces - list workspaces the logged-in student is enrolled in (with cards + submission status per card) */
export async function listMyWorkspaces(req, res, next) {
  try {
    const studentId = req.user.id;

    const links = await WorkspaceStudent.find({ student: studentId })
      .populate('workspace')
      .lean();

    const workspaceIds = links
      .map((l) => l.workspace?._id)
      .filter(Boolean);

    if (workspaceIds.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const workspaces = await Workspace.find({ _id: { $in: workspaceIds }, status: 'active' }).lean();
    const activeWorkspaceIds = workspaces.map((w) => w._id);
    const now = new Date();
    const cardsByWorkspace = await Card.find({
      workspace: { $in: activeWorkspaceIds },
      startDate: { $lte: now },
    })
      .sort({ createdAt: 1 })
      .lean();

    const cardIds = cardsByWorkspace.map((c) => c._id);
    const submissions = await Submission.find({
      workspace: { $in: activeWorkspaceIds },
      card: { $in: cardIds },
      student: studentId,
    })
      .select('card status submittedAt')
      .lean();

    const submissionByCard = {};
    submissions.forEach((s) => {
      submissionByCard[s.card.toString()] = {
        status: s.status,
        submittedAt: s.submittedAt,
      };
    });

    const cardMap = {};
    cardsByWorkspace.forEach((c) => {
      const wid = c.workspace.toString();
      const cid = c._id.toString();
      const sub = submissionByCard[cid];
      if (!cardMap[wid]) cardMap[wid] = [];
      cardMap[wid].push({
        id: c._id,
        name: c.name,
        cardType: c.cardType,
        quantity: c.quantity,
        isGroupCard: c.isGroupCard,
        startDate: c.startDate,
        dueDate: c.dueDate,
        status: c.status,
        submissionStatus: sub?.status || null,
        submittedAt: sub?.submittedAt || null,
      });
    });

    const data = workspaces.map((w) => ({
      id: w._id,
      name: w.name,
      description: w.description || '',
      course: w.course || '',
      classBatch: w.classBatch || '',
      semester: w.semester || '',
      status: w.status || 'active',
      cards: cardMap[w._id.toString()] || [],
    }));

    res.json({ success: true, data });
  } catch (err) {
    logger.error('List student workspaces error', { error: err.message });
    next(err);
  }
}
