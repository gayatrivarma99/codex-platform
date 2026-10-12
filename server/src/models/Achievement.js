const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: 'Award',
    },
    category: {
      type: String,
      enum: ['problems', 'streak', 'contest', 'special'],
      default: 'problems',
    },
    criteria: {
      type: { type: String, required: true }, // 'problems_solved', 'streak_days', 'contests_joined', etc.
      target: { type: Number, required: true },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Achievement', achievementSchema);
