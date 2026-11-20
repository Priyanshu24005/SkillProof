import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const StudentShell = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { label: 'Overview', num: '01', path: '/dashboard' },
    { label: 'Skills', num: '02', path: '/skills' },
    { label: 'Verify', num: '03', path: '/verify' },
    { label: 'Passport', num: '04', path: user ? `/p/${user.username}` : '/dashboard' },
    { label: 'Talent', num: '05', path: '/talent' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  return (
    <div className="min-h-screen flex bg-bg text-text">
      <aside className="w-64 h-screen sticky top-0 border-r border-hairline p-6 flex flex-col shrink-0">
        <div className="flex items-center gap-2 font-semibold mb-1">
          <span className="w-3.5 h-3.5 bg-signal-blue rounded-[3px]" />
          SkillProof <span className="opacity-50 text-sm font-normal">v2.4.1</span>
        </div>
        <div className="font-mono text-xs opacity-70 mb-1 mt-2">
          <span className="text-pass-green">● CONSENSUS</span> <span className="ml-2">ONLINE</span>
        </div>
        <div className="font-mono text-xs opacity-70 mb-8">
          BLOCK_LATENCY <span className="ml-2">38ms</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.path.split('/').slice(0, 2).join('/'));
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm flex justify-between items-center ${
                  active ? 'bg-surface font-semibold border-l-2 border-signal-blue' : 'opacity-70'
                }`}
              >
                {item.label}
                <span className="font-mono text-xs opacity-50">[{item.num}]</span>
              </button>
            );
          })}
        </nav>

        <div className="border border-hairline rounded-lg p-4 font-mono text-xs mb-4">
          <div className="opacity-60 mb-2">ACTIVE ATTESTATION</div>
          <div>ed25519:cand_914028</div>
          <div className="mt-1">2/3 Verified Tier 1</div>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="w-full border border-hairline rounded text-xs tracking-[0.14em] uppercase py-2.5 font-mono mb-2"
        >
          {theme === 'light' ? 'Dark mode' : 'Light mode'}
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-3 rounded-lg bg-signal-blue text-white font-mono text-sm font-semibold mb-2"
        >
          LOGOUT
        </button>

        <div className="font-mono text-[10px] opacity-40">NODE: MAINNET-01 · CIPHER: ED25519</div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
};

export default StudentShell;