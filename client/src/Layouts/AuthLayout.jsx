import { useTheme } from '../context/ThemeContext';

const AuthLayout = ({ children }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      <header className="flex items-center justify-between px-8 py-4 border-b border-hairline font-mono text-[13px]">
        <div className="flex items-center gap-2.5 font-semibold">
          <span className="w-3.5 h-3.5 bg-signal-blue rounded-[3px]" />
          SkillProof <span className="opacity-50">v2.4.1</span>
        </div>
        <div className="flex items-center gap-2 text-pass-green before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-pass-green">
          ATTESTATION_ENGINE: ONLINE (NODE-US-EAST)
        </div>
        <div className="flex items-center gap-4">
          <span>PROTOCOL: SHA256-ED25519</span>
          <button
            className="font-mono text-xs border border-hairline rounded-md px-3 py-1.5"
            onClick={toggleTheme}
          >
            {theme === 'light' ? 'DARK' : 'LIGHT'}
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-[minmax(320px,640px)_1fr]">
        <div className="px-16 py-14 border-r border-hairline">{children}</div>

        <div className="px-12 py-14 overflow-y-auto">
          <div className="flex items-center gap-2.5 font-mono text-xs opacity-70 mb-5">
            <span className="w-2 h-2 bg-pass-green rounded-sm" />
            EVIDENCE ENGINE INSPECTION
          </div>

          <div className="border border-hairline rounded-xl p-7 bg-surface mb-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[11px] bg-bg border border-hairline px-2 py-1 rounded opacity-80">
                  DOMAIN_VERIFIED
                </span>
                <h2 className="text-xl mt-3">React.js Core &amp; Architecture</h2>
              </div>
              <div className="text-right">
                <div className="font-mono text-4xl font-bold">
                  88.4<span className="text-sm opacity-50">/100</span>
                </div>
                <div className="text-pass-green font-mono text-xs">TIER 1 CONFIRMATION</div>
              </div>
            </div>

            <div className="flex h-2 rounded overflow-hidden my-4">
              <div className="bg-signal-blue" style={{ width: '30%' }} />
              <div className="bg-text opacity-85" style={{ width: '40%' }} />
              <div className="bg-pass-green" style={{ width: '30%' }} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <small className="opacity-60 text-[11px]">1. MCQ EXAM (30%)</small>
                <div className="text-lg font-bold my-1">92.0 / 100</div>
                <small className="opacity-60 text-[11px]">45 items · 18m avg</small>
              </div>
              <div>
                <small className="opacity-60 text-[11px]">2. PRACTICAL (40%)</small>
                <div className="text-lg font-bold my-1">85.0 / 100</div>
                <small className="opacity-60 text-[11px]">12/12 unit tests pass</small>
              </div>
              <div>
                <small className="opacity-60 text-[11px]">3. GIT AUDIT (30%)</small>
                <div className="text-lg font-bold my-1">89.0 / 100</div>
                <small className="opacity-60 text-[11px]">184 commits · 3 repos</small>
              </div>
            </div>
          </div>

          <div className="border border-hairline rounded-xl p-6 font-mono text-xs">
            <strong>IMMUTABLE_ATTESTATION_DIGEST</strong>
            <div className="flex justify-between py-2 opacity-85">
              <span>RECORD_HASH</span><span>e3b0c442...b855</span>
            </div>
            <div className="flex justify-between py-2 opacity-85">
              <span>PROVER_KEY</span><span>ed25519:pub:8f2a...7c19</span>
            </div>
            <div className="flex justify-between py-2 opacity-85">
              <span>TIMESTAMP_BLOCK</span><span>#18,924,102</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;