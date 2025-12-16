import Project from "../models/Project.js";
import { projectSchema } from "../utils/validators.js";
import { uploadToMinio } from "../services/fileService.js";
import { StatusCodes } from "http-status-codes";
import AppError from "../utils/appError.js";
import APIFeatures from "../utils/apiFeatures.js";

// Create project
export const createProject = async (req, res, next) => {
  // Variabel penampung file yang SUDAH terupload (untuk kebutuhan rollback)
  let uploadedFiles = [];

  try {
    // 1. Parsing JSON String dari FormData dengan Error Handling
    let bodyData = { ...req.body };

    // Helper function untuk parsing JSON aman
    const safeParse = (key, str) => {
      try {
        return JSON.parse(str);
      } catch (e) {
        // Jika format JSON rusak, lempar error validasi, jangan crash server
        throw new AppError(`Invalid JSON format for field '${key}'`, StatusCodes.BAD_REQUEST);
      }
    };

    if (bodyData.academicInfo && typeof bodyData.academicInfo === "string") {
      bodyData.academicInfo = safeParse("academicInfo", bodyData.academicInfo);
    }
    if (bodyData.teamMembers && typeof bodyData.teamMembers === "string") {
      bodyData.teamMembers = safeParse("teamMembers", bodyData.teamMembers);
    }

    // Bersihkan input string
    if (bodyData.title) bodyData.title = bodyData.title.trim();
    if (bodyData.lecturerId) bodyData.lecturerId = bodyData.lecturerId.trim();

    // 2. Validasi Input (Zod)
    const validatedData = projectSchema.parse(bodyData);

    // 3. PRE-CHECK: Cek Duplikasi Judul di Database (Fail Fast)
    // Sebelum upload file berat-berat, cek dulu apakah judul sudah dipakai student ini?
    const existingProject = await Project.findOne({
      student: req.user.id,
      title: { $regex: new RegExp(`^${validatedData.title}$`, "i") }, // Case insensitive check
    });

    if (existingProject) {
      throw new AppError(
        "You already have a project with this title. Please choose a different title.",
        StatusCodes.BAD_REQUEST
      );
    }

    // 4. Proses Upload File (Parallel Processing)
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => uploadToMinio(file));

      // Tunggu semua upload selesai
      const results = await Promise.all(uploadPromises);

      // Simpan hasil ke variabel di scope luar try-catch agar bisa diakses catch block
      uploadedFiles = results;
    }

    // 5. Simpan ke Database
    // Kita gunakan validatedData agar aman dari data sampah yang tidak diinginkan
    const newProject = await Project.create({
      title: validatedData.title,
      description: validatedData.description,
      type: validatedData.type,
      student: req.user.id,
      lecturer: validatedData.lecturerId,
      academicInfo: validatedData.academicInfo,
      teamMembers: validatedData.teamMembers || [],
      files: uploadedFiles, // Masukkan data file yang berhasil diupload
      status: "pending",
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Project submitted successfully.",
      data: newProject,
    });
  } catch (error) {
    // --- ROLLBACK MECHANISM (PENTING) ---
    // Jika terjadi error APAPUN (Validasi gagal, DB Error, koneksi putus, dll)
    // DAN sudah ada file yang terlanjur terupload ke MinIO, KITA HARUS HAPUS.
    if (uploadedFiles.length > 0) {
      // Jangan gunakan await blocking di sini agar response error ke user cepat.
      // Biarkan proses cleanup berjalan di background.
      Promise.allSettled(uploadedFiles.map((file) => deleteFromMinio(file.url)))
        .then(() => console.log("⚠️ Rollback: Orphan files deleted due to creation error."))
        .catch((err) => console.error("❌ Rollback Failed:", err));
    }

    // Handle Error Duplikat dari MongoDB (Backup jika Pre-Check lolos karena Race Condition)
    if (error.code === 11000) {
      return next(
        new AppError("You already have a project with this title.", StatusCodes.BAD_REQUEST)
      );
    }

    next(error);
  }
};

