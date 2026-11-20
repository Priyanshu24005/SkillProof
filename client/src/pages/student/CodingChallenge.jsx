import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { startChallenge, submitChallenge } from '../../api/challenge.api';
import StudentShell from '../../Layouts/StudentShell';
import EvidenceProgressBar from '../../components/EvidenceProgressBar';

const CHALLENGE_TIMEOUT_MIN = 15;

const runTests = (code, functionName, testCases) => {
  try {
    const fn = new Function(`${code}\nreturn ${functionName};`)();
    return testCases.map((tc) => {
      try {
        const output = fn(...tc.input);
        const passed = JSON.stringify(output) === JSON.stringify(tc.expectedOutput);
        return { name: tc.name, passed, output };
      } catch (err) {
        return { name: tc.name, passed: false, error: err.message };
      }
    });
  } catch (err) {
    return testCases.map((tc) => ({ name: tc.name, passed: false, error: err.message }));
  }
};

const CodingChallenge = () => {
  const { skill } = useParams();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(CHALLENGE_TIMEOUT_MIN * 60);

  useEffect(() => {
    startChallenge(skill)
      .then((res) => {
        setChallenge(res.data);
        setCode(res.data.starterCode);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load challenge'))
      .finally(() => setLoading(false));
  }, [skill]);

  const handleRunTests = () => {
    const results = runTests(code, challenge.functionName, challenge.testCases);
    setTestResults(results);
  };

  const handleSubmit = useCallback(async () => {
    if (!challenge || submitting || result) return;
    const results = runTests(code, challenge.functionName, challenge.testCases);
    setTestResults(results);
    const passedTests = results.filter((r) => r.passed).length;

    setSubmitting(true);
    try {
      const res = await submitChallenge(skill, {
        challengeId: challenge._id,
        code,
        passedTests,
        totalTests: results.length,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }, [code, challenge, skill, submitting, result]);

  useEffect(() => {
    if (loading || result || !challenge) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, result, challenge, handleSubmit]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (loading) {
    return (
      <StudentShell>
        <div className="p-10">Loading challenge...</div>
      </StudentShell>
    );
  }

  if (error && !challenge) {
    return (
      <StudentShell>
        <div className="p-10 text-flag-red">{error}</div>
      </StudentShell>
    );
  }

  if (result) {
    return (
      <StudentShell>
        <div className="max-w-xl mx-auto p-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Challenge Complete</h1>
          <div className="font-mono text-5xl font-bold mb-2">{result.score}/100</div>
          <p className="opacity-70 mb-6">{result.passedTests} / {result.totalTests} tests passed</p>
          <button
            onClick={() => navigate(`/github/${skill}`)}
            className="px-6 py-3 rounded-lg bg-signal-blue text-white font-mono"
          >
            Continue to GitHub Evidence
          </button>
        </div>
      </StudentShell>
    );
  }

  const passedCount = testResults ? testResults.filter((r) => r.passed).length : null;

  return (
    <StudentShell>
      <EvidenceProgressBar activeStep={2} knowledgeScore={88.0} timeLeft={formatTime(timeLeft)} />

      <div className="px-8 py-6 border-b border-hairline">
        <h1 className="text-2xl font-bold">{challenge.title}</h1>
      </div>

      <div className="grid grid-cols-2 min-h-[70vh]">
        <div className="p-8 overflow-y-auto border-r border-hairline">
          <div className="flex items-center gap-3 mb-6 font-mono text-xs">
            <span className="border border-hairline rounded px-2 py-1">
              {challenge.testCases.length} unit tests
            </span>
            <span className="border border-hairline rounded px-2 py-1">DIFFICULTY: {challenge.difficulty}</span>
          </div>

          <h3 className="font-mono text-xs opacity-60 mb-2">PROBLEM DESCRIPTION</h3>
          <p className="mb-6 leading-relaxed">{challenge.prompt}</p>

          {error && <p className="text-flag-red text-sm">{error}</p>}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-hairline font-mono text-xs">
            <div className="flex items-center gap-3">
              <span className="text-yellow-500">●</span> JavaScript
              <span className="opacity-50">solution.js</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCode(challenge.starterCode)}
                className="opacity-70 hover:opacity-100"
              >
                Reset Code
              </button>
              <button
                onClick={handleRunTests}
                className="border border-hairline rounded px-3 py-1.5"
              >
                Run Tests
              </button>
            </div>
          </div>

          <Editor
            height="50vh"
            defaultLanguage="javascript"
            value={code}
            onChange={(value) => setCode(value)}
            theme="vs-dark"
            options={{ fontSize: 14, minimap: { enabled: false } }}
          />

          {testResults && (
            <div className="border-t border-hairline p-4 overflow-y-auto max-h-64">
              <div className="flex items-center gap-4 font-mono text-xs mb-3">
                <span>Test Results</span>
                <span className="text-pass-green">{passedCount} PASSED</span>
                <span className="text-flag-red">{testResults.length - passedCount} FAILED</span>
                <span className="opacity-50">Total: {testResults.length} unit tests</span>
              </div>
              {testResults.map((r, i) => (
                <div
                  key={i}
                  className={`font-mono text-xs mb-1.5 flex items-center gap-2 ${
                    r.passed ? 'text-pass-green' : 'text-flag-red'
                  }`}
                >
                  <span>{r.passed ? '✓' : '✕'}</span>
                  <span>{r.name}</span>
                  {!r.passed && r.error && <span className="opacity-60">— {r.error}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 px-8 py-4 border-t border-hairline">
        <button
          onClick={handleRunTests}
          className="px-4 py-2.5 rounded-lg border border-hairline font-mono text-sm"
        >
          Run Tests
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2.5 rounded-lg bg-signal-blue text-white font-mono text-sm font-semibold disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : 'Submit Challenge'}
        </button>
      </div>
    </StudentShell>
  );
};

export default CodingChallenge;