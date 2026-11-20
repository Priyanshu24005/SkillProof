const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { searchCandidates } = require('../controllers/recruiter.controller');
const { getTalentPool } = require('../controllers/talentPool.controller');
const { saveCandidate, unsaveCandidate, listSavedCandidates } = require('../controllers/saved.controller');
const { getRecruiterStats } = require('../controllers/recruiterStats.controller');

router.get('/candidates', protect, authorize('recruiter'), searchCandidates);
router.get('/talent-pool', protect, authorize('recruiter'), getTalentPool);
router.get('/saved', protect, authorize('recruiter'), listSavedCandidates);
router.post('/saved', protect, authorize('recruiter'), saveCandidate);
router.delete('/saved/:username', protect, authorize('recruiter'), unsaveCandidate);
router.get('/stats', protect, authorize('recruiter'), getRecruiterStats);

module.exports = router;