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

// Returns full candidate records (with username/name) for a given skill —
// used by the Recruiter search/filter feature. Reuses the same
// mcq/practical/github aggregation pattern as buildCompositesForSkill,
// but joins against the User model instead of collapsing to bare numbers.
const buildCandidateListForSkill = async (skill) => {
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

  const completedEntries = Object.entries(byStudent).filter(
    ([, s]) => s.mcq != null && s.practical != null && s.github != null
  );

  if (completedEntries.length === 0) return [];

  const studentIds = completedEntries.map(([sid]) => sid);
  const users = await User.find({ _id: { $in: studentIds } }).select('name username');
  const userMap = {};
  users.forEach((u) => { userMap[u._id.toString()] = u; });

  return completedEntries
    .map(([sid, s]) => {
      const user = userMap[sid];
      if (!user) return null; // skip if the user record is missing/deleted

      const compositeScore = Math.round((s.mcq * 0.3 + s.practical * 0.4 + s.github * 0.3) * 10) / 10;
      const lastVerified = [s.mcqDate, s.practicalDate, s.githubDate]
        .filter(Boolean)
        .sort((a, b) => new Date(b) - new Date(a))[0];

      return {
        username: user.username,
        name: user.name,
        compositeScore,
        knowledge: s.mcq,
        practical: s.practical,
        github: s.github,
        lastVerified,
        status: 'completed',
      };
    })
    .filter(Boolean);
};

// Returns "Talent Pool" candidates. If skillFilter is given (and not
// 'all'), returns candidates for that specific skill only (with
// verifiedSkillsCount attached). Otherwise returns every student's BEST
// (highest composite) completed skill across all 3 skills — used as the
// default global ranking view.
const buildTalentPool = async (skillFilter) => {
  const perSkillLists = await Promise.all(SKILLS.map((skill) => buildCandidateListForSkill(skill)));

  // Count how many total skills each username has completed, regardless of filter
  const skillCountByUsername = {};
  perSkillLists.forEach((list) => {
    list.forEach((entry) => {
      skillCountByUsername[entry.username] = (skillCountByUsername[entry.username] || 0) + 1;
    });
  });

  if (skillFilter && skillFilter !== 'all') {
    const index = SKILLS.indexOf(skillFilter);
    const list = index === -1 ? [] : perSkillLists[index];
    return list.map((entry) => ({
      ...entry,
      skill: skillFilter,
      verifiedSkillsCount: skillCountByUsername[entry.username] || 1,
    }));
  }

  const byUsername = {};
  perSkillLists.forEach((list, i) => {
    const skill = SKILLS[i];
    list.forEach((entry) => {
      const existing = byUsername[entry.username];
      if (!existing) {
        byUsername[entry.username] = {
          username: entry.username,
          name: entry.name,
          skill,
          compositeScore: entry.compositeScore,
          knowledge: entry.knowledge,
          practical: entry.practical,
          github: entry.github,
          lastVerified: entry.lastVerified,
          verifiedSkillsCount: skillCountByUsername[entry.username],
        };
      } else {
        // keep whichever skill has the higher composite as the "primary" one shown
        if (entry.compositeScore > existing.compositeScore) {
          existing.skill = skill;
          existing.compositeScore = entry.compositeScore;
          existing.knowledge = entry.knowledge;
          existing.practical = entry.practical;
          existing.github = entry.github;
        }
        if (new Date(entry.lastVerified) > new Date(existing.lastVerified)) {
          existing.lastVerified = entry.lastVerified;
        }
      }
    });
  });

  return Object.values(byUsername);
};

// Aggregate stats for the Recruiter Dashboard overview page: total
// verified candidates, per-skill candidate count + avg score, tier
// distribution, and a recent-activity feed across ALL students (not
// just one). This is a genuine "dashboard" view, distinct from the
// candidate search/browse experience on the Talent Pool page.
const buildRecruiterStats = async () => {
  const overall = await buildTalentPool('all');

  const totalVerifiedCandidates = overall.length;

  const tierDistribution = { tier1: 0, tier2: 0, belowThreshold: 0 };
  overall.forEach((c) => {
    if (c.compositeScore >= 85) tierDistribution.tier1 += 1;
    else if (c.compositeScore >= 70) tierDistribution.tier2 += 1;
    else tierDistribution.belowThreshold += 1;
  });

  const perSkill = {};
  for (const skill of SKILLS) {
    const list = await buildCandidateListForSkill(skill);
    const avgScore = list.length === 0
      ? 0
      : Math.round((list.reduce((sum, c) => sum + c.compositeScore, 0) / list.length) * 10) / 10;
    perSkill[skill] = { count: list.length, avgScore };
  }

  // Recent activity feed: latest evidence completions across all students, any type
  const [recentMcq, recentChallenge, recentGithub] = await Promise.all([
    AssessmentResult.find().sort({ createdAt: -1 }).limit(10).populate('student', 'name username'),
    ChallengeResult.find().sort({ createdAt: -1 }).limit(10).populate('student', 'name username'),
    GitHubEvidence.find().sort({ createdAt: -1 }).limit(10).populate('student', 'name username'),
  ]);

  const recentActivity = [
    ...recentMcq.filter((r) => r.student).map((r) => ({
      type: 'Knowledge Assessment',
      name: r.student.name,
      username: r.student.username,
      skill: r.skill,
      score: r.score,
      date: r.createdAt,
    })),
    ...recentChallenge.filter((r) => r.student).map((r) => ({
      type: 'Coding Challenge',
      name: r.student.name,
      username: r.student.username,
      skill: r.skill,
      score: r.score,
      date: r.createdAt,
    })),
    ...recentGithub.filter((r) => r.student).map((r) => ({
      type: 'GitHub Evidence',
      name: r.student.name,
      username: r.student.username,
      skill: r.skill,
      score: r.score,
      date: r.createdAt,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

  return { totalVerifiedCandidates, tierDistribution, perSkill, recentActivity };
};

const buildStudentOverview = async (studentId) => {
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

  return { skillCards, avgScore, overallTier, verifiedCredentials, activity };
};

module.exports = {
  buildStudentOverview,
  buildCompositesForSkill,
  buildCandidateListForSkill,
  buildTalentPool,
  buildRecruiterStats,
  SKILLS,
};