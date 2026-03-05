import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Card name is required'],
      trim: true,
      maxlength: [200, 'Card name cannot exceed 200 characters'],
    },
    cardType: {
      type: String,
      required: [true, 'Card type is required'],
      trim: true,
      maxlength: [100, 'Card type cannot exceed 100 characters'],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    isGroupCard: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['draft', 'locked'],
      default: 'draft',
    },
    /** When the card becomes visible/accessible. If now < startDate, card is not accessible. */
    startDate: {
      type: Date,
      default: null,
    },
    /** Due date for the card/project. */
    dueDate: {
      type: Date,
      default: null,
    },
    /** For group cards: number of groups (optional, derived from assignments if not set). */
    groupCount: {
      type: Number,
      default: null,
    },
    /** Assignments: individual [{ slotIndex, studentId }] or group [{ groupIndex, memberIds: [studentId] }] */
    assignments: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
  },
  { timestamps: true }
);

cardSchema.index({ workspace: 1, createdAt: 1 });

export default mongoose.model('Card', cardSchema);
