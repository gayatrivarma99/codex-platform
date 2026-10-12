import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileCheck, Key, ArrowRight, ShieldCheck, Clock, Award, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AssessmentList() {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isInstructor } = useAuth();

  const handleEnterAssessment = (e) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      setError('Please enter a valid assessment code');
      return;
    }
    navigate(`/assessments/arena/${accessCode.trim().toUpperCase()}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 mb-4 shadow-lg shadow-teal-500/10">
          <FileCheck className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Coding Assessment Gateway
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          Enter your institutional access code to begin your technical evaluation.
        </p>
      </div>

      {/* Code Entry Card */}
      <div className="max-w-md mx-auto bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl mb-12">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleEnterAssessment} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Assessment Access Code
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="e.g. CODEX-EVAL-2026"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm font-mono uppercase text-slate-200 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Sample seeded test code: <span className="text-teal-400 font-mono font-bold">CODEX-EVAL-2026</span>
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
          >
            Enter Assessment Arena
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {isInstructor && (
          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <Link
              to="/instructor"
              className="text-xs text-amber-400 hover:underline font-semibold"
            >
              Instructor Portal: Manage & Create Assessments →
            </Link>
          </div>
        )}
      </div>

      {/* Candidate Guidelines */}
      <div className="grid sm:grid-cols-3 gap-6 text-center">
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
          <Clock className="w-6 h-6 text-teal-400 mx-auto mb-2" />
          <h3 className="font-semibold text-slate-200 text-xs mb-1">Timed Evaluation</h3>
          <p className="text-[11px] text-slate-400">
            Once started, the assessment countdown cannot be paused.
          </p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
          <ShieldCheck className="w-6 h-6 text-teal-400 mx-auto mb-2" />
          <h3 className="font-semibold text-slate-200 text-xs mb-1">Automated Test Suites</h3>
          <p className="text-[11px] text-slate-400">
            Solutions are judged against both edge cases and performance limits.
          </p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
          <Award className="w-6 h-6 text-teal-400 mx-auto mb-2" />
          <h3 className="font-semibold text-slate-200 text-xs mb-1">Instant Grading</h3>
          <p className="text-[11px] text-slate-400">
            Receive score percentages and benchmark analysis upon submission.
          </p>
        </div>
      </div>
    </div>
  );
}
