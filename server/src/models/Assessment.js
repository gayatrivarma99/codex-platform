const mongoose = require('mongoose');

const assessmentProblemSchema = new mongoose.Schema({
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
  },
  points: {
    type: Number,
    default: 100,
  },
});

const candidateSubmissionSchema = new mongoose.Schema({
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
  },
  submission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
  },
  score: {
    type: Number,
    default: 0,
  },
});

const candidateSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['invited', 'in_progress', 'completed'],
    default: 'invited',
  },
  startedAt: Date,
  submittedAt: Date,
  score: {
    type: Number,
    default: 0,
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
  passed: {
    type: Boolean,
    default: false,
  },
  problemSubmissions: [candidateSubmissionSchema],
});

const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assessment title is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Assessment access code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // In minutes
      required: true,
      default: 60,
    },
    passingScore: {
      type: Number, // Percentage (e.g. 70)
      default: 60,
    },
    maxAttempts: {
      type: Number,
      default: 1,
    },
    problems: [assessmentProblemSchema],
    candidates: [candidateSchema],
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

module.exports = mongoose.model('Assessment', assessmentSchema);
