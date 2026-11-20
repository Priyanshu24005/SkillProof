import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../../api/leaderboard.api';
import StudentShell from '../../Layouts/StudentShell';

const Talent = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getLeaderboard()
      .then((res) => setLeaderboard(res.data.leaderboard))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load leaderboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <StudentShell><div className="p-10">Loading leaderboard...</div></StudentShell>;
  if (error) return <StudentShell><div className="p-10 text-flag-red">{error}</div></StudentShell>;

  return (
    <StudentShell>
      <div className="px-8 py-6 border-b border-hairline">
        <h1 className="text-2xl font-bold">Talent Leaderboard</h1>
        <p className="opacity-60 text-sm mt-1">Top verified students, ranked by average composite score.</p>
      </div>

      <div className="p-8">
        {leaderboard.length === 0 ? (
          <div className="border border-hairline rounded-xl p-8 text-center opacity-60">
            No verified students yet.
          </div>
        ) : (
          <div className="border border-hairline rounded-xl">
            {leaderboard.map((s, i) => (
              <div
                key={s.username}
                onClick={() => navigate(`/p/${s.username}`)}
                className="flex items-center justify-between px-6 py-4 border-b border-hairline last:border-0 cursor-pointer hover:bg-surface"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm opacity-50 w-6">#{i + 1}</span>
                  <div>
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-xs opacity-60">@{s.username}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6 font-mono text-sm">
                  <span className="opacity-60">{s.overallTier}</span>
                  <span className="font-bold">{s.avgScore}/100</span>
                  <span className="opacity-60">{s.verifiedCredentials} verified</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentShell>
  );
};

export default Talent;