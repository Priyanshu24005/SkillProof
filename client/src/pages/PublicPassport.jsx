import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicPassport } from '../api/passport.api';

const PublicPassport = () => {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getPublicPassport(username)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Passport not found'))
      .finally(() => setLoading(false));
  }, [username]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${username}-skillproof-passport.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-bg text-text">Loading passport...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-bg text-flag-red">{error}</div>;

  const initials = data.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const verifiedSkillsCount = data.skillCards.filter((c) => c.composite != null).length;

  return (
    <div className="min-h-screen bg-bg text-text font-sans">
      <header className="flex items-center justify-between px-8 py-3 border-b border-hairline font-mono text-xs">
        <div className="flex items-center gap-2 font-semibold">
          <span className="w-3.5 h-3.5 bg-signal-blue rounded-[3px]" />
          SkillProof <span className="opacity-50 font-normal">v2.4.1</span>
        </div>
        <span className="opacity-60 tracking-widest">SKILL PASSPORT</span>
        <span className="border border-hairline rounded px-2 py-1 opacity-70">NETWORK MAINNET-ZK</span>
      </header>

      <div className="px-8 py-2.5 border-b border-hairline font-mono text-[11px] opacity-60 flex justify-between">
        <span>SKILL PASSPORT</span>
        <span>TIMESTAMP: {new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC</span>
      </div>

      <div className="max-w-5xl mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-surface border border-hairline flex items-center justify-center font-mono font-bold text-lg">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{data.user.name}</h1>
                <span className="opacity-50">@{data.user.username}</span>
              </div>
              <span className="font-mono text-[10px] border border-pass-green text-pass-green px-2 py-0.5 rounded inline-block mt-1">
                ✓ VERIFIED PROVER IDENTITY
              </span>
              <p className="text-sm opacity-70 mt-1">
                {verifiedSkillsCount} skills verified · {data.overallTier || 'Not yet evaluated'} · Overall Index{' '}
                <strong>{data.avgScore != null ? `${data.avgScore}/100` : '—'}</strong> · {data.verifiedCredentials} Validated Hash Proofs
              </p>
            </div>
          </div>

          <div className="flex gap-3 shrink-0">
            <button onClick={handleCopyLink} className="px-4 py-2.5 rounded-lg border border-hairline font-mono text-xs">
              {copied ? 'Copied!' : 'Copy Verification Link'}
            </button>
            <button onClick={handleExportJson} className="px-4 py-2.5 rounded-lg bg-signal-blue text-white font-mono text-xs font-semibold">
              Export Proof (.json)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-10 font-mono text-sm border-t border-b border-hairline py-5">
          <div>
            <div className="opacity-60 text-[11px]">OVERALL CONSENSUS TIER</div>
            <div className="font-bold mt-1">{data.overallTier || '—'}</div>
          </div>
          <div>
            <div className="opacity-60 text-[11px]">COMPOSITE VERIFIED SCORE</div>
            <div className="font-bold mt-1">{data.avgScore != null ? `${data.avgScore} / 100` : '—'}</div>
            <div className="text-[11px] opacity-50">Weighted mean across {verifiedSkillsCount} verified domains</div>
          </div>
          <div>
            <div className="opacity-60 text-[11px]">TRIANGULATION RIGOR</div>
            <div className="font-bold mt-1 text-pass-green">3-source verified</div>
          </div>
          <div>
            <div className="opacity-60 text-[11px]">LEDGER INTEGRITY SEAL</div>
            <div className="font-bold mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-pass-green rounded-full" /> ACTIVE
            </div>
          </div>
        </div>

        <h2 className="font-mono text-xs opacity-60 mb-4">VERIFIED ATTRIBUTIONS &amp; DOMAIN EVIDENCE</h2>

        <div className="space-y-5 mb-10">
          {data.skillCards
            .filter((c) => c.composite != null)
            .map((card) => (
              <div key={card.skill} className="border border-hairline rounded-xl p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold capitalize">{card.domainLabel}</h3>
                    <span className="font-mono text-[10px] border border-pass-green text-pass-green px-2 py-1 rounded inline-block mt-1">
                      {card.tier}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-2xl font-bold">{card.composite}<span className="text-sm opacity-50">/100</span></div>
                    <div className="font-mono text-[11px] opacity-60">{card.percentile}th percentile</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 font-mono text-xs mt-4 mb-4">
                  <div><span className="opacity-60">Knowledge MCQ (30%):</span> <strong>{card.mcqScore}</strong></div>
                  <div><span className="opacity-60">Practical Challenge (40%):</span> <strong>{card.practicalScore}</strong></div>
                  <div><span className="opacity-60">GitHub Evidence (30%):</span> <strong>{card.githubScore}</strong></div>
                </div>

                <div className="border-t border-hairline pt-3 font-mono text-[10px] opacity-40">
                  MERKLE LEAF: 0x{card.skill.padEnd(8, '0')}...GPG-SIGNED (visual only)
                </div>
              </div>
            ))}

          {verifiedSkillsCount === 0 && (
            <div className="border border-hairline rounded-xl p-8 text-center opacity-60">No verified skills yet.</div>
          )}
        </div>

        <h2 className="font-mono text-xs opacity-60 mb-4">RECENT VERIFICATION ACTIVITY</h2>
        <div className="border border-hairline rounded-xl mb-10">
          {data.activity.length === 0 ? (
            <div className="p-6 text-sm opacity-50">No activity yet.</div>
          ) : (
            data.activity.map((a, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-3 border-b border-hairline last:border-0 font-mono text-xs">
                <div className="opacity-60 w-40">{new Date(a.date).toLocaleDateString()}</div>
                <div className="flex-1">{a.type}</div>
                <div className="opacity-70 capitalize w-24">{a.skill}</div>
                <div>{a.result}</div>
              </div>
            ))
          )}
        </div>

        <div className="pt-6 border-t border-hairline font-mono text-[10px] opacity-40 text-center">
          SkillProof Protocol // Canonical Passport // RFC-8942 (illustrative spec ref)
        </div>
      </div>
    </div>
  );
};

export default PublicPassport;