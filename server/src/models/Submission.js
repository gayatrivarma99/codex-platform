const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
      index: true,
    },
    language: {
      type: String,
      required: true,
      enum: ['javascript', 'python', 'cpp', 'java'],
    },
    code: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        'Accepted',
        'Wrong Answer',
        'Time Limit Exceeded',
        'Memory Limit Exceeded',
        'Runtime Error',
        'Compilation Error',
        'Pending',
      ],
      default: 'Pending',
    },
    executionTime: {
      type: Number,
      default: 0, // in ms
    },
    memoryUsed: {
      type: Number,
      default: 0, // in MB
    },
    testCasesPassed: {
      type: Number,
      default: 0,
    },
    totalTestCases: {
      type: Number,
      default: 0,
    },
    results: [
      {
        id: String,
        status: String,
        executionTime: Number,
        passed: Boolean,
        error: String,
        // Only public test case details or sanitized info stored
      },
    ],
    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contest',
      default: null,
      index: true,
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      default: null,
      index: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index({ user: 1, problem: 1, status: 1 });
submissionSchema.index({ user: 1, submittedAt: -1 });

module.exports = mongoose.model('Submission', submissionSchema);
