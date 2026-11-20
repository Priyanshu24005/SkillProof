const express = require('express');
const router = express.Router();
const { startChallenge, submitChallenge } = require('../controllers/challenge.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/:skill/start', protect, authorize('student'), startChallenge);
router.post('/:skill/submit', protect, authorize('student'), submitChallenge);

module.exports = router;