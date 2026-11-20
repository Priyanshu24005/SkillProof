const AssessmentResult = require('../models/AssessmentResult');
const ChallengeResult = require('../models/ChallengeResult');
const GitHubEvidence = require('../models/GitHubEvidence');
const User = require('../models/users');

const SKILLS = ['javascript', 'react', 'nodejs'];
const DOMAIN_LABELS = {
  javascript: 'Core Language',
  react: 'Frontend Systems',
  nodejs: 'Backend Runtime',
};

const getLatestResult = (results) => {
  if (!results.length) return null;
  return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
};

const computeComposite = (mcq, practical, github) => {
  if (mcq == null || practical == null || github == null) return null;
  return Math.round(mcq * 0.3 + practical * 0.4 + github * 0.3);
};

const getTier = (score) => {
  if (score == null) return null;
  if (score >= 90) return 'Tier 1 Elite';
  if (score >= 75) return 'Tier 1 Confirmed';
  if (score >= 60) return 'Tier 2 Provisional';
  return 'Tier 3 Developing';
};

const buildCompositesForSkill = async (skill) => {
  const [allMcq, allChallenge, allGithub] = await Promise.all([
    AssessmentResult.find({ skill }),
    ChallengeResult.find({ skill }),
    GitHubEvidence.find({ skill }),
  ]);

  const byStudent = {};
  const upsert = (arr, key) => {
    arr.forEach((r) => {
      const sid = r.student.toString();
      byStudent[sid] = byStudent[sid] || {};
      const existingDate = byStudent[sid][`${key}Date`];
      if (!existingDate || new Date(r.createdAt) > new Date(existingDate)) {
        byStudent[sid][key] = r.score;
        byStudent[sid][`${key}Date`] = r.createdAt;
      }
    });
  };
  upsert(allMcq, 'mcq');
  upsert(allChallenge, 'practical');
  upsert(allGithub, 'github');

  return Object.values(byStudent)
    .filter((s) => s.mcq != null && s.practical != null && s.github != null)
    .map((s) => Math.round(s.mcq * 0.3 + s.practical * 0.4 + s.github * 0.3));
};

const getOverview = async (req, res) => {
  try {
    const studentId = req.user.id;
    const user = await User.findById(studentId);

    const skillCards = [];
    let totalComposite = 0;
    let completedSkillsCount = 0;
    let verifiedCredentials = 0;

    for (const skill of SKILLS) {
      const [mcqResults, challengeResults, githubResults] = await Promise.all([
        AssessmentResult.find({ student: studentId, skill }),
        ChallengeResult.find({ student: studentId, skill }),
        GitHubEvidence.find({ student: studentId, skill }),
      ]);

      const mcq = getLatestResult(mcqResults);
      const practical = getLatestResult(challengeResults);
      const github = getLatestResult(githubResults);

      const mcqScore = mcq?.score ?? null;
      const practicalScore = practical?.score ?? null;
      const githubScore = github?.score ?? null;

      const composite = computeComposite(mcqScore, practicalScore, githubScore);
      const stagesDone = [mcqScore, practicalScore, githubScore].filter((s) => s != null).length;

      let status = 'not_started';
      if (stagesDone === 3) status = 'completed';
      else if (stagesDone > 0) status = 'in_progress';

      let percentile = null;
      if (composite != null) {
        const composites = await buildCompositesForSkill(skill);
        if (composites.length > 0) {
          const below = composites.filter((c) => c <= composite).length;
          percentile = Math.round((below / composites.length) * 1000) / 10;
        }
      }

      if (composite != null) {
        totalComposite += composite;
        completedSkillsCount++;
        verifiedCredentials++;
      }

      skillCards.push({
        skill,
        domainLabel: DOMAIN_LABELS[skill],
        status,
        stagesDone,
        mcqScore,
        practicalScore,
        githubScore,
        composite,
        tier: getTier(composite),
        percentile,
      });
    }

    const avgScore = completedSkillsCount > 0 ? Math.round((totalComposite / completedSkillsCount) * 10) / 10 : null;
    const overallTier = getTier(avgScore);

    const [recentMcq, recentChallenge, recentGithub] = await Promise.all([
      AssessmentResult.find({ student: studentId }).sort({ createdAt: -1 }).limit(5),
      ChallengeResult.find({ student: studentId }).sort({ createdAt: -1 }).limit(5),
      GitHubEvidence.find({ student: studentId }).sort({ createdAt: -1 }).limit(5),
    ]);

    const activity = [
      ...recentMcq.map((r) => ({
        type: 'Assessment Completed',
        skill: r.skill,
        result: `${r.score}/100 (${r.correctCount}/${r.totalQuestions} correct)`,
        date: r.createdAt,
      })),
      ...recentChallenge.map((r) => ({
        type: 'Challenge Submitted',
        skill: r.skill,
        result: `${r.score}/100 (${r.passedTests}/${r.totalTests} tests)`,
        date: r.createdAt,
      })),
      ...recentGithub.map((r) => ({
        type: 'GitHub Evidence Analyzed',
        skill: r.skill,
        result: `${r.score}/100 (${r.owner}/${r.repo})`,
        date: r.createdAt,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    res.status(200).json({
      user: { name: user.name, email: user.email, role: user.role },
      overallTier,
      avgScore,
      verifiedCredentials,
      skillCards,
      activity,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getOverview };