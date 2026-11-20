const mongoose = require('mongoose');

const savedCandidateSchema = new mongoose.Schema({
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  candidateUsername: { type: String, required: true },
  candidateName: { type: String },
  skill: { type: String },
  compositeScore: { type: Number },
}, { timestamps: true });

// One recruiter can only save the same candidate once
savedCandidateSchema.index({ recruiter: 1, candidateUsername: 1 }, { unique: true });

module.exports = mongoose.model('SavedCandidate', savedCandidateSchema);