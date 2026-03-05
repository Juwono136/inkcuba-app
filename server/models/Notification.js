import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      enum: ['workspace_assigned', 'submission_reviewed', 'submission_approved', 'submission_published', 'submission_taken_down', 'revision_requested'],
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    body: {
      type: String,
      trim: true,
      maxlength: [1000, 'Body cannot exceed 1000 characters'],
      default: '',
    },
    read: {
      type: Boolean,
      default: false,
    },
    /** Related entity for navigation: workspace id, submission id, etc. */
    relatedId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    /** Optional: workspaceId, cardId, submissionId for filtering */
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });

export default mongoose.model('Notification', notificationSchema);
