import { useState } from 'react';

const getTierBadge = (compositeScore) => {
  if (compositeScore >= 85) {
    return { label: 'Tier 1 Confirmed', className: 'text-signal-blue border-signal-blue' };
  }
  if (compositeScore >= 70) {
    return { label: 'Tier 2 Provisional', className: 'opacity-80 border-hairline' };
  }
  return { label: 'Below Threshold', className: 'text-flag-red border-flag-red' };
};

const SavedCandidateRow = ({ candidate, onRemove }) => {
  const { username, name, skill, compositeScore, savedAt, email } = candidate;
  const tier = getTierBadge(compositeScore ?? 0);
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      // clipboard API unavailable — silently ignore, email is still visible as text
    }
  };

  return (
    <tr className="border-b border-hairline hover:bg-surface transition-colors">
      <td className="py-3 px-4">
        <div className="font-medium">{name || username}</div>
        <div className="text-xs opacity-60 font-mono">@{username}</div>
        {email && (
          <button
            type="button"
            onClick={handleCopyEmail}
            title="Click to copy"
            className="text-xs font-mono text-signal-blue hover:underline mt-1 block"
          >
            {copied ? 'Copied!' : email}
          </button>
        )}
      </td>

      <td className="py-3 px-4">
        <span className="font-mono">
          {skill} — <span className="font-semibold">{(compositeScore ?? 0).toFixed(1)}</span>/100
        </span>
      </td>

      <td className="py-3 px-4">
        <span className={`text-[10px] uppercase tracking-[0.1em] px-2 py-1 border rounded font-mono ${tier.className}`}>
          {tier.label}
        </span>
      </td>

      <td className="py-3 px-4 font-mono text-xs opacity-70">
        {savedAt ? new Date(savedAt).toLocaleDateString() : '—'}
      </td>

      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onRemove(username)}
            className="border border-hairline text-xs px-3 py-1.5 rounded hover:border-flag-red hover:text-flag-red transition-colors"
          >
            Remove
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

export default SavedCandidateRow;