const User = require('../models/users');
const { buildStudentOverview } = require('../services/evidence.service');

const getLeaderboard = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' });

    const leaderboard = [];
    for (const student of students) {
      const overview = await buildStudentOverview(student._id);
      if (overview.avgScore != null) {
        leaderboard.push({
          name: student.name,
          username: student.username,
          avgScore: overview.avgScore,
          overallTier: overview.overallTier,
          verifiedCredentials: overview.verifiedCredentials,
        });
      }
    }

    leaderboard.sort((a, b) => b.avgScore - a.avgScore);

    res.status(200).json({ leaderboard });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getLeaderboard };