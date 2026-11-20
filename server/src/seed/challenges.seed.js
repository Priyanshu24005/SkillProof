require('dotenv').config();
const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');

const challenges = [
  // JavaScript
  {
    skill: 'javascript',
    title: 'Reverse a String',
    prompt: 'Write a function called `reverseString` that takes a string and returns it reversed.',
    functionName: 'reverseString',
    starterCode: 'function reverseString(str) {\n  // your code here\n}',
    testCases: [
      { input: ['hello'], expectedOutput: 'olleh' },
      { input: ['SkillProof'], expectedOutput: 'foorPllikS' },
      { input: [''], expectedOutput: '' },
    ],
    difficulty: 'easy',
  },
  {
    skill: 'javascript',
    title: 'Find Maximum in Array',
    prompt: 'Write a function called `findMax` that takes an array of numbers and returns the largest number.',
    functionName: 'findMax',
    starterCode: 'function findMax(arr) {\n  // your code here\n}',
    testCases: [
      { input: [[1, 5, 3]], expectedOutput: 5 },
      { input: [[-2, -8, -1]], expectedOutput: -1 },
      { input: [[10]], expectedOutput: 10 },
    ],
    difficulty: 'easy',
  },

  // React (kept as plain JS logic used in React contexts)
  {
    skill: 'react',
    title: 'Filter Active Users',
    prompt: 'Write a function called `filterActiveUsers` that takes an array of user objects `{ name, active }` and returns only the active ones (array of names).',
    functionName: 'filterActiveUsers',
    starterCode: 'function filterActiveUsers(users) {\n  // your code here\n}',
    testCases: [
      {
        input: [[{ name: 'A', active: true }, { name: 'B', active: false }, { name: 'C', active: true }]],
        expectedOutput: ['A', 'C'],
      },
      { input: [[]], expectedOutput: [] },
    ],
    difficulty: 'medium',
  },
  {
    skill: 'react',
    title: 'Merge Props',
    prompt: 'Write a function called `mergeProps` that takes two objects `defaultProps` and `props`, and returns a merged object where `props` overrides `defaultProps`.',
    functionName: 'mergeProps',
    starterCode: 'function mergeProps(defaultProps, props) {\n  // your code here\n}',
    testCases: [
      {
        input: [{ color: 'blue', size: 'md' }, { color: 'red' }],
        expectedOutput: { color: 'red', size: 'md' },
      },
    ],
    difficulty: 'easy',
  },

  // Node.js
  {
    skill: 'nodejs',
    title: 'Sum Array with Reduce',
    prompt: 'Write a function called `sumArray` that takes an array of numbers and returns their sum using reduce.',
    functionName: 'sumArray',
    starterCode: 'function sumArray(arr) {\n  // your code here\n}',
    testCases: [
      { input: [[1, 2, 3]], expectedOutput: 6 },
      { input: [[]], expectedOutput: 0 },
      { input: [[10, -5]], expectedOutput: 5 },
    ],
    difficulty: 'easy',
  },
  {
    skill: 'nodejs',
    title: 'Group By Key',
    prompt: 'Write a function called `groupByRole` that takes an array of objects `{ name, role }` and returns an object grouping names by role.',
    functionName: 'groupByRole',
    starterCode: 'function groupByRole(items) {\n  // your code here\n}',
    testCases: [
      {
        input: [[{ name: 'A', role: 'admin' }, { name: 'B', role: 'user' }, { name: 'C', role: 'admin' }]],
        expectedOutput: { admin: ['A', 'C'], user: ['B'] },
      },
    ],
    difficulty: 'medium',
  },
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Challenge.deleteMany({});
    await Challenge.insertMany(challenges);
    console.log(`Seeded ${challenges.length} challenges`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

run();