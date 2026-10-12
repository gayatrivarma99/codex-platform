const mongoose = require('mongoose');

const contestProblemSchema = new mongoose.Schema({
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
  },
  points: {
    type: Number,
    default: 100,
  },
  order: {
    type: Number,
    default: 1,
  },
});

const participantSubmissionSchema = new mongoose.Schema({
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
  },
  status: {
    type: String,
    enum: ['Accepted', 'Failed', 'Pending'],
  },
  solvedAt: Date,
  attempts: {
    type: Number,
    default: 0,
  },
  points: {
    type: Number,
    default: 0,
  },
});

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
  score: {
    type: Number,
    default: 0,
  },
  penalty: {
    type: Number,
    default: 0, // In minutes
  },
  submissions: [participantSubmissionSchema],
});

const contestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Contest title is required'],
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
      index: true,
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
      index: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    problems: [contestProblemSchema],
    participants: [participantSchema],
    status: {
      type: String,
      enum: ['upcoming', 'live', 'completed'],
      default: 'upcoming',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Method to compute dynamic status based on current server time
contestSchema.methods.getCurrentStatus = function () {
  const now = new Date();
  if (now < this.startTime) return 'upcoming';
  if (now >= this.startTime && now <= this.endTime) return 'live';
  return 'completed';
};

module.exports = mongoose.model('Contest', contestSchema);
