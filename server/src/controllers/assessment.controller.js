const Question = require('../models/Question');
const AssessmentResult = require('../models/AssessmentResult');

// GET /api/assessment/:skill/start
const startAssessment = async (req, res) => {
  try {
    const { skill } = req.params;

    const questions = await Question.aggregate([
      { $match: { skill } },
      { $sample: { size: 10 } },
    ]);

    if (questions.length < 10) {
      return res.status(400).json({ message: `Not enough questions seeded for ${skill}` });
    }

    // correctAnswer hide karo frontend se
    const safeQuestions = questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
      difficulty: q.difficulty,
    }));

    res.status(200).json({ skill, timeLimitMinutes: 20, questions: safeQuestions });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/assessment/:skill/submit
const submitAssessment = async (req, res) => {
  try {
    const { skill } = req.params;
    const { answers } = req.body; // [{ questionId, selectedOption }]
    const studentId = req.user.id;

    if (!answers || answers.length === 0) {
      return res.status(400).json({ message: 'No answers submitted' });
    }

    const questionIds = answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    let correctCount = 0;
    const evaluatedAnswers = answers.map((a) => {
      const question = questions.find((q) => q._id.toString() === a.questionId);
      const isCorrect = question && question.correctAnswer === a.selectedOption;
      if (isCorrect) correctCount++;
      return {
        question: a.questionId,
        selectedOption: a.selectedOption,
        isCorrect: !!isCorrect,
      };
    });

    const score = Math.round((correctCount / answers.length) * 100);

    const result = await AssessmentResult.create({
      student: studentId,
      skill,
      answers: evaluatedAnswers,
      score,
      totalQuestions: answers.length,
      correctCount,
    });

    res.status(201).json({
      score,
      correctCount,
      totalQuestions: answers.length,
      resultId: result._id,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { startAssessment, submitAssessment };