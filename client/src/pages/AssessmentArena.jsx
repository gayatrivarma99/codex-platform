import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Send,
  BookOpen,
} from 'lucide-react';
import DifficultyBadge from '../components/DifficultyBadge';
import { assessmentService } from '../services/assessmentService';
import { useAuth } from '../context/AuthContext';

export default function AssessmentArena() {
  const { code } = useParams();
  const { isAuthenticated } = useAuth();

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);
  const [completedResult, setCompletedResult] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const fetchAssessment = async () => {
    try {
      const res = await assessmentService.getAssessmentByCode(code);
      if (res.success) {
        setAssessment(res.assessment);
        if (res.assessment.candidateStatus === 'in_progress') {
          setStarted(true);
        } else if (res.assessment.candidateStatus === 'completed') {
          setStarted(true);
          setCompletedResult({ completed: true });
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to access assessment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessment();
  }, [code]);

  // Handle assessment countdown timer
  useEffect(() => {
    if (!started || !assessment?.startedAt || completedResult) return;

    const interval = setInterval(() => {
      const startMs = new Date(assessment.startedAt).getTime();
      const durationMs = assessment.duration * 60 * 1000;
      const endMs = startMs + durationMs;
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((endMs - now) / 1000));

      setTimeRemaining(diff);

      if (diff <= 0) {
        clearInterval(interval);
        handleFinish();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [started, assessment?.startedAt, completedResult]);

  const handleStart = async () => {
    try {
      const res = await assessmentService.startAssessment(assessment._id);
      if (res.success) {
        setStarted(true);
        setAssessment((prev) => ({
          ...prev,
          startedAt: res.startedAt,
          candidateStatus: 'in_progress',
        }));
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to start assessment');
    }
  };

  const handleFinish = async () => {
    if (completedResult) return;
    try {
      const res = await assessmentService.finishAssessment(assessment._id);
      if (res.success) {
        setCompletedResult(res.result);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit assessment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center px-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-xs text-slate-400 mb-6">{error}</p>
        <Link to="/assessments" className="px-4 py-2 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl">
          Return to Code Entry
        </Link>
      </div>
    );
  }

  // Completed Screen
  if (completedResult) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center backdrop-blur-xl shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Assessment Concluded</h2>
          <p className="text-xs text-slate-400 mb-6">
            Your submissions have been evaluated and recorded.
          </p>

          {completedResult.percentage !== undefined && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 max-w-sm mx-auto mb-6">
              <div className="text-3xl font-extrabold text-teal-400 font-mono">
                {completedResult.percentage}%
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Score: {completedResult.score} / {completedResult.totalPoints} points
              </div>
              <div className="mt-3">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    completedResult.passed
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {completedResult.passed ? 'PASSED' : 'DID NOT PASS'}
                </span>
              </div>
            </div>
          )}

          <Link
            to="/dashboard"
            className="px-6 py-2.5 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl"
          >
            Go to Student Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Instructions & Start Screen
  if (!started) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
            <div>
              <span className="text-[11px] font-bold text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                Assessment: {assessment.code}
              </span>
              <h1 className="text-2xl font-bold text-white mt-2">{assessment.title}</h1>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Duration</div>
              <div className="text-lg font-bold font-mono text-white">{assessment.duration} mins</div>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-300 leading-relaxed mb-8">
            <p>{assessment.description || 'Welcome to your technical assessment.'}</p>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="font-semibold text-slate-200">Evaluation Guidelines:</div>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs">
                <li>You will have <strong>{assessment.duration} minutes</strong> to solve {assessment.problems.length} problems.</li>
                <li>Passing score requirement: <strong>{assessment.passingScore}%</strong>.</li>
                <li>You may run and test your code multiple times before final submission.</li>
                <li>Closing your browser will not pause the timer.</li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2"
          >
            Start Assessment Now
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Active Assessment Taking Screen
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Assessment Header with Fixed Timer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">{assessment.title}</h1>
          <span className="text-xs text-teal-400 font-mono">Code: {assessment.code}</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-mono text-base font-bold text-amber-400">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>

          <button
            onClick={handleFinish}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Finish & Submit
          </button>
        </div>
      </div>

      {/* Problems to solve */}
      <div className="grid md:grid-cols-2 gap-4">
        {assessment.problems?.map((ap, idx) => {
          const prob = ap.problem;
          return (
            <div
              key={idx}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-teal-500/30 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-teal-400">
                    Problem #{idx + 1}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {ap.points} pts
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-2">{prob.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                  {prob.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <DifficultyBadge difficulty={prob.difficulty} size="xs" />
                <Link
                  to={`/problems/${prob.slug}?assessmentId=${assessment._id}`}
                  className="px-4 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 font-semibold text-xs rounded-xl border border-teal-500/30 flex items-center gap-1.5 transition-colors"
                >
                  Code in Editor <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
