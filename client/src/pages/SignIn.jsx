import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../Layouts/AuthLayout';

const SignIn = () => {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login({ email, password, role });
      navigate(user.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <span className="font-mono text-[11px] bg-surface border border-hairline px-2 py-1 rounded opacity-80">
        AUTH_GATEWAY
      </span>
      <h1 className="text-[28px] mt-4 mb-2">Sign in to SkillProof</h1>
      <p className="opacity-70 mb-7 max-w-[440px]">
        Access verified candidate scores, git-backed challenge evaluations.
      </p>

      <div className="flex border border-hairline rounded-lg overflow-hidden mb-6">
        <button
          type="button"
          className={`flex-1 py-2.5 px-3.5 font-mono text-[13px] ${role === 'student' ? 'bg-surface font-semibold' : 'opacity-60'}`}
          onClick={() => setRole('student')}
        >
          Student / Candidate
        </button>
        <button
          type="button"
          className={`flex-1 py-2.5 px-3.5 font-mono text-[13px] ${role === 'recruiter' ? 'bg-surface font-semibold' : 'opacity-60'}`}
          onClick={() => setRole('recruiter')}
        >
          Recruiter / Auditor
        </button>
      </div>

      <div className="flex gap-6 border-b border-hairline mb-6">
        <span className="pb-2.5 text-sm font-semibold border-b-2 border-signal-blue">Sign in</span>
        <Link to="/signup" className="pb-2.5 text-sm opacity-50">Create account</Link>
      </div>

      <form onSubmit={handleSubmit}>
        <label className="block font-mono text-[11px] uppercase opacity-70 mt-4 mb-1.5">
          Work or academic email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="candidate@institution.edu"
          required
          className="w-full px-3.5 py-3 border border-hairline rounded-lg bg-surface text-text text-sm focus:outline-none focus:border-signal-blue"
        />

        <label className="block font-mono text-[11px] uppercase opacity-70 mt-4 mb-1.5">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3.5 py-3 border border-hairline rounded-lg bg-surface text-text text-sm focus:outline-none focus:border-signal-blue"
        />

        {error && <p className="text-flag-red text-[13px] mt-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 py-3.5 rounded-lg bg-signal-blue text-white font-mono font-semibold tracking-wide disabled:opacity-60"
        >
          {loading ? 'Authenticating...' : 'AUTHENTICATE CREDENTIALS'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default SignIn;