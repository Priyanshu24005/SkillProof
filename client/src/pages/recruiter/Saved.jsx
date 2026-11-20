import { useState, useEffect } from 'react';
import RecruiterShell from '../../Layouts/RecruiterShell';
import SavedCandidateRow from '../../components/SavedCandidateRow';
import { getSavedCandidates, unsaveCandidate } from '../../api/recruiter.api';

const Saved = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSaved = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getSavedCandidates();
      setCandidates(res.data.candidates || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load saved candidates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (username) => {
    // optimistic update
    setCandidates((prev) => prev.filter((c) => c.username !== username));
    try {
      await unsaveCandidate(username);
    } catch (err) {
      // if it fails, refetch to restore correct state
      fetchSaved();
    }
  };

  return (
    <RecruiterShell>
      <div className="p-8 max-w-6xl">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Saved / Shortlisted</h1>
        <p className="text-sm opacity-70 mb-6">
          Candidates you've shortlisted from Search Candidates or Talent Pool.
        </p>

        <div className="border border-hairline rounded-lg overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-hairline text-[10px] uppercase tracking-[0.12em] opacity-60">
                <th className="py-3 px-4 font-medium">Candidate</th>
                <th className="py-3 px-4 font-medium">Skill / score</th>
                <th className="py-3 px-4 font-medium">Tier</th>
                <th className="py-3 px-4 font-medium">Saved on</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm opacity-60">
                    Loading saved candidates…
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-flag-red">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && candidates.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm opacity-60 font-mono">
                    No candidates saved yet. Save one from Search Candidates or Talent Pool.
                  </td>
                </tr>
              )}

              {!loading && !error && candidates.map((c) => (
                <SavedCandidateRow key={c.username} candidate={c} onRemove={handleRemove} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </RecruiterShell>
  );
};

export default Saved;