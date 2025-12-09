import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
    },
    // Tipe Project
    type: {
      type: String,
      enum: ["individual", "team"],
      default: "individual",
    },
    // Pemilik Project (Student Utama)
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Jika Team, simpan nama anggotanya
    teamMembers: [
      {
        name: { type: String, required: true },
        role: { type: String, required: true }, // Job desc (e.g. Frontend, UI/UX)
      },
    ],
    // Dosen Pembimbing / Reviewer
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Metadata Akademik (Snapshot saat project dibuat)
    academicInfo: {
      batch: String,
      program: String,
      course: String, // Mata kuliah terkait
    },
    // File-file (Source code, Video, Dokumen)
    files: [
      {
        filename: String,
        url: String, // Path di MinIO nanti
        mimetype: String, // video/mp4, application/pdf, etc.
        size: Number,
      },
    ],
    // Status Workflow
    status: {
      type: String,
      enum: ["pending", "revision", "approved", "rejected"],
      default: "pending",
    },
    // Catatan dari Dosen jika reject/revisi
    feedback: {
      type: String,
      default: "",
    },
    approvalDate: {
      type: Date,
    },
  },
  {
    timestamps: true, // createdAt dipakai untuk hitung batas waktu 3 hari
  }
);

// Indexing agar pencarian cepat
projectSchema.index({ title: "text", description: "text" }); // Untuk fitur search
projectSchema.index({ student: 1 }); // Cepat cari project per student
projectSchema.index({ lecturer: 1 }); // Cepat cari project per dosen

const Project = mongoose.model("Project", projectSchema);
export default Project;
