import Workspace from '../models/Workspace.js';
import WorkspaceStudent from '../models/WorkspaceStudent.js';
import Card from '../models/Card.js';
import User from '../models/User.js';
import logger from '../logger/index.js';
import { createForUsers } from '../services/notificationService.js';
import * as XLSX from 'xlsx';
import { parseCsv } from '../utils/parseCsv.js';
import { parseExcel } from '../utils/parseExcel.js';

const ALLOWED_STATUS = ['draft', 'active', 'archived'];
const ALLOWED_SORT_FIELDS = ['name', 'status', 'createdAt', 'updatedAt'];

/**
 * Validate that all student IDs in assignments belong to the workspace.
 * assignments: individual [{ slotIndex, studentId }] or group [{ groupIndex, memberIds: [] }]
 */
async function validateAssignmentStudentIds(workspaceId, assignments) {
  if (!Array.isArray(assignments) || assignments.length === 0) return { valid: true };
  const ids = new Set();
  for (const a of assignments) {
    if (a.studentId) ids.add(String(a.studentId));
    if (Array.isArray(a.memberIds)) a.memberIds.forEach((id) => ids.add(String(id)));
  }
  if (ids.size === 0) return { valid: true };
  const inWorkspace = await WorkspaceStudent.find({
    workspace: workspaceId,
    student: { $in: [...ids] },
  })
    .select('student')
    .lean();
  const foundSet = new Set(inWorkspace.map((l) => String(l.student)));
  const invalid = [...ids].filter((id) => !foundSet.has(id));
  if (invalid.length > 0) {
    return { valid: false, message: `Student(s) not in this workspace: ${invalid.slice(0, 5).join(', ')}${invalid.length > 5 ? '...' : ''}.` };
  }
  return { valid: true };
}

function toSafeWorkspace(ws) {
  if (!ws) return null;
  const o = ws.toObject ? ws.toObject() : ws;
  return {
    id: o._id,
    name: o.name,
    description: o.description || '',
    course: o.course || '',
    classBatch: o.classBatch || '',
    semester: o.semester || '',
    createdBy: o.createdBy,
    status: o.status || 'draft',
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    studentCount: o.studentCount,
    cardCount: o.cardCount,
  };
}

/** GET /api/lecturer/workspaces - list with search, filter, sort, pagination */
export async function listWorkspaces(req, res, next) {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query || {};

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const lecturerId = req.user.id;

    const filter = { createdBy: lecturerId };

    if (search && typeof search === 'string' && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { description: regex },
        { course: regex },
        { classBatch: regex },
        { semester: regex },
      ];
    }

    if (status && ALLOWED_STATUS.includes(status)) {
      filter.status = status;
    }

    const sortField = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortDirection };

    const [total, workspaces] = await Promise.all([
      Workspace.countDocuments(filter),
      Workspace.find(filter)
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
    ]);

    const workspaceIds = workspaces.map((w) => w._id);

    const [studentCounts, cardCounts] = await Promise.all([
      WorkspaceStudent.aggregate([
        { $match: { workspace: { $in: workspaceIds } } },
        { $group: { _id: '$workspace', count: { $sum: 1 } } },
      ]),
      Card.aggregate([
        { $match: { workspace: { $in: workspaceIds } } },
        { $group: { _id: '$workspace', count: { $sum: 1 } } },
      ]),
    ]);

    const studentMap = Object.fromEntries(studentCounts.map((c) => [c._id.toString(), c.count]));
    const cardMap = Object.fromEntries(cardCounts.map((c) => [c._id.toString(), c.count]));

    const data = workspaces.map((w) => {
      const id = w._id.toString();
      return toSafeWorkspace({
        ...w,
        studentCount: studentMap[id] ?? 0,
        cardCount: cardMap[id] ?? 0,
      });
    });

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.json({
      success: true,
      data,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        sortBy: sortField,
        sortOrder: sortDirection === 1 ? 'asc' : 'desc',
      },
    });
  } catch (err) {
    logger.error('List workspaces error', { error: err.message });
    next(err);
  }
}

