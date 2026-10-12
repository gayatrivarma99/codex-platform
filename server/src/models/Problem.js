const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    default: '',
  },
  expectedOutput: {
    type: String,
    required: [true, 'Expected output is required'],
  },
  explanation: {
    type: String,
    default: '',
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
});

const exampleSchema = new mongoose.Schema({
  input: { type: String, default: '' },
  output: { type: String, default: '' },
  explanation: { type: String, default: '' },
});

const starterCodeSchema = new mongoose.Schema({
  javascript: { type: String, default: '' },
  python: { type: String, default: '' },
  cpp: { type: String, default: '' },
  java: { type: String, default: '' },
});

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Problem title is required'],
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Problem description is required'],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: [true, 'Difficulty is required'],
      default: 'Easy',
    },
    topics: {
      type: [String],
      default: [],
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    constraints: {
      type: [String],
      default: [],
    },
    examples: {
      type: [exampleSchema],
      default: [],
    },
    inputFormat: {
      type: String,
      default: '',
    },
    outputFormat: {
      type: String,
      default: '',
    },
    hints: {
      type: [String],
      default: [],
    },
    editorial: {
      type: String,
      default: '',
    },
    starterCode: {
      type: starterCodeSchema,
      default: () => ({}),
    },
    testCases: {
      type: [testCaseSchema],
      select: false, // Do not return testCases by default to prevent leaking hidden test cases!
      default: [],
    },
    timeLimit: {
      type: Number,
      default: 2000, // in ms
    },
    memoryLimit: {
      type: Number,
      default: 64, // in MB
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalSubmissions: {
      type: Number,
      default: 0,
    },
    acceptedSubmissions: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual acceptance rate
problemSchema.virtual('acceptanceRate').get(function () {
  if (!this.totalSubmissions || this.totalSubmissions === 0) return 0;
  return Math.round((this.acceptedSubmissions / this.totalSubmissions) * 100);
});

// Text index for search
problemSchema.index({ title: 'text', description: 'text', tags: 'text', topics: 'text' });

module.exports = mongoose.model('Problem', problemSchema);
