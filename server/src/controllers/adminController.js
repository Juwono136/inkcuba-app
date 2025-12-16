import * as XLSX from "xlsx";
import { userQueue } from "../config/queue.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import AppError from "../utils/appError.js";
import { StatusCodes } from "http-status-codes";

// 1. BULK UPLOAD USERS
export const bulkUploadUsers = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError("Please upload an Excel file", StatusCodes.BAD_REQUEST));
    }

    // A. Baca File Excel dari Memory (Buffer)
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0]; // Ambil sheet pertama
    const worksheet = workbook.Sheets[sheetName];

    // Konversi Excel ke JSON
    // Format Excel diharapkan: Name, Email, Role, Batch, Program
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    if (rawData.length === 0) {
      return next(new AppError("Excel file is empty", StatusCodes.BAD_REQUEST));
    }

    // B. Masukkan ke Queue (Antrian)
    // Loop data dan masukkan job ke Redis
    const jobs = rawData.map((row) => ({
      name: "createUser",
      data: {
        name: row.Name || row.name,
        email: row.Email || row.email,
        role: (row.Role || row.role || "student").toLowerCase(),
        academicInfo: {
          batch: row.Batch || row.batch,
          program: row.Program || row.program,
        },
      },
      opts: {
        attempts: 3, // Coba 3x jika gagal (misal koneksi email putus)
        backoff: 5000, // Tunggu 5 detik sebelum retry
      },
    }));

    await userQueue.addBulk(jobs);

    // C. Response Cepat (Tanpa menunggu email terkirim)
    res.status(StatusCodes.OK).json({
      success: true,
      message: `Processing started for ${jobs.length} users. Emails will be sent in the background.`,
      count: jobs.length,
    });
  } catch (error) {
    next(error);
  }
};

// 2. DASHBOARD STATS (Chart Data)
export const getDashboardStats = async (req, res, next) => {
  try {
    // Jalankan query secara paralel agar cepat
    const [totalStudents, totalLecturers, totalProjects, projectStatus] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "lecturer" }),
      Project.countDocuments(),
      Project.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        users: {
          students: totalStudents,
          lecturers: totalLecturers,
        },
        projects: {
          total: totalProjects,
          byStatus: projectStatus, // e.g., [{ _id: 'approved', count: 10 }, ...]
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
