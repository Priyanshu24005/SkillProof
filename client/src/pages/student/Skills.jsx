import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardOverview } from '../../api/dashboard.api';
import StudentShell from '../../Layouts/StudentShell';

const nextAction = (card) => {
  if (card.mcqScore == null) return { label: 'Start Assessment', path: `/assessment/${card.skill}` };
  if (card.practicalScore == null) return { label: 'Start Challenge', path: `/challenge/${card.skill}` };
  if (card.githubScore == null) return { label: 'Submit GitHub Evidence', path: `/github/${card.skill}` };
  return null;
};

const Skills = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboardOverview()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load skills'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <StudentShell><div className="p-10">Loading skills...</div></StudentShell>;
  if (error) return <StudentShell><div className="p-10 text-flag-red">{error}</div></StudentShell>;

  return (
    <StudentShell>
      <div className="px-8 py-6 border-b border-hairline">
        <h1 className="text-2xl font-bold">My Skills</h1>
        <p className="opacity-60 text-sm mt-1">Your verified marks across each evaluated domain.</p>
      </div>

      <div className="p-8 space-y-5">
        {data.skillCards.map((card) => {
          const action = nextAction(card);
          return (
            <div key={card.skill} className="border border-hairline rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-mono text-[11px] opacity-60">DOMAIN // {card.domainLabel.toUpperCase()}</div>
                  <h2 className="text-xl font-semibold mt-1 capitalize">{card.skill}</h2>
                  {card.tier && (
                    <span className="font-mono text-[10px] border border-pass-green text-pass-green px-2 py-1 rounded inline-block mt-2">
                      {card.tier}
                    </span>
                  )}
                </div>
                {card.composite != null ? (
                  <div className="text-right">
                    <div className="font-mono text-3xl font-bold">{card.composite}<span className="text-sm opacity-50">/100</span></div>
                    {card.percentile != null && (
                      <div className="font-mono text-xs opacity-60">{card.percentile}th percentile</div>
                    )}
                  </div>
                ) : (
                  <span className="font-mono text-[10px] border border-hairline opacity-50 px-2 py-1 rounded">
                    {card.stagesDone}/3 STAGES DONE
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 font-mono text-sm border-t border-hairline pt-4">
                <div>
                  <div className="opacity-60 text-[11px]">KNOWLEDGE MCQ (30%)</div>
                  <div className="font-bold mt-1">{card.mcqScore ?? '— not attempted'}</div>
                </div>
                <div>
                  <div className="opacity-60 text-[11px]">PRACTICAL CHALLENGE (40%)</div>
                  <div className="font-bold mt-1">{card.practicalScore ?? '— not attempted'}</div>
                </div>
                <div>
                  <div className="opacity-60 text-[11px]">GITHUB EVIDENCE (30%)</div>
                  <div className="font-bold mt-1">{card.githubScore ?? '— not attempted'}</div>
                </div>
              </div>

              {action && (
                <button
                  onClick={() => navigate(action.path)}
                  className="mt-5 px-5 py-2.5 rounded-lg border border-signal-blue text-signal-blue font-mono text-xs font-semibold"
                >
                  {action.label}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </StudentShell>
  );
};

export default Skills;