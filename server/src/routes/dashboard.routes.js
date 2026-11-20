const express = require('express');
const router = express.Router();
const { getOverview } = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/overview', protect, authorize('student'), getOverview);

module.exports = router;