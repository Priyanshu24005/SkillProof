const mongoose = require('mongoose');

const challengeResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true,
  },
  skill: {
    type: String,
    enum: ['javascript', 'react', 'nodejs'],
    required: true,
  },
  submittedCode: { type: String, required: true },
  totalTests: { type: Number, required: true },
  passedTests: { type: Number, required: true },
  score: { type: Number, required: true }, // out of 100
  completedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('ChallengeResult', challengeResultSchema);