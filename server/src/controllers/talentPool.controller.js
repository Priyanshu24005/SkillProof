const { buildTalentPool } = require('../services/evidence.service');

// GET /api/recruiter/talent-pool?skill=react&minScore=80&tier=tier1&sortBy=score_desc&page=1
// skill is optional — omit or pass 'all' for the global best-skill ranking.
async function getTalentPool(req, res) {
  try {
    const { skill = 'all', minScore = 0, tier = 'all', sortBy = 'score_desc', page = 1 } = req.query;
    const min = Number(minScore) || 0;
    const pageNum = Number(page) || 1;
    const pageSize = 20;

    const allCandidates = await buildTalentPool(skill);

    let filtered = allCandidates.filter((c) => c.compositeScore >= min);

    if (tier === 'tier1') {
      filtered = filtered.filter((c) => c.compositeScore >= 85);
    } else if (tier === 'tier2') {
      filtered = filtered.filter((c) => c.compositeScore >= 70 && c.compositeScore < 85);
    }

    if (sortBy === 'score_desc') {
      filtered.sort((a, b) => b.compositeScore - a.compositeScore);
    } else if (sortBy === 'date_desc') {
      filtered.sort((a, b) => new Date(b.lastVerified) - new Date(a.lastVerified));
    }

    const total = filtered.length;
    const avgScore = total === 0 ? 0 : filtered.reduce((sum, c) => sum + c.compositeScore, 0) / total;

    const start = (pageNum - 1) * pageSize;
    const pageResults = filtered.slice(start, start + pageSize);

    res.json({
      candidates: pageResults.map((c) => ({
        username: c.username,
        name: c.name,
        skill: c.skill,
        compositeScore: c.compositeScore,
        knowledge: c.knowledge,
        practical: c.practical,
        github: c.github,
        lastVerified: c.lastVerified,
        verifiedSkillsCount: c.verifiedSkillsCount,
      })),
      total,
      avgScore,
      page: pageNum,
      pageSize,
    });
  } catch (err) {
    console.error('getTalentPool error:', err);
    res.status(500).json({ message: 'Unable to fetch talent pool.' });
  }
}

module.exports = { getTalentPool };