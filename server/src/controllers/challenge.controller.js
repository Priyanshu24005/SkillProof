const Challenge = require('../models/Challenge');
const ChallengeResult = require('../models/ChallengeResult');

const startChallenge = async (req, res) => {
  try {
    const { skill } = req.params;

    const count = await Challenge.countDocuments({ skill });
    if (count === 0) {
      return res.status(400).json({ message: `No challenges seeded for ${skill}` });
    }

    const random = Math.floor(Math.random() * count);
    const challenge = await Challenge.findOne({ skill }).skip(random);

    res.status(200).json({
      _id: challenge._id,
      title: challenge.title,
      prompt: challenge.prompt,
      starterCode: challenge.starterCode,
      functionName: challenge.functionName,
      testCases: challenge.testCases,
      difficulty: challenge.difficulty,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const submitChallenge = async (req, res) => {
  try {
    const { skill } = req.params;
    const { challengeId, code, passedTests, totalTests } = req.body;
    const studentId = req.user.id;

    if (!challengeId || typeof passedTests !== 'number' || typeof totalTests !== 'number') {
      return res.status(400).json({ message: 'Invalid submission data' });
    }

    const score = Math.round((passedTests / totalTests) * 100);

    const result = await ChallengeResult.create({
      student: studentId,
      challenge: challengeId,
      skill,
      submittedCode: code,
      totalTests,
      passedTests,
      score,
    });

    res.status(201).json({ score, passedTests, totalTests, resultId: result._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { startChallenge, submitChallenge };