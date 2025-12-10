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
    type: {
      type: String,
      enum: ["individual", "team"],
      default: "individual",
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teamMembers: [
      {
        name: { type: String, required: true },
        role: { type: String, required: true }, // Job desc (e.g. Frontend, UI/UX)
      },
    ],
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    academicInfo: {
      batch: String,
      program: String,
      course: String,
    },
    files: [
      {
        filename: String,
        url: String,
        mimetype: String, // video/mp4, application/pdf, etc.
        size: Number,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "revision", "approved", "rejected"],
      default: "pending",
    },
    feedback: {
      type: String,
      default: "",
    },
    approvalDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ title: "text", description: "text" });
projectSchema.index({ student: 1 });
projectSchema.index({ lecturer: 1 });

const Project = mongoose.model("Project", projectSchema);
export default Project;
