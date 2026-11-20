const mongoose = require('mongoose');

const githubEvidenceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skill: { type: String, enum: ['javascript', 'react', 'nodejs'], required: true },
  repoUrl: { type: String, required: true },
  owner: { type: String, required: true },
  repo: { type: String, required: true },
  score: { type: Number, required: true },
  breakdown: {
    languageMatchScore: Number,
    activityScore: Number,
    structureScore: Number,
    documentationScore: Number,
  },
  raw: {
    languages: mongoose.Schema.Types.Mixed,
    commitCount: Number,
    stars: Number,
    hasPackageJson: Boolean,
    hasReadme: Boolean,
  },
}, { timestamps: true });

module.exports = mongoose.model('GitHubEvidence', githubEvidenceSchema);