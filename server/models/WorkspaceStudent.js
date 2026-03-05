import mongoose from 'mongoose';

const workspaceStudentSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

workspaceStudentSchema.index({ workspace: 1, student: 1 }, { unique: true });
workspaceStudentSchema.index({ student: 1 });

export default mongoose.model('WorkspaceStudent', workspaceStudentSchema);
