const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/auth.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const User = require('../models/users');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/student-only', protect, authorize('student'), (req, res) => {
  res.json({ message: 'Welcome student' });
});

module.exports = router;