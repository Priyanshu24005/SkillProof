const { buildRecruiterStats } = require('../services/evidence.service');

// GET /api/recruiter/stats
async function getRecruiterStats(req, res) {
  try {
    const stats = await buildRecruiterStats();
    res.json(stats);
  } catch (err) {
    console.error('getRecruiterStats error:', err);
    res.status(500).json({ message: 'Unable to fetch recruiter stats.' });
  }
}

module.exports = { getRecruiterStats };