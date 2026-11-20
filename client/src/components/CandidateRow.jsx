import { useState } from 'react';
import { saveCandidate } from '../api/recruiter.api';

const getTierBadge = (compositeScore) => {
  if (compositeScore >= 85) {
    return { label: 'Tier 1 Confirmed', className: 'text-signal-blue border-signal-blue' };
  }
  if (compositeScore >= 70) {
    return { label: 'Tier 2 Provisional', className: 'opacity-80 border-hairline' };
  }
  return { label: 'Below Threshold', className: 'text-flag-red border-flag-red' };
};

const CandidateRow = ({ candidate }) => {
  const { username, name, skill, compositeScore, knowledge, practical, github, lastVerified } = candidate;
  const tier = getTierBadge(compositeScore);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error

  const handleSave = async () => {
    setSaveState('saving');
    try {
      await saveCandidate({ username, name, skill, compositeScore });
      setSaveState('saved');
    } catch (err) {
      setSaveState('error');
    }
  };

  return (
    <tr className="border-b border-hairline hover:bg-surface transition-colors">
      <td className="py-3 px-4">
        <div className="font-medium">{name || username}</div>
        <div className="text-xs opacity-60 font-mono">@{username}</div>
      </td>

      <td className="py-3 px-4">
        <span className="font-mono">
          {skill} — <span className="font-semibold">{compositeScore.toFixed(1)}</span>/100
        </span>
      </td>

      <td className="py-3 px-4 font-mono text-sm">
        <span className="text-signal-blue">{knowledge.toFixed(1)}</span>
        {' / '}
        <span>{practical.toFixed(1)}</span>
        {' / '}
        <span className="text-pass-green">{github.toFixed(1)}</span>
      </td>

      <td className="py-3 px-4">
        <span className={`text-[10px] uppercase tracking-[0.1em] px-2 py-1 border rounded font-mono ${tier.className}`}>
          {tier.label}
        </span>
      </td>

      <td className="py-3 px-4 font-mono text-xs opacity-70">
        {lastVerified ? new Date(lastVerified).toLocaleDateString() : '—'}
      </td>

      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saveState === 'saving' || saveState === 'saved'}
            className="border border-hairline text-xs px-3 py-1.5 rounded hover:border-signal-blue transition-colors disabled:opacity-60"
          >
            {saveState === 'saved' ? 'Saved' : saveState === 'saving' ? 'Saving…' : 'Save'}
          </button>
          <a
            href={"/p/" + username}
            target="_blank"
            rel="noreferrer"
            className="inline-block border border-hairline text-xs px-3 py-1.5 rounded hover:border-signal-blue transition-colors"
          >
            View Passport
          </a>
        </div>
      </td>
    </tr>
  );
};

export default CandidateRow;