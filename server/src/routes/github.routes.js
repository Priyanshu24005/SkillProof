const express = require('express');
const router = express.Router();
const { submitGithubEvidence } = require('../controllers/github.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/:skill/submit', protect, authorize('student'), submitGithubEvidence);

module.exports = router;