// Get all projects
export const getAllProjects = async (req, res, next) => {
  try {
    let filterQuery = {};

    // Skenario 1: Public Guest (Tidak Login)
    // -> Hanya melihat Showcase (Approved Projects)
    if (!req.user) {
      filterQuery = { status: "approved" };
    }
    // Skenario 2: User Login
    else {
      const { id, role } = req.user;

      if (role === "admin") {
        // Admin: Lihat SEMUA (Audit Log / History)
        filterQuery = {};
      } else if (role === "student") {
        // Student: HANYA melihat project milik sendiri (Pending, Approved, Rejected)
        // Dashboard Pribadi: "My Projects"
        filterQuery = { student: id };
      } else if (role === "lecturer") {
        // Lecturer: HANYA melihat project yang ditugaskan untuk dia review
        // Dashboard Pribadi: "Assigned Reviews"
        filterQuery = { lecturer: id };
      }
    }

    // Eksekusi Query dengan APIFeatures (Filter, Sort, Pagination)
    const features = new APIFeatures(Project.find(filterQuery), req.query)
      .filter()
      .sort()
      .paginate();

    // Populate data user
    const projects = await features.query
      .populate("student", "name email profileImage academicInfo")
      .populate("lecturer", "name email");

    res.status(StatusCodes.OK).json({
      success: true,
      results: projects.length,
      page: req.query.page * 1 || 1,
      limit: req.query.limit * 1 || 10,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// Get project by id
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("student", "name email academicInfo")
      .populate("lecturer", "name email")
      .populate("teamMembers"); // Tampilkan detail tim juga

    if (!project) {
      return next(new AppError("No project found with that ID", StatusCodes.NOT_FOUND));
    }

    // LOGIKA AKSES KEAMANAN (Privacy Check)
    // Jika status bukan approved, kita harus cek siapa yang akses
    if (project.status !== "approved") {
      // Jika Guest -> Error
      if (!req.user) {
        return next(
          new AppError("Project is under review and not public yet.", StatusCodes.FORBIDDEN)
        );
      }

      // Jika Login, cek hak akses
      const isOwner = String(project.student._id) === req.user.id;
      const isReviewer = String(project.lecturer._id) === req.user.id;
      const isAdmin = req.user.role === "admin";

      if (!isOwner && !isReviewer && !isAdmin) {
        return next(
          new AppError(
            "You do not have permission to view this private project.",
            StatusCodes.FORBIDDEN
          )
        );
      }
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: project,
    });
  } catch (error) {
    // Handle error CastError (ID tidak valid) secara spesifik jika middleware error belum cover
    if (error.name === "CastError") {
      return next(new AppError("Invalid Project ID format", StatusCodes.BAD_REQUEST));
    }
    next(error);
  }
};

export const reviewProject = async (req, res, next) => {
  try {
    const { status, feedback } = req.body;

    // 1. Validasi Input
    if (!status || !["approved", "rejected", "revision"].includes(status)) {
      return next(
        new AppError(
          "Status is required and must be 'approved', 'rejected', or 'revision'",
          StatusCodes.BAD_REQUEST
        )
      );
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return next(new AppError("Project not found", StatusCodes.NOT_FOUND));
    }

    // 2. Authorization Check (Strict Lecturer Only)
    // Admin TIDAK BOLEH review, hanya Dosen yang bersangkutan
    if (String(project.lecturer) !== req.user.id) {
      return next(
        new AppError("Only the assigned lecturer can review this project.", StatusCodes.FORBIDDEN)
      );
    }

    // 3. Update Logic
    project.status = status;
    project.feedback = feedback || "";

    if (status === "approved") {
      project.approvalDate = Date.now();
    } else {
      // Reset approval date jika status berubah jadi reject/revision
      project.approvalDate = undefined;
    }

    await project.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: `Project successfully marked as ${status}`,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(new AppError("Project not found", StatusCodes.NOT_FOUND));
    }

    // 1. Authorization Check (Strict Student Only)
    // Admin TIDAK BOLEH hapus, hanya pemilik (Student)
    if (String(project.student) !== req.user.id) {
      return next(
        new AppError("You do not have permission to delete this project.", StatusCodes.FORBIDDEN)
      );
    }

    // 2. Rule 3 Hari
    const now = new Date();
    const created = new Date(project.createdAt);
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Jika status Approved/Pending DAN sudah lewat 3 hari -> Block
    if (project.status !== "rejected" && diffDays > 3) {
      return next(
        new AppError(
          "Cannot delete project after 3 days. Contact academic support.",
          StatusCodes.FORBIDDEN
        )
      );
    }

    // 3. Hapus File di MinIO (Cleanup Storage)
    if (project.files && project.files.length > 0) {
      // Gunakan Promise.allSettled agar jika 1 file gagal hapus, yang lain tetap terhapus
      const deletePromises = project.files.map((file) => deleteFromMinio(file.url));
      await Promise.allSettled(deletePromises);
    }

    // 4. Hapus Dokumen DB
    await project.deleteOne();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
