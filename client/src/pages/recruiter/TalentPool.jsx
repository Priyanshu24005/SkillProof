import { useState, useEffect } from 'react';
import RecruiterShell from '../../Layouts/RecruiterShell';
import TalentCandidateRow from '../../components/TalentCandidateRow';
import { getTalentPool } from '../../api/recruiter.api';

const SKILLS = [
  { value: 'all', label: 'All skills (best per candidate)' },
  { value: 'react', label: 'React.js' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'nodejs', label: 'Node.js' },
];

const TIERS = [
  { value: 'all', label: 'All tiers' },
  { value: 'tier1', label: 'Tier 1 Confirmed' },
  { value: 'tier2', label: 'Tier 2 Provisional' },
];

const TalentPool = () => {
  const [skill, setSkill] = useState('all');
  const [minScore, setMinScore] = useState(0);
  const [tier, setTier] = useState('all');

  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchTalentPool = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getTalentPool({ skill, minScore, tier, sortBy: 'score_desc', page: 1 });
        if (cancelled) return;
        setCandidates(res.data.candidates || []);
        setTotal(res.data.total ?? 0);
        setAvgScore(res.data.avgScore ?? 0);
      } catch (err) {
        if (cancelled) return;
        setError(err.response?.data?.message || 'Unable to load talent pool.');
        setCandidates([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTalentPool();
    return () => { cancelled = true; };
  }, [skill, minScore, tier]);

  return (
    <RecruiterShell>
      <div className="p-8 max-w-6xl">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Talent Pool</h1>
        <p className="text-sm opacity-70 mb-6">
          Browse verified candidates — filter by a specific skill, or see everyone ranked by their best overall score.
        </p>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-4 mb-4 border border-hairline rounded-lg p-4">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.14em] opacity-60 mb-1 font-mono">
              Skill
            </label>
            <select
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="bg-surface border border-hairline rounded px-3 py-2 text-sm"
            >
              {SKILLS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.14em] opacity-60 mb-1 font-mono">
              Min score
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-24 bg-surface border border-hairline rounded px-3 py-2 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.14em] opacity-60 mb-1 font-mono">
              Tier
            </label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="bg-surface border border-hairline rounded px-3 py-2 text-sm"
            >
              {TIERS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary strip */}
        <div className="flex items-center gap-4 text-xs font-mono opacity-70 mb-4">
          <span><span className="font-semibold opacity-100">{total}</span> candidates match</span>
          <span>·</span>
          <span>Avg score: <span className="font-semibold opacity-100">{avgScore.toFixed(1)}</span> / 100</span>
        </div>

        {/* Results table */}
        <div className="border border-hairline rounded-lg overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-hairline text-[10px] uppercase tracking-[0.12em] opacity-60">
                <th className="py-3 px-4 font-medium">Candidate</th>
                <th className="py-3 px-4 font-medium">Skill / score</th>
                <th className="py-3 px-4 font-medium">Tier</th>
                <th className="py-3 px-4 font-medium">Verified skills</th>
                <th className="py-3 px-4 font-medium">Last verified</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm opacity-60">
                    Loading talent pool…
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-flag-red">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && candidates.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm opacity-60 font-mono">
                    No candidates match these filters.
                  </td>
                </tr>
              )}

              {!loading && !error && candidates.map((c) => (
                <TalentCandidateRow key={c.username} candidate={c} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RecruiterShell>
  );
};

export default TalentPool;