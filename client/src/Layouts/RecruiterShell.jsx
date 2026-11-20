import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/recruiter/dashboard' },
  { label: 'Saved / Shortlisted', to: '/recruiter/saved' },
  { label: 'Talent Pool', to: '/recruiter/talent-pool' },
];

const RecruiterShell = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  return (
    <div data-theme={theme} className="min-h-screen flex bg-bg text-text">
      {/* Sidebar */}
      <aside className="w-[220px] h-screen sticky top-0 shrink-0 border-r border-hairline flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 px-5 py-5 border-b border-hairline">
            <span className="w-3 h-3 bg-signal-blue inline-block rounded-sm" />
            <span className="font-semibold text-sm tracking-tight">SkillProof</span>
          </div>

          <nav className="px-3 py-4 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-2.5 text-sm rounded transition-colors ${
                    isActive
                      ? 'bg-surface font-semibold border border-hairline'
                      : 'opacity-70 hover:opacity-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="px-4 py-4 border-t border-hairline flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            className="w-full border border-hairline rounded text-xs tracking-[0.14em] uppercase py-2.5 font-mono"
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-3 rounded-lg bg-signal-blue text-white font-mono text-sm font-semibold"
          >
            LOGOUT
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center justify-between px-6 border-b border-hairline text-xs font-mono">
          <div className="flex items-center gap-2 opacity-70">
            <span className="w-1.5 h-1.5 rounded-full bg-pass-green" />
            <span>Consensus online</span>
          </div>
          <span className="uppercase tracking-[0.18em] opacity-60">Recruiter Portal</span>
        </header>

        <main className="flex-1 min-w-0 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
};

export default RecruiterShell;