/** POST /api/lecturer/workspaces - create workspace */
export async function createWorkspace(req, res, next) {
  try {
    const { name, description, status, course, classBatch, semester } = req.body || {};
    const lecturerId = req.user.id;

    const trimmedName = typeof name === 'string' ? name.trim() : '';
    if (!trimmedName) {
      return res.status(400).json({
        success: false,
        message: 'Workspace name is required.',
      });
    }
    const trimmedCourse = typeof course === 'string' ? course.trim() : '';
    const trimmedClassBatch = typeof classBatch === 'string' ? classBatch.trim() : '';
    const trimmedSemester = typeof semester === 'string' ? semester.trim() : '';
    if (!trimmedCourse || !trimmedClassBatch || !trimmedSemester) {
      return res.status(400).json({
        success: false,
        message: 'Course / Program, Class/Batch, and Semester are required.',
      });
    }

    const desc = typeof description === 'string' ? description.trim().slice(0, 750) : '';
    const workspace = await Workspace.create({
      name: trimmedName,
      description: desc,
      course: trimmedCourse,
      classBatch: trimmedClassBatch,
      semester: trimmedSemester,
      createdBy: lecturerId,
      status: status && ALLOWED_STATUS.includes(status) ? status : 'active',
    });

    res.status(201).json({
      success: true,
      workspace: toSafeWorkspace({ ...workspace.toObject(), studentCount: 0, cardCount: 0 }),
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const first = Object.values(err.errors)[0];
      return res.status(400).json({
        success: false,
        message: first?.message || 'Validation failed.',
      });
    }
    logger.error('Create workspace error', { error: err.message });
    next(err);
  }
}

/** GET /api/lecturer/workspaces/student-template - download Excel template for student list */
export async function downloadStudentTemplate(req, res, next) {
  try {
    // Column format: Student Name, Student Code, Student Email, Academic Program
    const wsData = [
      ['Student Name', 'Student Code', 'Student Email', 'Academic Program'],
      ['Alice Johnson', '2440012345', 'alice@example.com', 'Computer Science'],
      ['Bob Smith', '2440012346', 'bob@example.com', 'Graphic Design'],
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=inkcuba_student_list_template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (err) {
    logger.error('Download student template error', { error: err.message });
    next(err);
  }
}

/** GET /api/lecturer/workspaces/:id - get one with students and cards */
export async function getWorkspace(req, res, next) {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;

    const workspace = await Workspace.findOne({ _id: id, createdBy: lecturerId });
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found.',
      });
    }

    const [studentCount, cardCount, students, cards] = await Promise.all([
      WorkspaceStudent.countDocuments({ workspace: id }),
      Card.countDocuments({ workspace: id }),
      WorkspaceStudent.find({ workspace: id })
        .populate('student', 'name email studentCode avatarUrl')
        .lean(),
      Card.find({ workspace: id }).sort({ createdAt: 1 }).lean(),
    ]);

    const out = toSafeWorkspace({
      ...workspace.toObject(),
      studentCount,
      cardCount,
    });
    out.students = students.map((s) => ({
      id: s.student?._id,
      name: s.student?.name,
      email: s.student?.email,
      studentCode: s.student?.studentCode || '',
      avatarUrl: s.student?.avatarUrl || '',
    }));
    out.cards = cards.map((c) => ({
      id: c._id,
      name: c.name,
      cardType: c.cardType,
      quantity: c.quantity,
      isGroupCard: c.isGroupCard,
      startDate: c.startDate,
      dueDate: c.dueDate,
      groupCount: c.groupCount,
      assignments: c.assignments || [],
      status: c.status,
      createdAt: c.createdAt,
    }));

    res.json({ success: true, workspace: out });
  } catch (err) {
    logger.error('Get workspace error', { error: err.message });
    next(err);
  }
}

