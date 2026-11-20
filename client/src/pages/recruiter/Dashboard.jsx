import { useState, useEffect } from 'react';
import RecruiterShell from '../../Layouts/RecruiterShell';
import { getRecruiterStats } from '../../api/recruiter.api';

const SKILL_LABELS = {
  javascript: 'JavaScript',
  react: 'React.js',
  nodejs: 'Node.js',
};

const StatCard = ({ label, value, sub }) => (
  <div className="border border-hairline rounded-lg p-5">
    <div className="text-[10px] uppercase tracking-[0.14em] opacity-60 mb-2 font-mono">{label}</div>
    <div className="text-3xl font-semibold font-mono">{value}</div>
    {sub && <div className="text-xs opacity-60 mt-1">{sub}</div>}
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getRecruiterStats();
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load dashboard stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <RecruiterShell>
      <div className="p-8 max-w-6xl">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Recruiter Dashboard</h1>
        <p className="text-sm opacity-70 mb-6">
          Overview of verified candidates across the platform.
        </p>

        {loading && <p className="text-sm opacity-60">Loading stats…</p>}
        {!loading && error && <p className="text-sm text-flag-red">{error}</p>}

        {!loading && !error && stats && (
          <>
            {/* Top summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <StatCard label="Total Verified Candidates" value={stats.totalVerifiedCandidates} />
              <StatCard
                label="Tier 1 Confirmed"
                value={stats.tierDistribution.tier1}
                sub={`${stats.tierDistribution.tier2} Tier 2 · ${stats.tierDistribution.belowThreshold} below threshold`}
              />
              <StatCard
                label="Skills Tracked"
                value={Object.keys(stats.perSkill).length}
                sub="JavaScript · React.js · Node.js"
              />
            </div>

            {/* Per-skill breakdown */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold uppercase tracking-[0.1em] opacity-70 mb-3">
                Per-Skill Breakdown
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.entries(stats.perSkill).map(([skill, data]) => (
                  <div key={skill} className="border border-hairline rounded-lg p-5">
                    <div className="font-medium mb-2">{SKILL_LABELS[skill] || skill}</div>
                    <div className="font-mono text-2xl font-semibold">{data.avgScore.toFixed(1)}</div>
                    <div className="text-xs opacity-60 mt-1">avg score · {data.count} verified candidates</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity feed */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.1em] opacity-70 mb-3">
                Recent Verification Activity
              </h2>
              <div className="border border-hairline rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-hairline text-[10px] uppercase tracking-[0.12em] opacity-60">
                      <th className="py-3 px-4 font-medium">Candidate</th>
                      <th className="py-3 px-4 font-medium">Activity</th>
                      <th className="py-3 px-4 font-medium">Skill</th>
                      <th className="py-3 px-4 font-medium">Score</th>
                      <th className="py-3 px-4 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentActivity.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-sm opacity-60 font-mono">
                          No activity yet.
                        </td>
                      </tr>
                    )}
                    {stats.recentActivity.map((a, i) => (
                      <tr key={i} className="border-b border-hairline last:border-b-0">
                        <td className="py-3 px-4">
                          <div className="font-medium">{a.name || a.username}</div>
                          <div className="text-xs opacity-60 font-mono">@{a.username}</div>
                        </td>
                        <td className="py-3 px-4">{a.type}</td>
                        <td className="py-3 px-4 font-mono">{SKILL_LABELS[a.skill] || a.skill}</td>
                        <td className="py-3 px-4 font-mono">{a.score}/100</td>
                        <td className="py-3 px-4 font-mono text-xs opacity-70">
                          {new Date(a.date).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </RecruiterShell>
  );
};

export default Dashboard;