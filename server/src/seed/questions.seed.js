require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');

const questions = [
  // JavaScript
  { skill: 'javascript', questionText: 'What is the output of typeof null?', options: ['null', 'object', 'undefined', 'number'], correctAnswer: 1, difficulty: 'medium' },
  { skill: 'javascript', questionText: 'Which method converts JSON string to a JS object?', options: ['JSON.stringify()', 'JSON.parse()', 'JSON.toObject()', 'Object.parse()'], correctAnswer: 1, difficulty: 'easy' },
  { skill: 'javascript', questionText: 'What does "===" check that "==" does not?', options: ['Value only', 'Type and value', 'Reference only', 'Nothing different'], correctAnswer: 1, difficulty: 'easy' },
  { skill: 'javascript', questionText: 'Which keyword declares a block-scoped variable?', options: ['var', 'let', 'function', 'global'], correctAnswer: 1, difficulty: 'easy' },
  { skill: 'javascript', questionText: 'What is a closure in JavaScript?', options: ['A loop construct', 'A function with access to its outer scope', 'A type of array', 'An error handler'], correctAnswer: 1, difficulty: 'medium' },
  { skill: 'javascript', questionText: 'What does Array.prototype.map() return?', options: ['A new array', 'The same array mutated', 'A single value', 'undefined'], correctAnswer: 0, difficulty: 'easy' },
  { skill: 'javascript', questionText: 'Which is used for asynchronous operations?', options: ['Promise', 'Array', 'Set', 'Map'], correctAnswer: 0, difficulty: 'easy' },
  { skill: 'javascript', questionText: 'What does "this" refer to in a regular function called standalone?', options: ['The global object (or undefined in strict mode)', 'The function itself', 'null always', 'The parent object'], correctAnswer: 0, difficulty: 'hard' },
  { skill: 'javascript', questionText: 'Which method removes the last element of an array?', options: ['shift()', 'pop()', 'slice()', 'splice(0,1)'], correctAnswer: 1, difficulty: 'easy' },
  { skill: 'javascript', questionText: 'What is event bubbling?', options: ['Event triggers on parent before child', 'Event propagates from child to parent', 'Events fire simultaneously', 'None of these'], correctAnswer: 1, difficulty: 'medium' },

  // React
  { skill: 'react', questionText: 'What hook is used to manage state in a functional component?', options: ['useEffect', 'useState', 'useRef', 'useMemo'], correctAnswer: 1, difficulty: 'easy' },
  { skill: 'react', questionText: 'What does useEffect do by default (no dependency array)?', options: ['Runs once on mount', 'Runs on every render', 'Never runs', 'Runs only on unmount'], correctAnswer: 1, difficulty: 'medium' },
  { skill: 'react', questionText: 'What is the virtual DOM?', options: ['A real browser DOM', 'An in-memory representation of the UI', 'A CSS framework', 'A database'], correctAnswer: 1, difficulty: 'easy' },
  { skill: 'react', questionText: 'How do you pass data from parent to child?', options: ['State', 'Props', 'Context only', 'Refs'], correctAnswer: 1, difficulty: 'easy' },
  { skill: 'react', questionText: 'What does useContext help avoid?', options: ['Re-renders', 'Prop drilling', 'API calls', 'CSS conflicts'], correctAnswer: 1, difficulty: 'medium' },
  { skill: 'react', questionText: 'What is a key prop used for in lists?', options: ['Styling', 'Uniquely identifying elements for efficient re-render', 'Sorting', 'Validation'], correctAnswer: 1, difficulty: 'medium' },
  { skill: 'react', questionText: 'Which hook memoizes a computed value?', options: ['useMemo', 'useState', 'useEffect', 'useCallback'], correctAnswer: 0, difficulty: 'medium' },
  { skill: 'react', questionText: 'What is React Router used for?', options: ['State management', 'Client-side routing/navigation', 'API calls', 'Styling'], correctAnswer: 1, difficulty: 'easy' },
  { skill: 'react', questionText: 'What does React.StrictMode do?', options: ['Improves performance directly', 'Highlights potential problems in dev mode', 'Minifies code', 'Adds routing'], correctAnswer: 1, difficulty: 'hard' },
  { skill: 'react', questionText: 'What triggers a re-render in a functional component?', options: ['State or props change', 'Only page reload', 'CSS change', 'Nothing automatic'], correctAnswer: 0, difficulty: 'easy' },

  // Node.js
  { skill: 'nodejs', questionText: 'What is Node.js built on?', options: ['V8 engine', 'SpiderMonkey', 'Chakra', 'JVM'], correctAnswer: 0, difficulty: 'easy' },
  { skill: 'nodejs', questionText: 'What module system does Node use by default (CommonJS)?', options: ['import/export', 'require/module.exports', 'include', 'using'], correctAnswer: 1, difficulty: 'easy' },
  { skill: 'nodejs', questionText: 'What does npm stand for?', options: ['Node Package Manager', 'New Package Method', 'Node Program Module', 'Network Package Manager'], correctAnswer: 0, difficulty: 'easy' },
  { skill: 'nodejs', questionText: 'Which is used to create a web server in Express?', options: ['express.createServer()', 'express()', 'new Server()', 'app.build()'], correctAnswer: 1, difficulty: 'easy' },
  { skill: 'nodejs', questionText: 'What is middleware in Express?', options: ['A database', 'A function with access to req, res, next', 'A frontend library', 'A CSS tool'], correctAnswer: 1, difficulty: 'medium' },
  { skill: 'nodejs', questionText: 'Is Node.js single-threaded or multi-threaded by default?', options: ['Multi-threaded', 'Single-threaded (event loop based)', 'No threading model', 'Thread per request'], correctAnswer: 1, difficulty: 'medium' },
  { skill: 'nodejs', questionText: 'Which package is commonly used for password hashing?', options: ['bcrypt', 'lodash', 'axios', 'cors'], correctAnswer: 0, difficulty: 'easy' },
  { skill: 'nodejs', questionText: 'What does JWT stand for?', options: ['Java Web Token', 'JSON Web Token', 'JavaScript Web Type', 'Joint Web Transfer'], correctAnswer: 1, difficulty: 'easy' },
  { skill: 'nodejs', questionText: 'What is the event loop responsible for?', options: ['Compiling code', 'Handling async operations non-blockingly', 'Styling', 'Database queries only'], correctAnswer: 1, difficulty: 'hard' },
  { skill: 'nodejs', questionText: 'Which command initializes a new npm project?', options: ['npm start', 'npm init', 'npm build', 'npm new'], correctAnswer: 1, difficulty: 'easy' },
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Question.deleteMany({});
    await Question.insertMany(questions);
    console.log(`Seeded ${questions.length} questions`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

run();