/** PATCH /api/lecturer/workspaces/:id */
export async function updateWorkspace(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, status, course, classBatch, semester } = req.body || {};
    const lecturerId = req.user.id;

    const workspace = await Workspace.findOne({ _id: id, createdBy: lecturerId });
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found.',
      });
    }

    if (name !== undefined) {
      const trimmed = typeof name === 'string' ? name.trim() : '';
      if (!trimmed) {
        return res.status(400).json({
          success: false,
          message: 'Workspace name cannot be empty.',
        });
      }
      workspace.name = trimmed;
    }
    if (description !== undefined) {
      workspace.description = typeof description === 'string' ? description.trim().slice(0, 750) : '';
    }
    if (course !== undefined) {
      workspace.course = typeof course === 'string' ? course.trim() : '';
    }
    if (classBatch !== undefined) {
      workspace.classBatch = typeof classBatch === 'string' ? classBatch.trim() : '';
    }
    if (semester !== undefined) {
      workspace.semester = typeof semester === 'string' ? semester.trim() : '';
    }
    if (status !== undefined && ALLOWED_STATUS.includes(status)) {
      workspace.status = status;
    }

    await workspace.save();

    const [studentCount, cardCount] = await Promise.all([
      WorkspaceStudent.countDocuments({ workspace: id }),
      Card.countDocuments({ workspace: id }),
    ]);

    res.json({
      success: true,
      workspace: toSafeWorkspace({ ...workspace.toObject(), studentCount, cardCount }),
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const first = Object.values(err.errors)[0];
      return res.status(400).json({
        success: false,
        message: first?.message || 'Validation failed.',
      });
    }
    logger.error('Update workspace error', { error: err.message });
    next(err);
  }
}

/** DELETE /api/lecturer/workspaces/:id */
export async function deleteWorkspace(req, res, next) {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;

    const workspace = await Workspace.findOne({ _id: id, createdBy: lecturerId });
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found.',
      });
    }

    await Promise.all([
      WorkspaceStudent.deleteMany({ workspace: id }),
      Card.deleteMany({ workspace: id }),
      Workspace.deleteOne({ _id: id }),
    ]);

    res.json({ success: true, message: 'Workspace deleted.' });
  } catch (err) {
    logger.error('Delete workspace error', { error: err.message });
    next(err);
  }
}

/** Normalize header to canonical key: Student Name, Student Code, Student Email, Academic Program */
function getColumnKey(headers, patterns) {
  for (const p of patterns) {
    const found = headers.find((h) => p.test(String(h || '')));
    if (found) return found;
  }
  return null;
}

/** POST /api/lecturer/workspaces/:id/students/upload - CSV/Excel upload: update students + map to workspace */
export async function uploadStudentList(req, res, next) {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'No file provided. Use template: Student Name, Student Code, Student Email, Academic Program.',
      });
    }

    const workspace = await Workspace.findOne({ _id: id, createdBy: lecturerId });
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found.',
      });
    }

    const isExcel =
      req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      req.file.mimetype === 'application/vnd.ms-excel' ||
      /\.xlsx?$/i.test(req.file.originalname || '');
    const { headers, rows } = isExcel
      ? parseExcel(req.file.buffer)
      : parseCsv(req.file.buffer);
    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'File is empty or has no data rows.',
      });
    }

    const nameKey = getColumnKey(headers, [/student\s*name|name/i]);
    const codeKey = getColumnKey(headers, [/student\s*code|code|id/i]);
    const emailKey = getColumnKey(headers, [/student\s*email|email/i]);
    const programKey = getColumnKey(headers, [/academic\s*program|program/i]);

    if (!emailKey) {
      return res.status(400).json({
        success: false,
        message: 'File must contain a "Student Email" column to match accounts.',
      });
    }

    const normalizedRows = rows.map((r) => ({
      name: (nameKey ? (r[nameKey] || '').trim() : '').slice(0, 120),
      studentCode: (codeKey ? (r[codeKey] || '').trim() : '').slice(0, 80),
      email: (r[emailKey] || '').trim().toLowerCase().slice(0, 200),
      program: (programKey ? (r[programKey] || '').trim() : '').slice(0, 120),
    })).filter((row) => row.email);

    const uniqueByEmail = new Map();
    for (const row of normalizedRows) {
      if (!row.email) continue;
      if (!uniqueByEmail.has(row.email)) uniqueByEmail.set(row.email, row);
    }
    const toProcess = [...uniqueByEmail.values()];

    const emails = toProcess.map((r) => r.email).filter(Boolean);
    const codes = [...new Set(toProcess.map((r) => r.studentCode).filter(Boolean))];
    const orConditions = [
      { email: { $in: emails } },
      ...(codes.length ? [{ studentCode: { $in: codes } }] : []),
    ];
    const existingUsers = await User.find({
      role: 'student',
      $or: orConditions,
    })
      .select('_id email studentCode name program')
      .lean();

    const byEmail = new Map(existingUsers.map((u) => [u.email.toLowerCase(), u]));
    const byCode = new Map();
    for (const u of existingUsers) {
      if (u.studentCode) byCode.set(String(u.studentCode).trim(), u);
    }

    let updated = 0;
    const userIdsToAdd = new Set();

    for (const row of toProcess) {
      let user = byEmail.get(row.email) || (row.studentCode ? byCode.get(row.studentCode) : null);
      if (!user) continue;

      const userDoc = await User.findById(user._id).select('name email studentCode program');
      if (!userDoc) continue;

      const updates = {};
      if (row.name && row.name !== userDoc.name) updates.name = row.name;
      if (row.studentCode !== undefined && String(row.studentCode).trim() !== String(userDoc.studentCode || '').trim()) {
        updates.studentCode = row.studentCode ? String(row.studentCode).trim() : '';
      }
      if (row.program !== undefined && row.program !== (userDoc.program || '')) updates.program = row.program || '';
      if (Object.keys(updates).length > 0) {
        await User.updateOne({ _id: user._id }, { $set: updates });
        updated++;
      }
      userIdsToAdd.add(user._id.toString());
    }

    const existingLinks = await WorkspaceStudent.find({
      workspace: id,
      student: { $in: [...userIdsToAdd] },
    }).select('student');
    const linkedSet = new Set(existingLinks.map((l) => l.student.toString()));
    const toLink = [...userIdsToAdd].filter((uid) => !linkedSet.has(uid));

    if (toLink.length > 0) {
      await WorkspaceStudent.insertMany(
        toLink.map((studentId) => ({ workspace: id, student: studentId }))
      );
      await createForUsers(
        toLink,
        'workspace_assigned',
        'New workspace',
        `You have been added to workspace: ${workspace.name}.`,
        id,
        { workspaceId: id }
      );
    }

    const totalInWorkspace = await WorkspaceStudent.countDocuments({ workspace: id });

    res.status(200).json({
      success: true,
      message: `Processed file: ${toLink.length} student(s) added to workspace${updated > 0 ? `, ${updated} student record(s) updated.` : '.'} Total in workspace: ${totalInWorkspace}.`,
      added: toLink.length,
      totalInWorkspace,
      updated,
      notFound: toProcess.length - userIdsToAdd.size,
    });
  } catch (err) {
    logger.error('Upload student list error', { error: err.message });
    next(err);
  }
}

