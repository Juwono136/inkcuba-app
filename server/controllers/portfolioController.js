import Submission from '../models/Submission.js';
import logger from '../logger/index.js';

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 48;

/**
 * GET /api/portfolios - List published portfolios (public, no auth).
 * Query: page, limit, program (course), classBatch, semester, q (search projectName/category)
 */
export async function listPublished(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
    const program = (req.query.program || '').trim();
    const classBatch = (req.query.classBatch || '').trim();
    const semester = (req.query.semester || '').trim();
    const q = (req.query.q || '').trim();

    const pipeline = [
      { $match: { status: 'published' } },
      {
        $lookup: {
          from: 'workspaces',
          localField: 'workspace',
          foreignField: '_id',
          as: 'workspaceDoc',
        },
      },
      { $unwind: '$workspaceDoc' },
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'studentDoc',
          pipeline: [{ $project: { name: 1, avatarUrl: 1 } }],
        },
      },
      { $unwind: '$studentDoc' },
    ];

    const filterMatch = {};
    if (program) filterMatch['workspaceDoc.course'] = { $regex: program, $options: 'i' };
    if (classBatch) filterMatch['workspaceDoc.classBatch'] = { $regex: classBatch, $options: 'i' };
    if (semester) filterMatch['workspaceDoc.semester'] = { $regex: semester, $options: 'i' };
    if (q) {
      filterMatch.$or = [
        { projectName: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ];
    }
    if (Object.keys(filterMatch).length) pipeline.push({ $match: filterMatch });

    const countPipeline = [...pipeline, { $count: 'total' }];
    const [countResult] = await Submission.aggregate(countPipeline);
    const total = countResult?.total ?? 0;

    pipeline.push(
      { $sort: { publishedAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          projectName: 1,
          description: 1,
          category: 1,
          tags: 1,
          projectPoster: 1,
          screenshots: 1,
          publishedAt: 1,
          workspace: 1,
          student: 1,
          course: '$workspaceDoc.course',
          classBatch: '$workspaceDoc.classBatch',
          semester: '$workspaceDoc.semester',
          studentName: '$studentDoc.name',
          studentAvatarUrl: '$studentDoc.avatarUrl',
        },
      }
    );

    const items = await Submission.aggregate(pipeline);

    const data = items.map((doc) => ({
      id: doc._id,
      projectName: doc.projectName || '',
      description: (doc.description || '').slice(0, 200),
      category: doc.category || '',
      tags: doc.tags || [],
      thumbnail: doc.projectPoster || (doc.screenshots && doc.screenshots[0]) || null,
      publishedAt: doc.publishedAt,
      course: doc.course || '',
      classBatch: doc.classBatch || '',
      semester: doc.semester || '',
      student: {
        id: doc.student,
        name: doc.studentName || '',
        avatarUrl: doc.studentAvatarUrl || '',
      },
    }));

    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    logger.error('List published portfolios error', { error: err.message });
    next(err);
  }
}

/**
 * GET /api/portfolios/:id - Get one published portfolio by id (public).
 */
export async function getPublishedById(req, res, next) {
  try {
    const { id } = req.params;
    const doc = await Submission.findOne({ _id: id, status: 'published' })
      .populate('workspace', 'name course classBatch semester')
      .populate('student', 'name avatarUrl')
      .populate('card', 'name')
      .lean();

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Portfolio not found or not published.' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = (subId, filename) => `${baseUrl}/api/uploads/portfolios/${subId}/${filename}`;

    res.json({
      success: true,
      data: {
        id: doc._id,
        projectName: doc.projectName || '',
        description: doc.description || '',
        category: doc.category || '',
        tags: doc.tags || [],
        screenshots: (doc.screenshots || []).map((f) => fileUrl(doc._id.toString(), f)),
        projectPoster: doc.projectPoster ? fileUrl(doc._id.toString(), doc.projectPoster) : null,
        detailedReport: doc.detailedReport
          ? fileUrl(doc._id.toString(), doc.detailedReport)
          : null,
        detailedReportFilename: doc.detailedReport || null,
        videoUrl: doc.videoUrl || '',
        externalLinks: doc.externalLinks || [],
        publishedAt: doc.publishedAt,
        workspace: doc.workspace
          ? {
              id: doc.workspace._id,
              name: doc.workspace.name,
              course: doc.workspace.course,
              classBatch: doc.workspace.classBatch,
              semester: doc.workspace.semester,
            }
          : null,
        card: doc.card ? { id: doc.card._id, name: doc.card.name } : null,
        student: doc.student
          ? {
              id: doc.student._id,
              name: doc.student.name,
              avatarUrl: doc.student.avatarUrl || '',
            }
          : null,
      },
    });
  } catch (err) {
    logger.error('Get published portfolio error', { error: err.message });
    next(err);
  }
}
