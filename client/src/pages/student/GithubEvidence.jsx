import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submitGithubEvidence } from '../../api/github.api';
import StudentShell from '../../Layouts/StudentShell';
import EvidenceProgressBar from '../../components/EvidenceProgressBar';

const GithubEvidence = () => {
  const { skill } = useParams();
  const navigate = useNavigate();

  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await submitGithubEvidence(skill, repoUrl);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to evaluate repository');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <StudentShell>
      <EvidenceProgressBar activeStep={3} />

      <div className="px-8 py-6 border-b border-hairline">
        <h1 className="text-2xl font-bold capitalize">{skill} — GitHub Project Evidence</h1>
        <p className="opacity-70 mt-2 max-w-2xl">
          This analyzes your repository as evidence of applied work, not proof of sole authorship.
        </p>
      </div>

      <div className="max-w-4xl p-8">
        {!result && (
          <form onSubmit={handleSubmit}>
            <label className="block font-mono text-[11px] uppercase opacity-70 mb-1.5">
              GitHub Repository URL
            </label>
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repo"
              required
              className="w-full px-3.5 py-3 border border-hairline rounded-lg bg-surface text-text text-sm focus:outline-none focus:border-signal-blue"
            />

            {error && <p className="text-flag-red text-sm mt-3">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 px-6 py-3 rounded-lg bg-signal-blue text-white font-mono text-sm font-semibold disabled:opacity-60"
            >
              {loading ? 'Analyzing repository...' : 'Submit Evidence'}
            </button>
          </form>
        )}

        {result && (
          <div>
            {/* Score card */}
            <div className="border border-hairline rounded-xl p-7 bg-surface mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="font-mono text-[11px] bg-bg border border-hairline px-2 py-1 rounded opacity-80">
                    EVIDENCE_SCORE
                  </span>
                  <h2 className="text-lg mt-3 break-all">{repoUrl}</h2>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <div className="font-mono text-4xl font-bold">{result.score}<span className="text-sm opacity-50">/100</span></div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-6">
                <div>
                  <small className="opacity-60 text-[11px]">LANGUAGE MATCH (40%)</small>
                  <div className="text-lg font-bold my-1">{result.breakdown.languageMatchScore}</div>
                </div>
                <div>
                  <small className="opacity-60 text-[11px]">ACTIVITY (25%)</small>
                  <div className="text-lg font-bold my-1">{result.breakdown.activityScore}</div>
                </div>
                <div>
                  <small className="opacity-60 text-[11px]">STRUCTURE (20%)</small>
                  <div className="text-lg font-bold my-1">{result.breakdown.structureScore}</div>
                </div>
                <div>
                  <small className="opacity-60 text-[11px]">DOCS (15%)</small>
                  <div className="text-lg font-bold my-1">{result.breakdown.documentationScore}</div>
                </div>
              </div>
            </div>

            {/* Timeline overview */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="border border-hairline rounded-xl p-5">
                <small className="opacity-60 text-[11px]">TOTAL COMMITS</small>
                <div className="text-2xl font-bold mt-1">{result.timeline.totalCount}</div>
              </div>
              <div className="border border-hairline rounded-xl p-5">
                <small className="opacity-60 text-[11px]">GPG VERIFIED</small>
                <div className="text-2xl font-bold mt-1 text-pass-green">
                  {result.timeline.verifiedCount}/{result.timeline.totalCount}
                </div>
              </div>
              <div className="border border-hairline rounded-xl p-5">
                <small className="opacity-60 text-[11px]">ACTIVE TIMEFRAME</small>
                <div className="text-2xl font-bold mt-1">
                  {formatDate(result.timeline.firstCommit)} — {formatDate(result.timeline.lastCommit)}
                </div>
              </div>
            </div>

            {/* Commit cadence chart */}
            <div className="border border-hairline rounded-xl p-6 mb-6">
              <small className="font-mono opacity-60 text-[11px]">COMMIT CADENCE (WEEKLY)</small>
              <div className="flex items-end gap-2 h-24 mt-4">
                {result.timeline.weeklyBuckets.map((b, i) => {
                  const max = Math.max(...result.timeline.weeklyBuckets.map((x) => x.count), 1);
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-signal-blue rounded-t"
                      style={{ height: `${(b.count / max) * 100}%` }}
                      title={`Week ${b.week + 1}: ${b.count} commits`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Recent commits */}
            <div className="border border-hairline rounded-xl p-6 mb-6">
              <small className="font-mono opacity-60 text-[11px]">RECENT COMMITS</small>
              <div className="mt-4 space-y-3">
                {result.timeline.recentCommits.map((c) => (
                  <div key={c.sha} className="flex items-start justify-between font-mono text-xs border-b border-hairline pb-3 last:border-0">
                    <div>
                      <span className="text-signal-blue">{c.sha}</span>
                      <span className="ml-3 opacity-90">{c.message}</span>
                    </div>
                    <span className={c.verified ? 'text-pass-green' : 'opacity-40'}>
                      {c.verified ? '✓ VERIFIED' : 'UNVERIFIED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw metadata */}
            <div className="border border-hairline rounded-xl p-6 font-mono text-xs mb-6">
              <div className="flex justify-between py-2 opacity-85">
                <span>STARS</span><span>{result.raw.stars}</span>
              </div>
              <div className="flex justify-between py-2 opacity-85">
                <span>LANGUAGES</span><span>{Object.keys(result.raw.languages).join(', ')}</span>
              </div>
              <div className="flex justify-between py-2 opacity-85">
                <span>README</span><span>{result.raw.hasReadme ? 'Present' : 'Missing'}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-lg bg-signal-blue text-white font-mono text-sm font-semibold"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </StudentShell>
  );
};

export default GithubEvidence;