/** POST /api/lecturer/workspaces/:id/students/batch - add multiple students by ids */
export async function addStudentsBatchToWorkspace(req, res, next) {
  try {
    const { id } = req.params;
    const { studentIds } = req.body || {};
    const lecturerId = req.user.id;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'studentIds array is required and must not be empty.',
      });
    }
    const uniqueIds = [...new Set(studentIds.map((s) => String(s).trim()).filter(Boolean))];
    if (uniqueIds.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 500 students per batch.',
      });
    }

    const workspace = await Workspace.findOne({ _id: id, createdBy: lecturerId });
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found.',
      });
    }

    const users = await User.find({
      _id: { $in: uniqueIds },
      role: 'student',
      isActive: true,
    }).select('_id');
    const foundIds = new Set(users.map((u) => u._id.toString()));

    const existingLinks = await WorkspaceStudent.find({
      workspace: id,
      student: { $in: users.map((u) => u._id) },
    }).select('student');
    const existingSet = new Set(existingLinks.map((l) => l.student.toString()));
    const toAdd = users.filter((u) => !existingSet.has(u._id.toString()));

    if (toAdd.length > 0) {
      await WorkspaceStudent.insertMany(
        toAdd.map((student) => ({ workspace: id, student: student._id }))
      );
      await createForUsers(
        toAdd.map((u) => u._id),
        'workspace_assigned',
        'New workspace',
        `You have been added to workspace: ${workspace.name}.`,
        id,
        { workspaceId: id }
      );
    }

    const totalInWorkspace = await WorkspaceStudent.countDocuments({ workspace: id });

    res.status(200).json({
      success: true,
      message: `Mapped ${toAdd.length} student(s) to workspace. Total: ${totalInWorkspace}.`,
      added: toAdd.length,
      totalInWorkspace,
      notFound: uniqueIds.length - foundIds.size,
    });
  } catch (err) {
    logger.error('Batch add students error', { error: err.message });
    next(err);
  }
}

