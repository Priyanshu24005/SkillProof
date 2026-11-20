const steps = [
  { label: 'Knowledge Assessment', num: 1 },
  { label: 'Practical Challenge', num: 2 },
  { label: 'GitHub Evidence', num: 3 },
];

const EvidenceProgressBar = ({ activeStep, knowledgeScore, timeLeft }) => {
  return (
    <div className="border-b border-hairline">
      <div className="flex items-center gap-8 px-8 py-4 font-mono text-sm">
        {steps.map((step) => {
          const done = step.num < activeStep;
          const active = step.num === activeStep;
          return (
            <div key={step.num} className="flex items-center gap-2">
              {done ? (
                <span className="text-pass-green">✓</span>
              ) : (
                <span className={active ? 'text-signal-blue' : 'opacity-40'}>{step.num}.</span>
              )}
              <span className={active ? 'text-signal-blue font-semibold' : done ? '' : 'opacity-40'}>
                {step.label}
              </span>
              {step.num === 1 && knowledgeScore != null && (
                <span className="opacity-60">({knowledgeScore.toFixed(1)}%)</span>
              )}
              {active && (
                <span className="bg-surface border border-signal-blue text-signal-blue px-2 py-0.5 rounded text-xs">
                  ACTIVE
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 px-8 pb-4 font-mono text-xs">
        <div className="border border-hairline rounded-md px-3 py-2 flex-1">
          <span className="opacity-60">DOMAIN //</span> FRONTEND_SYSTEMS — <span className="opacity-60">WEIGHT:</span> 40%
        </div>
        <div className="border border-signal-blue rounded-md px-3 py-2 text-signal-blue">
          TIER 2 // APPLIED EXECUTION
        </div>
        {timeLeft && (
          <div className="border border-hairline rounded-md px-3 py-2 flex items-center gap-2">
            <span className="opacity-60">REMAINING TIME:</span>
            <span className="text-flag-red font-semibold">{timeLeft}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvidenceProgressBar;