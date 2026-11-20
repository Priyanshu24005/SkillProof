import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { startAssessment, submitAssessment } from '../../api/assessment.api';
import StudentShell from '../../Layouts/StudentShell';
import EvidenceProgressBar from '../../components/EvidenceProgressBar';

const Assessment = () => {
  const { skill } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    startAssessment(skill)
      .then((res) => {
        setQuestions(res.data.questions);
        setTimeLeft(res.data.timeLimitMinutes * 60);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load assessment'))
      .finally(() => setLoading(false));
  }, [skill]);

  const handleSubmit = useCallback(async () => {
    if (submitting || result) return;
    setSubmitting(true);
    try {
      const formatted = Object.entries(answers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption,
      }));
      const res = await submitAssessment(skill, formatted);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }, [answers, skill, submitting, result]);

  useEffect(() => {
    if (loading || result || !questions.length) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, result, questions.length, handleSubmit]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const selectOption = (questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const toggleFlag = (questionId) => {
    setFlagged((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  if (loading) {
    return <StudentShell><div className="p-10">Loading assessment...</div></StudentShell>;
  }
  if (error && !questions.length) {
    return <StudentShell><div className="p-10 text-flag-red">{error}</div></StudentShell>;
  }

  if (result) {
    return (
      <StudentShell>
        <div className="max-w-xl mx-auto p-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Assessment Complete</h1>
          <div className="font-mono text-5xl font-bold mb-2">{result.score}/100</div>
          <p className="opacity-70 mb-6">{result.correctCount} / {result.totalQuestions} correct</p>
          <button
            onClick={() => navigate(`/challenge/${skill}`)}
            className="px-6 py-3 rounded-lg bg-signal-blue text-white font-mono"
          >
            Continue to Practical Challenge
          </button>
        </div>
      </StudentShell>
    );
  }

  const question = questions[currentIndex];
  const doneCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const percentDone = Math.round((doneCount / questions.length) * 100);

  return (
    <StudentShell>
      <EvidenceProgressBar activeStep={1} timeLeft={formatTime(timeLeft)} />

      <div className="px-8 py-6 border-b border-hairline">
        <h1 className="text-2xl font-bold capitalize">{skill}.js — Knowledge Assessment</h1>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-6 p-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-sm opacity-70">
              QUESTION {currentIndex + 1} / {questions.length}
            </span>
            <button
              onClick={() => toggleFlag(question._id)}
              className={`font-mono text-xs border rounded px-3 py-1.5 ${
                flagged[question._id] ? 'border-flag-red text-flag-red' : 'border-hairline opacity-70'
              }`}
            >
              {flagged[question._id] ? '⚑ Flagged' : '☐ Flag for review'}
            </button>
          </div>

          <div className="border border-hairline rounded-xl p-6 mb-6">
            <p className="text-lg font-medium mb-2">{question.questionText}</p>
            {question.difficulty && (
              <span className="font-mono text-xs opacity-50">DIFFICULTY: {question.difficulty}</span>
            )}
          </div>

          <div className="space-y-3 mb-8">
            {question.options.map((opt, i) => (
              <label
                key={i}
                className={`flex items-start gap-3 px-4 py-3 border rounded-lg cursor-pointer ${
                  answers[question._id] === i ? 'border-signal-blue bg-surface' : 'border-hairline'
                }`}
              >
                <input
                  type="radio"
                  name={question._id}
                  checked={answers[question._id] === i}
                  onChange={() => selectOption(question._id, i)}
                  className="mt-1"
                />
                <span>
                  <span className="font-mono text-xs opacity-50 mr-2">[{String.fromCharCode(65 + i)}]</span>
                  {opt}
                </span>
              </label>
            ))}
          </div>

          {error && <p className="text-flag-red text-sm mb-4">{error}</p>}

          <div className="flex items-center justify-between border-t border-hairline pt-4">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2.5 rounded-lg border border-hairline font-mono text-sm disabled:opacity-40"
            >
              Previous Question
            </button>

            <div className="text-center">
              <div className="font-mono text-sm">
                PROGRESS: {doneCount} of {questions.length} answered{' '}
                <span className="text-signal-blue">{percentDone}% completed</span>
              </div>
              <div className="w-48 h-1.5 bg-hairline rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-pass-green" style={{ width: `${percentDone}%` }} />
              </div>
            </div>

            {currentIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2.5 rounded-lg bg-signal-blue text-white font-mono text-sm font-semibold disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit Assessment'}
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                className="px-5 py-2.5 rounded-lg bg-signal-blue text-white font-mono text-sm font-semibold"
              >
                Next Question
              </button>
            )}
          </div>
        </div>

        <div>
          <div className="border border-hairline rounded-xl p-4">
            <div className="flex items-center justify-between font-mono text-xs opacity-70 mb-3">
              <span>QUESTION NAVIGATOR</span>
              <span>TOTAL: {questions.length}</span>
            </div>

            <div className="flex gap-3 font-mono text-[10px] mb-3">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-pass-green rounded-sm" /> Done ({doneCount})</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 border border-hairline rounded-sm" /> Empty ({questions.length - doneCount})</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 border border-flag-red rounded-sm" /> Flagged ({flaggedCount})</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, i) => {
                const isDone = answers[q._id] !== undefined;
                const isFlagged = flagged[q._id];
                const isCurrent = i === currentIndex;
                return (
                  <button
                    key={q._id}
                    onClick={() => setCurrentIndex(i)}
                    className={`font-mono text-xs py-2 rounded border ${
                      isCurrent
                        ? 'border-signal-blue text-signal-blue font-bold'
                        : isFlagged
                        ? 'border-flag-red text-flag-red'
                        : isDone
                        ? 'border-hairline bg-surface'
                        : 'border-hairline opacity-50'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </StudentShell>
  );
};

export default Assessment;