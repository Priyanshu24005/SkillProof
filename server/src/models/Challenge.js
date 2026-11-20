const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "test_01_respects_max_concurrency"
  input: { type: [mongoose.Schema.Types.Mixed], required: true },
  expectedOutput: { type: mongoose.Schema.Types.Mixed, required: true },
}, { _id: false });

const challengeSchema = new mongoose.Schema({
  skill: {
    type: String,
    enum: ['javascript', 'react', 'nodejs'],
    required: true,
  },
  title: { type: String, required: true },
  prompt: { type: String, required: true },
  functionName: { type: String, required: true },
  starterCode: { type: String, required: true },
  testCases: {
    type: [testCaseSchema],
    required: true,
    validate: {
      validator: (arr) => arr.length >= 1,
      message: 'At least 1 test case required',
    },
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
}, { timestamps: true });

module.exports = mongoose.model('Challenge', challengeSchema);