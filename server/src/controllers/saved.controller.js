const SavedCandidate = require('../models/SavedCandidate');
const User = require('../models/users');

// POST /api/recruiter/saved
// body: { username, name, skill, compositeScore }
async function saveCandidate(req, res) {
  try {
    const { username, name, skill, compositeScore } = req.body;
    if (!username) {
      return res.status(400).json({ message: 'username is required' });
    }

    const saved = await SavedCandidate.findOneAndUpdate(
      { recruiter: req.user.id, candidateUsername: username },
      {
        recruiter: req.user.id,
        candidateUsername: username,
        candidateName: name,
        skill,
        compositeScore,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ saved: true, record: saved });
  } catch (err) {
    console.error('saveCandidate error:', err);
    res.status(500).json({ message: 'Unable to save candidate.' });
  }
}

// DELETE /api/recruiter/saved/:username
async function unsaveCandidate(req, res) {
  try {
    const { username } = req.params;
    await SavedCandidate.deleteOne({ recruiter: req.user.id, candidateUsername: username });
    res.status(200).json({ removed: true });
  } catch (err) {
    console.error('unsaveCandidate error:', err);
    res.status(500).json({ message: 'Unable to remove candidate.' });
  }
}

// GET /api/recruiter/saved
// Only saved candidates expose their email — this is intentional: contact
// info is only revealed once a recruiter has explicitly shortlisted someone,
// not on every search result row.
async function listSavedCandidates(req, res) {
  try {
    const records = await SavedCandidate.find({ recruiter: req.user.id }).sort({ createdAt: -1 });

    const usernames = records.map((r) => r.candidateUsername);
    const users = await User.find({ username: { $in: usernames } }).select('username email');
    const emailByUsername = {};
    users.forEach((u) => { emailByUsername[u.username] = u.email; });

    res.status(200).json({
      candidates: records.map((r) => ({
        username: r.candidateUsername,
        name: r.candidateName,
        skill: r.skill,
        compositeScore: r.compositeScore,
        savedAt: r.createdAt,
        email: emailByUsername[r.candidateUsername] || null,
      })),
    });
  } catch (err) {
    console.error('listSavedCandidates error:', err);
    res.status(500).json({ message: 'Unable to fetch saved candidates.' });
  }
}

module.exports = { saveCandidate, unsaveCandidate, listSavedCandidates };