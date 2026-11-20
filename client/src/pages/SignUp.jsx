import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../Layouts/AuthLayout';

const SignUp = () => {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register({ name, username, email, password, role });
      navigate(user.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <span className="font-mono text-[11px] bg-surface border border-hairline px-2 py-1 rounded opacity-80">
        AUTH_GATEWAY
      </span>
      <h1 className="text-[28px] mt-4 mb-2">Create your SkillProof account</h1>
      <p className="opacity-70 mb-7 max-w-[440px]">
        Join as a candidate or recruiter to access verified skill scores.
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
        <Link to="/signin" className="pb-2.5 text-sm opacity-50">Sign in</Link>
        <span className="pb-2.5 text-sm font-semibold border-b-2 border-signal-blue">Create account</span>
      </div>

      <form onSubmit={handleSubmit}>
        <label className="block font-mono text-[11px] uppercase opacity-70 mt-4 mb-1.5">
          Full name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3.5 py-3 border border-hairline rounded-lg bg-surface text-text text-sm focus:outline-none focus:border-signal-blue"
        />

        <label className="block font-mono text-[11px] uppercase opacity-70 mt-4 mb-1.5">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
          placeholder="alexlin"
          required
          className="w-full px-3.5 py-3 border border-hairline rounded-lg bg-surface text-text text-sm focus:outline-none focus:border-signal-blue"
        />

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
          minLength={8}
          className="w-full px-3.5 py-3 border border-hairline rounded-lg bg-surface text-text text-sm focus:outline-none focus:border-signal-blue"
        />

        {error && <p className="text-flag-red text-[13px] mt-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 py-3.5 rounded-lg bg-signal-blue text-white font-mono font-semibold tracking-wide disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'CREATE ACCOUNT'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default SignUp;