/** POST /api/lecturer/workspaces/:id/students - add one student by id (manual add) */
export async function addStudentToWorkspace(req, res, next) {
  try {
    const { id } = req.params;
    const { studentId } = req.body || {};
    const lecturerId = req.user.id;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'studentId is required.',
      });
    }

    const workspace = await Workspace.findOne({ _id: id, createdBy: lecturerId });
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found.',
      });
    }

    const student = await User.findOne({
      _id: studentId,
      role: 'student',
      isActive: true,
    }).select('_id');
    if (!student) {
      return res.status(400).json({
        success: false,
        message: 'Student not found or not active.',
      });
    }

    const existing = await WorkspaceStudent.findOne({
      workspace: id,
      student: studentId,
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Student is already in this workspace.',
      });
    }

    await WorkspaceStudent.create({ workspace: id, student: studentId });
    await createForUsers(
      [studentId],
      'workspace_assigned',
      'New workspace',
      `You have been added to workspace: ${workspace.name}.`,
      id,
      { workspaceId: id }
    );
    const totalInWorkspace = await WorkspaceStudent.countDocuments({ workspace: id });

    res.status(201).json({
      success: true,
      message: 'Student added to workspace.',
      totalInWorkspace,
    });
  } catch (err) {
    logger.error('Add student to workspace error', { error: err.message });
    next(err);
  }
}

/** DELETE /api/lecturer/workspaces/:id/students/:studentId - remove student from workspace */
export async function removeStudentFromWorkspace(req, res, next) {
  try {
    const { id, studentId } = req.params;
    const lecturerId = req.user.id;

    const workspace = await Workspace.findOne({ _id: id, createdBy: lecturerId });
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found.',
      });
    }

    const deleted = await WorkspaceStudent.findOneAndDelete({
      workspace: id,
      student: studentId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Student is not in this workspace.',
      });
    }

    const totalInWorkspace = await WorkspaceStudent.countDocuments({ workspace: id });

    res.json({
      success: true,
      message: 'Student removed from workspace.',
      totalInWorkspace,
    });
  } catch (err) {
    logger.error('Remove student from workspace error', { error: err.message });
    next(err);
  }
}

/** GET /api/lecturer/workspaces/:id/students */
export async function listWorkspaceStudents(req, res, next) {
  try {
    const { id } = req.params;
    const lecturerId = req.user.id;

    const workspace = await Workspace.findOne({ _id: id, createdBy: lecturerId });
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found.',
      });
    }

    const links = await WorkspaceStudent.find({ workspace: id })
      .populate('student', 'name email studentCode avatarUrl')
      .lean();

    res.json({
      success: true,
      data: links.map((l) => ({
        id: l.student?._id,
        name: l.student?.name,
        email: l.student?.email,
        studentCode: l.student?.studentCode || '',
        avatarUrl: l.student?.avatarUrl || '',
      })),
    });
  } catch (err) {
    logger.error('List workspace students error', { error: err.message });
    next(err);
  }
}

/** POST /api/lecturer/workspaces/:id/cards - create card */
export async function createCard(req, res, next) {
  try {
    const { id } = req.params;
    const { name, cardType, quantity, isGroupCard, startDate, dueDate, groupCount, assignments } = req.body || {};
    const lecturerId = req.user.id;

    const workspace = await Workspace.findOne({ _id: id, createdBy: lecturerId });
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found.',
      });
    }

    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedType = typeof cardType === 'string' ? cardType.trim() : '';
    if (!trimmedName) {
      return res.status(400).json({ success: false, message: 'Card name is required.' });
    }
    if (!trimmedType) {
      return res.status(400).json({ success: false, message: 'Card type is required.' });
    }

    const parsedStart = startDate ? new Date(startDate) : null;
    const parsedDue = dueDate ? new Date(dueDate) : null;
    if (!parsedStart || isNaN(parsedStart.getTime())) {
      return res.status(400).json({ success: false, message: 'Start date is required and must be valid.' });
    }
    if (!parsedDue || isNaN(parsedDue.getTime())) {
      return res.status(400).json({ success: false, message: 'Due date is required and must be valid.' });
    }

    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const isGroup = isGroupCard === true;
    const groupCnt = isGroup && groupCount != null ? Math.max(1, parseInt(groupCount, 10) || 1) : null;
    const safeAssignments = Array.isArray(assignments) ? assignments : [];

    const validation = await validateAssignmentStudentIds(id, safeAssignments);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    const card = await Card.create({
      workspace: id,
      name: trimmedName,
      cardType: trimmedType,
      quantity: qty,
      isGroupCard: isGroup,
      startDate: parsedStart,
      dueDate: parsedDue,
      groupCount: groupCnt,
      assignments: safeAssignments,
    });

    res.status(201).json({
      success: true,
      card: {
        id: card._id,
        name: card.name,
        cardType: card.cardType,
        quantity: card.quantity,
        isGroupCard: card.isGroupCard,
        startDate: card.startDate,
        dueDate: card.dueDate,
        groupCount: card.groupCount,
        assignments: card.assignments,
        status: card.status,
        createdAt: card.createdAt,
      },
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const first = Object.values(err.errors)[0];
      return res.status(400).json({ success: false, message: first?.message || 'Validation failed.' });
    }
    logger.error('Create card error', { error: err.message });
    next(err);
  }
}

