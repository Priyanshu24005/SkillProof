/**
 * Demo/presentation seed script.
 *
 * Creates:
 *  - 6 "recruiter demo" student accounts, each with complete React
 *    evidence (MCQ + Challenge + GitHub) so the Recruiter Dashboard has
 *    realistic candidates to show, spanning Tier 1 Elite down to
 *    Tier 2 Provisional.
 *  - 1 well-rounded student account with all 3 skills completed, for
 *    demoing the student Dashboard/Skills/Passport pages.
 *  - 1 recruiter account to log in as during the demo.
 *
 * IMPORTANT: this script looks up an existing Challenge document per
 * skill (via Challenge.findOne({ skill })) to satisfy the required
 * `challenge` ref on ChallengeResult. Run your existing
 * `npm run seed:challenges` and `npm run seed:questions` scripts FIRST,
 * or this script will skip challenge results for any skill with no
 * seeded Challenge and print a warning.
 *
 * Usage (from the server/ folder, so .env is picked up automatically):
 *   node src/seed/demo.seed.js
 *
 * Safe to re-run: it upserts users by username/email and clears each
 * demo user's previous evidence before re-inserting, so running it
 * twice won't create duplicates.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../models/users');
const AssessmentResult = require('../models/AssessmentResult');
const ChallengeResult = require('../models/ChallengeResult');
const GitHubEvidence = require('../models/GitHubEvidence');
const Challenge = require('../models/Challenge');

const DEMO_PASSWORD = 'Password123!';

// Recruiter-facing demo candidates — all completed for 'react' only.
const CANDIDATES = [
  { name: 'Elena Rostova', username: 'erostova', email: 'erostova@demo.skillproof.dev', mcq: 96, practical: 95, github: 91 },
  { name: 'Marcus Thorne', username: 'mthorne', email: 'mthorne@demo.skillproof.dev', mcq: 88, practical: 92, github: 93 },
  { name: 'Alex Lin', username: 'alexlin', email: 'alexlin@demo.skillproof.dev', mcq: 92, practical: 85, github: 89 },
  { name: 'Tariq Mansour', username: 'tmansour', email: 'tmansour@demo.skillproof.dev', mcq: 90, practical: 84, github: 86 },
  { name: 'Siddharth Nair', username: 'snair', email: 'snair@demo.skillproof.dev', mcq: 88, practical: 80, github: 83 },
  { name: 'Karin Lindqvist', username: 'klindqvist', email: 'klindqvist@demo.skillproof.dev', mcq: 84, practical: 81, github: 81 },
];

// One well-rounded student — all 3 skills, for showing the student side.
const SHOWCASE_STUDENT = {
  name: 'Demo Student',
  username: 'demo_student',
  email: 'demo.student@demo.skillproof.dev',
  skills: {
    react: { mcq: 90, practical: 86, github: 88 },
    javascript: { mcq: 92, practical: 88, github: 85 },
    nodejs: { mcq: 84, practical: 80, github: 82 },
  },
};

const DEMO_RECRUITER = {
  name: 'Demo Recruiter',
  username: 'demo_recruiter',
  email: 'demo.recruiter@demo.skillproof.dev',
};

const GITHUB_REPOS = [
  { owner: 'erostova', repo: 'realtime-dashboard' },
  { owner: 'mthorne', repo: 'go-service-mesh' },
  { owner: 'alexlin', repo: 'react-commerce-app' },
  { owner: 'tmansour', repo: 'e-learning-platform' },
  { owner: 'snair', repo: 'task-tracker-react' },
  { owner: 'klindqvist', repo: 'portfolio-site' },
  { owner: 'demo_student', repo: 'fullstack-project' },
];

async function upsertUser({ name, username, email, role }) {
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await User.findOneAndUpdate(
    { username },
    { name, username, email, password: hashedPassword, role, isVerified: true },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return user;
}

async function clearEvidence(studentId, skill) {
  await Promise.all([
    AssessmentResult.deleteMany({ student: studentId, skill }),
    ChallengeResult.deleteMany({ student: studentId, skill }),
    GitHubEvidence.deleteMany({ student: studentId, skill }),
  ]);
}

async function seedEvidenceForSkill(student, skill, { mcq, practical, github }, repo) {
  await clearEvidence(student._id, skill);

  const totalQuestions = 25;
  const correctCount = Math.round((mcq / 100) * totalQuestions);
  await AssessmentResult.create({
    student: student._id,
    skill,
    answers: [],
    score: mcq,
    totalQuestions,
    correctCount,
  });

  const challengeDoc = await Challenge.findOne({ skill });
  if (!challengeDoc) {
    console.warn(`  ! No seeded Challenge found for skill "${skill}" — skipping ChallengeResult for ${student.username}. Run seed:challenges first.`);
  } else {
    const totalTests = 12;
    const passedTests = Math.round((practical / 100) * totalTests);
    await ChallengeResult.create({
      student: student._id,
      challenge: challengeDoc._id,
      skill,
      submittedCode: '// Demo submission — seeded for presentation purposes\nfunction solution(input) {\n  return input;\n}',
      totalTests,
      passedTests,
      score: practical,
    });
  }

  await GitHubEvidence.create({
    student: student._id,
    skill,
    repoUrl: `https://github.com/${repo.owner}/${repo.repo}`,
    owner: repo.owner,
    repo: repo.repo,
    score: github,
    breakdown: {
      languageMatchScore: Math.round(github * 0.4),
      activityScore: Math.round(github * 0.25),
      structureScore: Math.round(github * 0.2),
      documentationScore: Math.round(github * 0.15),
    },
    raw: {
      languages: { [skill]: 100 },
      commitCount: 120 + Math.round(Math.random() * 200),
      stars: Math.round(Math.random() * 40),
      hasPackageJson: true,
      hasReadme: true,
    },
  });
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB for demo seeding.\n');

  console.log('Seeding recruiter-facing candidates (skill: react)...');
  for (const candidate of CANDIDATES) {
    const user = await upsertUser({
      name: candidate.name,
      username: candidate.username,
      email: candidate.email,
      role: 'student',
    });
    const repo = GITHUB_REPOS.find((r) => r.owner === candidate.username);
    await seedEvidenceForSkill(user, 'react', candidate, repo);
    console.log(`  \u2713 ${candidate.name} (@${candidate.username})`);
  }

  console.log('\nSeeding showcase student (all 3 skills)...');
  const showcaseUser = await upsertUser({
    name: SHOWCASE_STUDENT.name,
    username: SHOWCASE_STUDENT.username,
    email: SHOWCASE_STUDENT.email,
    role: 'student',
  });
  const showcaseRepo = GITHUB_REPOS.find((r) => r.owner === SHOWCASE_STUDENT.username);
  for (const [skill, scores] of Object.entries(SHOWCASE_STUDENT.skills)) {
    await seedEvidenceForSkill(showcaseUser, skill, scores, showcaseRepo);
  }
  console.log(`  \u2713 ${SHOWCASE_STUDENT.name} (@${SHOWCASE_STUDENT.username})`);

  console.log('\nSeeding demo recruiter account...');
  await upsertUser({
    name: DEMO_RECRUITER.name,
    username: DEMO_RECRUITER.username,
    email: DEMO_RECRUITER.email,
    role: 'recruiter',
  });
  console.log(`  \u2713 ${DEMO_RECRUITER.name} (@${DEMO_RECRUITER.username})`);

  console.log('\nDone. Demo login credentials (all accounts share one password):');
  console.log(`  Password for all: ${DEMO_PASSWORD}`);
  console.log(`  Recruiter: ${DEMO_RECRUITER.email}`);
  console.log(`  Showcase student: ${SHOWCASE_STUDENT.email}`);
  console.log(`  Candidates: ${CANDIDATES.map((c) => c.email).join(', ')}`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Demo seed failed:', err);
  process.exit(1);
});