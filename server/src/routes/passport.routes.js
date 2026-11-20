const express = require('express');
const router = express.Router();
const { getPublicPassport } = require('../controllers/passport.controller');

router.get('/:username', getPublicPassport); // public, no auth

module.exports = router;