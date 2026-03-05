import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [750, 'Description cannot exceed 750 characters'],
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft',
    },
    course: {
      type: String,
      trim: true,
      maxlength: [120, 'Course cannot exceed 120 characters'],
      default: '',
    },
    classBatch: {
      type: String,
      trim: true,
      maxlength: [80, 'Class/Batch cannot exceed 80 characters'],
      default: '',
    },
    semester: {
      type: String,
      trim: true,
      maxlength: [80, 'Semester cannot exceed 80 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

workspaceSchema.index({ createdBy: 1, createdAt: -1 });
workspaceSchema.index({ name: 'text', description: 'text', course: 'text', classBatch: 'text', semester: 'text' });
workspaceSchema.index({ status: 1 });
workspaceSchema.index({ course: 1, semester: 1 });

export default mongoose.model('Workspace', workspaceSchema);
