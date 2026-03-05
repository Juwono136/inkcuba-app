import User from '../models/User.js';
import logger from '../logger/index.js';
import { parseExcel } from '../utils/parseExcel.js';
import { parseCsv } from '../utils/parseCsv.js';

function getColumnKey(headers, patterns) {
  for (const p of patterns) {
    const found = headers.find((h) => p.test(String(h || '')));
    if (found) return found;
  }
  return null;
}

/** POST /api/lecturer/students/match-from-file - parse file, match by email, return matched users (for create workspace flow) */
export async function matchStudentsFromFile(req, res, next) {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'No file provided. Use template: Student Name, Student Code, Student Email, Academic Program.',
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
    const emailKey = getColumnKey(headers, [/student\s*email|email/i]);
    if (!emailKey) {
      return res.status(400).json({
        success: false,
        message: 'File must contain a "Student Email" column to match accounts.',
      });
    }
    const nameKey = getColumnKey(headers, [/student\s*name|name/i]);
    const codeKey = getColumnKey(headers, [/student\s*code|code|id/i]);
    const programKey = getColumnKey(headers, [/academic\s*program|program/i]);
    const normalizedRows = rows.map((r) => ({
      name: (nameKey ? (r[nameKey] || '').trim() : '').slice(0, 120),
      studentCode: (codeKey ? (r[codeKey] || '').trim() : '').slice(0, 80),
      email: (r[emailKey] || '').trim().toLowerCase().slice(0, 200),
      program: (programKey ? (r[programKey] || '').trim() : '').slice(0, 120),
    })).filter((row) => row.email);
    const uniqueByEmail = new Map();
    for (const row of normalizedRows) {
      if (!uniqueByEmail.has(row.email)) uniqueByEmail.set(row.email, row);
    }
    const toProcess = [...uniqueByEmail.values()];
    const emails = toProcess.map((r) => r.email).filter(Boolean);
    const existingUsers = await User.find({ role: 'student', email: { $in: emails } })
      .select('_id name email studentCode program avatarUrl')
      .lean();
    const byEmail = new Map(existingUsers.map((u) => [u.email.toLowerCase(), u]));
    const matched = [];
    let notFoundCount = 0;
    for (const row of toProcess) {
      const user = byEmail.get(row.email);
      if (!user) {
        notFoundCount += 1;
        continue;
      }
      matched.push({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        studentCode: user.studentCode || '',
        program: user.program || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
    res.json({
      success: true,
      data: { matched, notFoundCount, totalRows: toProcess.length },
    });
  } catch (err) {
    logger.error('Match from file error', { error: err.message });
    next(err);
  }
}

/** GET /api/lecturer/students - search students by name, email, or program (for adding to workspace) */
export async function searchStudents(req, res, next) {
  try {
    const { q = '', program = '' } = req.query || {};
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);

    const filter = { role: 'student', isActive: true };

    const searchTrim = typeof q === 'string' ? q.trim() : '';
    if (searchTrim) {
      const regex = new RegExp(searchTrim, 'i');
      filter.$or = [
        { name: regex },
        { email: regex },
        { program: regex },
      ];
    }

    const programTrim = typeof program === 'string' ? program.trim() : '';
    if (programTrim) {
      filter.program = new RegExp(programTrim, 'i');
    }

    const students = await User.find(filter)
      .select('name email program studentCode avatarUrl')
      .limit(limit)
      .sort({ name: 1 })
      .lean();

    const data = students.map((s) => ({
      id: s._id,
      name: s.name,
      email: s.email,
      program: s.program || '',
      studentCode: s.studentCode || '',
      avatarUrl: s.avatarUrl || '',
    }));

    res.json({ success: true, data });
  } catch (err) {
    logger.error('Search students error', { error: err.message });
    next(err);
  }
}