/** PATCH /api/lecturer/workspaces/:workspaceId/cards/:cardId */
export async function updateCard(req, res, next) {
  try {
    const { workspaceId, cardId } = req.params;
    const { name, cardType, quantity, isGroupCard, status, startDate, dueDate, groupCount, assignments } = req.body || {};
    const lecturerId = req.user.id;

    const workspace = await Workspace.findOne({ _id: workspaceId, createdBy: lecturerId });
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found.' });
    }

    const card = await Card.findOne({ _id: cardId, workspace: workspaceId });
    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found.' });
    }

    if (name !== undefined) {
      const t = typeof name === 'string' ? name.trim() : '';
      if (!t) return res.status(400).json({ success: false, message: 'Card name cannot be empty.' });
      card.name = t;
    }
    if (cardType !== undefined) {
      const t = typeof cardType === 'string' ? cardType.trim() : '';
      if (!t) return res.status(400).json({ success: false, message: 'Card type cannot be empty.' });
      card.cardType = t;
    }
    if (quantity !== undefined) {
      card.quantity = Math.max(1, parseInt(quantity, 10) || 1);
    }
    if (isGroupCard !== undefined) {
      card.isGroupCard = isGroupCard === true;
    }
    if (status !== undefined && ['draft', 'locked'].includes(status)) {
      card.status = status;
    }
    if (startDate !== undefined) {
      const parsed = startDate ? new Date(startDate) : null;
      card.startDate = parsed && !isNaN(parsed.getTime()) ? parsed : null;
    }
    if (dueDate !== undefined) {
      const parsed = dueDate ? new Date(dueDate) : null;
      card.dueDate = parsed && !isNaN(parsed.getTime()) ? parsed : null;
    }
    if (groupCount !== undefined && card.isGroupCard) {
      card.groupCount = Math.max(1, parseInt(groupCount, 10) || 1);
    }
    if (assignments !== undefined && Array.isArray(assignments)) {
      const validation = await validateAssignmentStudentIds(workspaceId, assignments);
      if (!validation.valid) {
        return res.status(400).json({ success: false, message: validation.message });
      }
      card.assignments = assignments;
    }

    await card.save();

    res.json({
      success: true,
      card: {
        id: card._id,
        name: card.name,
        cardType: card.cardType,
        quantity: card.quantity,
        isGroupCard: card.isGroupCard,
        startDate: card.startDate,
        dueDate: card.dueDate,
        groupCount: card.groupCount,
        assignments: card.assignments,
        status: card.status,
        createdAt: card.createdAt,
      },
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const first = Object.values(err.errors)[0];
      return res.status(400).json({ success: false, message: first?.message || 'Validation failed.' });
    }
    logger.error('Update card error', { error: err.message });
    next(err);
  }
}

/** DELETE /api/lecturer/workspaces/:workspaceId/cards/:cardId */
export async function deleteCard(req, res, next) {
  try {
    const { workspaceId, cardId } = req.params;
    const lecturerId = req.user.id;

    const workspace = await Workspace.findOne({ _id: workspaceId, createdBy: lecturerId });
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found.' });
    }

    const card = await Card.findOne({ _id: cardId, workspace: workspaceId });
    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found.' });
    }

    await Card.deleteOne({ _id: cardId });
    res.json({ success: true, message: 'Card deleted.' });
  } catch (err) {
    logger.error('Delete card error', { error: err.message });
    next(err);
  }
}
