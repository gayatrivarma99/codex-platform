import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Target,
  Award,
  Zap,
  BookOpen,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import DifficultyBadge from '../components/DifficultyBadge';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.username) return;
      try {
        const res = await userService.getUserProfile(user.username);
        if (res.success) {
          setProfile(res.profile);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.username]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = profile?.stats || {
    totalSolved: 0,
    easy: { solved: 0, total: 10 },
    medium: { solved: 0, total: 10 },
    hard: { solved: 0, total: 5 },
    totalSubmissions: 0,
    acceptedSubmissions: 0,
    acceptanceRate: 0,
  };

  const pieData = [
    { name: 'Easy', value: stats.easy.solved || 0, color: '#10b981' },
    { name: 'Medium', value: stats.medium.solved || 0, color: '#f59e0b' },
    { name: 'Hard', value: stats.hard.solved || 0, color: '#f43f5e' },
  ].filter((d) => d.value > 0);

  // If none solved yet, show placeholder slice
  const displayPieData = pieData.length > 0 ? pieData : [{ name: 'Unsolved', value: 1, color: '#334155' }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Student Performance Arena
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Keep your streak active and conquer today's algorithmic challenges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/problems"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Practice Problems
          </Link>
          <Link
            to={`/profile/${user?.username}`}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
          >
            View Public Profile
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Solved */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Problems Solved</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalSolved}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Across all topics
          </div>
        </div>

        {/* Acceptance Rate */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Acceptance Rate</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.acceptanceRate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {stats.acceptedSubmissions} / {stats.totalSubmissions} submissions
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Daily Streak</span>
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
          </div>
          <div className="text-2xl font-bold text-orange-400">
            {profile?.streak?.current || 0} Days
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Longest: {profile?.streak?.longest || 0} days
          </div>
        </div>

        {/* Contest Rating */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Contest Rating</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {profile?.rating || 1500}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Global Standing
          </div>
        </div>
      </div>

      {/* Main Grid: Breakdown Chart & Recent Submissions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Difficulty Breakdown Chart & Meters */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            Solved Breakdown
          </h2>

          {/* Donut Chart */}
          <div className="h-44 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {displayPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center pointer-events-none">
              <div className="text-xl font-extrabold text-white">{stats.totalSolved}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Solved</div>
            </div>
          </div>

          {/* Difficulty Meters */}
          <div className="space-y-4 pt-2">
            {/* Easy */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-400 font-semibold">Easy</span>
                <span className="text-slate-300 font-mono">
                  {stats.easy.solved} / {stats.easy.total}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.easy.total > 0 ? (stats.easy.solved / stats.easy.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Medium */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-400 font-semibold">Medium</span>
                <span className="text-slate-300 font-mono">
                  {stats.medium.solved} / {stats.medium.total}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.medium.total > 0 ? (stats.medium.solved / stats.medium.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Hard */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-rose-400 font-semibold">Hard</span>
                <span className="text-slate-300 font-mono">
                  {stats.hard.solved} / {stats.hard.total}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.hard.total > 0 ? (stats.hard.solved / stats.hard.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Recent Submissions Table */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Recent Submissions
            </h2>
            <Link to="/problems" className="text-xs text-emerald-400 hover:underline">
              Practice more →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="px-3 py-2.5">Problem</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Language</th>
                  <th className="px-3 py-2.5 text-right">Runtime</th>
                  <th className="px-3 py-2.5 text-right">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {profile?.recentSubmissions?.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">
                      No submissions recorded yet. Open a problem to start!
                    </td>
                  </tr>
                ) : (
                  profile?.recentSubmissions?.map((sub) => (
                    <tr key={sub._id} className="hover:bg-slate-800/30">
                      <td className="px-3 py-3 font-semibold text-slate-200">
                        <Link
                          to={`/problems/${sub.problem?.slug}`}
                          className="hover:text-emerald-400 transition-colors"
                        >
                          {sub.problem?.title}
                        </Link>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`font-semibold ${
                            sub.status === 'Accepted'
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-400 font-mono">
                        {sub.language}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-slate-300">
                        {sub.executionTime} ms
                      </td>
                      <td className="px-3 py-3 text-right text-slate-400">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
