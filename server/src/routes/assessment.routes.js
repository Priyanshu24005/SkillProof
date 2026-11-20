const express = require('express');
const router = express.Router();
const { startAssessment, submitAssessment } = require('../controllers/assessment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/:skill/start', protect, authorize('student'), startAssessment);
router.post('/:skill/submit', protect, authorize('student'), submitAssessment);

module.exports = router;