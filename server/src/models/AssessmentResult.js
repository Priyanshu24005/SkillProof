const mongoose = require('mongoose');

const assessmentResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  skill: {
    type: String,
    enum: ['javascript', 'react', 'nodejs'],
    required: true,
  },
  answers: [
    {
      question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
      selectedOption: { type: Number },
      isCorrect: { type: Boolean },
    },
  ],
  score: { type: Number, required: true }, // out of 100
  totalQuestions: { type: Number, required: true },
  correctCount: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('AssessmentResult', assessmentResultSchema);