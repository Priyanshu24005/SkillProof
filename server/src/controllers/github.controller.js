const GitHubEvidence = require('../models/GitHubEvidence');
const { evaluateRepo } = require('../services/github.service');

const submitGithubEvidence = async (req, res) => {
  try {
    const { skill } = req.params;
    const { repoUrl } = req.body;
    const studentId = req.user.id;

    if (!repoUrl) {
      return res.status(400).json({ message: 'repoUrl is required' });
    }

    const evaluation = await evaluateRepo(repoUrl, skill);

    const result = await GitHubEvidence.create({
      student: studentId,
      skill,
      repoUrl,
      owner: evaluation.owner,
      repo: evaluation.repo,
      score: evaluation.finalScore,
      breakdown: evaluation.breakdown,
      raw: evaluation.raw,
    });

    res.status(201).json({
      score: evaluation.finalScore,
      breakdown: evaluation.breakdown,
      raw: evaluation.raw,
      timeline: evaluation.timeline,
      resultId: result._id,
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ message: 'Repository not found or private' });
    }
    if (err.response?.status === 403) {
      return res.status(403).json({ message: 'GitHub API rate limit exceeded' });
    }
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

module.exports = { submitGithubEvidence };