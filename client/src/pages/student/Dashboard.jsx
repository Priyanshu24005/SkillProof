import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardOverview } from '../../api/dashboard.api';
import StudentShell from '../../Layouts/StudentShell';

const STATUS_LABEL = {
  not_started: 'NOT STARTED',
  in_progress: 'IN PROGRESS',
  completed: 'COMPLETED',
};

const nextAction = (card) => {
  if (card.mcqScore == null) return { label: 'Start Assessment', path: `/assessment/${card.skill}` };
  if (card.practicalScore == null) return { label: 'Start Challenge', path: `/challenge/${card.skill}` };
  if (card.githubScore == null) return { label: 'Submit GitHub Evidence', path: `/github/${card.skill}` };
  return null;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboardOverview()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <StudentShell><div className="p-10">Loading dashboard...</div></StudentShell>;
  if (error) return <StudentShell><div className="p-10 text-flag-red">{error}</div></StudentShell>;

  const firstIncomplete = data.skillCards.find((c) => c.status !== 'completed');

  return (
    <StudentShell>
      <div className="flex items-center justify-between px-8 py-6 border-b border-hairline">
        <div>
          <h1 className="text-2xl font-bold">{data.user.name}</h1>
          <p className="opacity-60 text-sm mt-1">{data.user.email} · {data.user.role}</p>
        </div>
        <button
          onClick={() => firstIncomplete && navigate(nextAction(firstIncomplete)?.path)}
          disabled={!firstIncomplete}
          className="px-5 py-2.5 rounded-lg bg-signal-blue text-white font-mono text-sm font-semibold disabled:opacity-40"
        >
          Start New Skill Audit
        </button>
      </div>

      <div className="flex gap-6 px-8 py-5 border-b border-hairline font-mono text-sm">
        <div>
          <div className="opacity-60 text-[11px]">OVERALL TIER</div>
          <div className="font-bold mt-1">{data.overallTier || '—'}</div>
        </div>
        <div>
          <div className="opacity-60 text-[11px]">AVG SCORE</div>
          <div className="font-bold mt-1">{data.avgScore != null ? `${data.avgScore}/100` : '—'}</div>
        </div>
        <div>
          <div className="opacity-60 text-[11px]">VERIFIED CREDENTIALS</div>
          <div className="font-bold mt-1">{data.verifiedCredentials} validated</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 p-8">
        {data.skillCards.map((card) => {
          const action = nextAction(card);
          return (
            <div key={card.skill} className="border border-hairline rounded-xl p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-mono text-[11px] opacity-60">DOMAIN // {card.domainLabel.toUpperCase()}</div>
                  <h3 className="text-lg font-semibold mt-1 capitalize">{card.skill}</h3>
                </div>
                <span
                  className={`font-mono text-[10px] px-2 py-1 rounded border ${
                    card.status === 'completed'
                      ? 'border-pass-green text-pass-green'
                      : card.status === 'in_progress'
                      ? 'border-signal-blue text-signal-blue'
                      : 'border-hairline opacity-50'
                  }`}
                >
                  {STATUS_LABEL[card.status]}
                </span>
              </div>

              {card.composite != null ? (
                <>
                  <div className="font-mono text-3xl font-bold">
                    {card.composite}<span className="text-sm opacity-50">/100</span>
                  </div>
                  <div className="font-mono text-xs opacity-60 mt-1">
                    {card.tier} {card.percentile != null && `· PERCENTILE: ${card.percentile}th`}
                  </div>
                </>
              ) : (
                <div className="font-mono text-sm opacity-50 mt-2">Composite pending — {card.stagesDone}/3 stages done</div>
              )}

              <div className="grid grid-cols-3 gap-3 mt-4 font-mono text-xs">
                <div>
                  <div className="opacity-60">MCQ 30%</div>
                  <div className="font-semibold">{card.mcqScore ?? '—'}</div>
                </div>
                <div>
                  <div className="opacity-60">SANDBOX 40%</div>
                  <div className="font-semibold">{card.practicalScore ?? '—'}</div>
                </div>
                <div>
                  <div className="opacity-60">GIT 30%</div>
                  <div className="font-semibold">{card.githubScore ?? '—'}</div>
                </div>
              </div>

              {action && (
                <button
                  onClick={() => navigate(action.path)}
                  className="mt-5 w-full py-2.5 rounded-lg border border-signal-blue text-signal-blue font-mono text-xs font-semibold"
                >
                  {action.label}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-8 pb-8">
        <div className="border border-hairline rounded-xl">
          <div className="px-6 py-4 border-b border-hairline font-mono text-xs opacity-70">
            RECENT ACTIVITY
          </div>
          {data.activity.length === 0 ? (
            <div className="p-6 text-sm opacity-50">No activity yet.</div>
          ) : (
            <div>
              {data.activity.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-6 py-3 border-b border-hairline last:border-0 font-mono text-xs"
                >
                  <div className="opacity-60 w-40">{new Date(a.date).toLocaleString()}</div>
                  <div className="flex-1">{a.type}</div>
                  <div className="opacity-70 capitalize w-24">{a.skill}</div>
                  <div>{a.result}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </StudentShell>
  );
};

export default Dashboard;