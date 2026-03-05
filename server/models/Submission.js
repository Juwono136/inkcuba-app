import mongoose from 'mongoose';

const externalLinkSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, maxlength: [120, 'Link title cannot exceed 120 characters'] },
    url: { type: String, trim: true, maxlength: [500, 'URL cannot exceed 500 characters'] },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    card: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'need_revision', 'approved', 'published', 'taken_down'],
      default: 'draft',
      index: true,
    },
    // --- Basic info (step 1) ---
    projectName: { type: String, trim: true, maxlength: [200, 'Project name cannot exceed 200 characters'], default: '' },
    description: { type: String, trim: true, maxlength: [5000, 'Description cannot exceed 5000 characters'], default: '' },
    category: { type: String, trim: true, maxlength: [120, 'Category cannot exceed 120 characters'], default: '' },
    tags: [{ type: String, trim: true, maxlength: 80 }],
    // --- Media (step 2) - stored in MinIO under portfolios/{submissionId}/ ---
    /** Up to 5 screenshot keys (e.g. "screenshot-1.jpg") */
    screenshots: { type: [String], default: [], validate: [arr => arr.length <= 5, 'Maximum 5 screenshots'] },
    /** Single poster image key */
    projectPoster: { type: String, trim: true, default: '' },
    /** PDF report key */
    detailedReport: { type: String, trim: true, default: '' },
    /** YouTube/Vimeo etc. - for preview/embed on site */
    videoUrl: { type: String, trim: true, maxlength: [500], default: '' },
    /** Up to 3 external links */
    externalLinks: {
      type: [externalLinkSchema],
      default: [],
      validate: [arr => arr.length <= 3, 'Maximum 3 external links'],
    },
    // --- Review ---
    /** Lecturer feedback when status is need_revision or taken_down */
    feedback: { type: String, trim: true, maxlength: [2000], default: '' },
    /** Optional assessment/grade from lecturer */
    assessment: { type: String, trim: true, maxlength: [500], default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    submittedAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },
    /** Reason when status is taken_down */
    takenDownReason: { type: String, trim: true, maxlength: [500], default: '' },
  },
  { timestamps: true }
);

submissionSchema.index({ workspace: 1, card: 1, student: 1 }, { unique: true });
submissionSchema.index({ student: 1, status: 1, createdAt: -1 });
submissionSchema.index({ workspace: 1, status: 1 });
submissionSchema.index({ card: 1, status: 1 });

export default mongoose.model('Submission', submissionSchema);
