import React from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Terminal,
  Trophy,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Users,
  Flame,
  Award,
  BookOpen,
  FileCheck,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-8 animate-fade-in">
          <Zap className="w-3.5 h-3.5" />
          <span>Next-Gen MERN Algorithmic Judge & Arena</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          Master Algorithms.{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Conquer Code Contests.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          The enterprise coding assessment platform with isolated sandboxed execution,
          dynamic test cases, real-time contest leaderboards, and candidate evaluation suites.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/problems"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <Terminal className="w-4 h-4" />
            Explore Problems
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/contests"
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-all"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            Join Live Contests
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all"
          >
            View Dashboard
          </Link>
        </div>

        {/* Metrics Bar */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { label: 'Coding Problems', value: '20+', icon: BookOpen },
            { label: 'Sandbox Runners', value: 'Isolated', icon: ShieldCheck },
            { label: 'Execution Speed', value: '< 100ms', icon: Zap },
            { label: 'Supported Runtimes', value: 'JS & Python', icon: Terminal },
          ].map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 text-center backdrop-blur-sm"
              >
                <Icon className="w-5 h-5 mx-auto text-emerald-400 mb-2" />
                <div className="text-xl sm:text-2xl font-bold text-slate-100">{m.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{m.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Engineered for Modern Engineers & Instructors
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Every feature is designed with isolation, reliability, and real developer workflows in mind.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-emerald-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-100 mb-2">Isolated Sandbox Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Code runs inside isolated sandboxes with strict time limits, memory caps, and process isolation.
              Zero arbitrary code executes on the core application server.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-amber-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-100 mb-2">Live Contests & Ratings</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compete in scheduled and live contests with server-synchronized timers, dynamic penalty calculations,
              and instant Socket.IO leaderboard broadcasts.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-teal-500/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-4">
              <FileCheck className="w-5 h-5 text-teal-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-100 mb-2">Institutional Assessments</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instructors can build customized coding assessments with access codes, candidate invitation tracking,
              time-limited tests, and detailed score analytics.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Problem Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Problem of the Day
            </span>
            <h3 className="text-2xl font-bold text-white mt-1">Two Sum</h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-xl">
              Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Easy
              </span>
              <span className="text-xs text-slate-400">Arrays • Hash Table</span>
            </div>
          </div>

          <Link
            to="/problems/two-sum"
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm whitespace-nowrap shadow-lg shadow-emerald-500/20 transition-all"
          >
            Solve Challenge
          </Link>
        </div>
      </section>
    </div>
  );
}
