const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  skill: {
    type: String,
    enum: ['javascript', 'react', 'nodejs'],
    required: true,
  },
  questionText: { type: String, required: true },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (arr) => arr.length >= 2,
      message: 'At least 2 options required',
    },
  },
  correctAnswer: {
    type: Number, // index into options array
    required: true,
    validate: {
      validator: function (val) {
        return val >= 0 && val < this.options.length;
      },
      message: 'correctAnswer index out of range',
    },
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);