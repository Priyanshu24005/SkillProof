import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicPassport } from '../../api/passport.api';
import StudentShell from '../../Layouts/StudentShell';

const Verify = () => {
  const [username, setUsername] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await getPublicPassport(username.trim().toLowerCase());
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Student not found');
    } finally {
      setLoading(false);
    }
  };

  const verifiedCount = result?.skillCards.filter((c) => c.composite != null).length ?? 0;

  return (
    <StudentShell>
      <div className="px-8 py-6 border-b border-hairline">
        <h1 className="text-2xl font-bold">Verify a Candidate</h1>
        <p className="opacity-60 text-sm mt-1">
          Search a student's username to check their verified skill status.
        </p>
      </div>

      <div className="p-8 max-w-2xl">
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username (e.g. alexlin)"
            required
            className="flex-1 px-3.5 py-3 border border-hairline rounded-lg bg-surface text-text text-sm focus:outline-none focus:border-signal-blue"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-signal-blue text-white font-mono text-sm font-semibold disabled:opacity-60"
          >
            {loading ? 'Checking...' : 'Verify'}
          </button>
        </form>

        {error && <p className="text-flag-red text-sm mb-6">{error}</p>}

        {result && (
          <div className="border border-hairline rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">{result.user.name}</h2>
                <p className="opacity-60 text-sm">@{result.user.username}</p>
              </div>
              {verifiedCount > 0 ? (
                <span className="font-mono text-[10px] border border-pass-green text-pass-green px-2 py-1 rounded">
                  ✓ VERIFIED
                </span>
              ) : (
                <span className="font-mono text-[10px] border border-hairline opacity-50 px-2 py-1 rounded">
                  NO VERIFIED SKILLS YET
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 font-mono text-sm mb-4">
              <div>
                <div className="opacity-60 text-[11px]">TIER</div>
                <div className="font-bold mt-1">{result.overallTier || '—'}</div>
              </div>
              <div>
                <div className="opacity-60 text-[11px]">AVG SCORE</div>
                <div className="font-bold mt-1">{result.avgScore != null ? `${result.avgScore}/100` : '—'}</div>
              </div>
              <div>
                <div className="opacity-60 text-[11px]">VERIFIED SKILLS</div>
                <div className="font-bold mt-1">{verifiedCount}/3</div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/p/${result.user.username}`)}
              className="w-full py-2.5 rounded-lg border border-signal-blue text-signal-blue font-mono text-xs font-semibold"
            >
              View Full Passport
            </button>
          </div>
        )}
      </div>
    </StudentShell>
  );
};

export default Verify;