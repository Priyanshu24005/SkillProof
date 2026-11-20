const User = require('../models/users');
const { buildStudentOverview } = require('../services/evidence.service');

const getPublicPassport = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username: username.toLowerCase(), role: 'student' });
    if (!user) {
      return res.status(404).json({ message: 'Passport not found' });
    }

    const overview = await buildStudentOverview(user._id);

    res.status(200).json({
      user: { name: user.name, username: user.username },
      ...overview,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getPublicPassport };