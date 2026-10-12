import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Trophy,
  Clock,
  Users,
  CheckCircle2,
  ArrowRight,
  Medal,
  AlertCircle,
  Code2,
} from 'lucide-react';
import DifficultyBadge from '../components/DifficultyBadge';
import { contestService } from '../services/contestService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function ContestDetail() {
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuth();
  const socket = useSocket();

  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);

  // Server-synced countdown timer
  const [remainingTime, setRemainingTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    label: '',
  });

  const fetchContestData = async () => {
    try {
      const res = await contestService.getContestBySlug(slug);
      if (res.success && res.contest) {
        setContest(res.contest);
        // Fetch leaderboard
        const lbRes = await contestService.getContestLeaderboard(res.contest._id);
        if (lbRes.success) {
          setLeaderboard(lbRes.leaderboard || []);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load contest details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContestData();
  }, [slug]);

  // Socket.IO real-time contest room listener
  useEffect(() => {
    if (!socket || !contest?._id) return;

    socket.emit('join_contest', contest._id);

    const handleSubmissionUpdate = () => {
      // Refresh contest leaderboard
      contestService.getContestLeaderboard(contest._id).then((res) => {
        if (res.success) setLeaderboard(res.leaderboard);
      });
    };

    socket.on('contest_submission_update', handleSubmissionUpdate);

    return () => {
      socket.emit('leave_contest', contest._id);
      socket.off('contest_submission_update', handleSubmissionUpdate);
    };
  }, [socket, contest?._id]);

  // Synchronized countdown timer logic
  useEffect(() => {
    if (!contest) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const startTime = new Date(contest.startTime).getTime();
      const endTime = new Date(contest.endTime).getTime();

      let target = endTime;
      let label = 'Remaining in Contest';

      if (now < startTime) {
        target = startTime;
        label = 'Contest Starts In';
      } else if (now > endTime) {
        setRemainingTime({ hours: 0, minutes: 0, seconds: 0, isExpired: true, label: 'Contest Concluded' });
        return;
      }

      const diff = Math.max(0, target - now);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setRemainingTime({ hours, minutes, seconds, isExpired: diff <= 0, label });
    }, 1000);

    return () => clearInterval(interval);
  }, [contest]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      alert('Please login to register for this contest');
      return;
    }
    setRegistering(true);
    try {
      await contestService.registerContest(contest._id);
      setContest((prev) => ({ ...prev, isRegistered: true }));
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center px-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Contest Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">{error}</p>
        <Link to="/contests" className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl">
          Back to Contests
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Contest Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  contest.status === 'live'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : contest.status === 'upcoming'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                }`}
              >
                {contest.status}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Duration: {contest.duration} mins
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {contest.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              {contest.description}
            </p>
          </div>

          {/* Synchronized Countdown Timer Display */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-center shrink-0 min-w-[220px]">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              {remainingTime.label}
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 tracking-wider">
              {String(remainingTime.hours).padStart(2, '0')}:
              {String(remainingTime.minutes).padStart(2, '0')}:
              {String(remainingTime.seconds).padStart(2, '0')}
            </div>
            {contest.status !== 'completed' && !contest.isRegistered && (
              <button
                onClick={handleRegister}
                disabled={registering}
                className="mt-3 w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {registering ? 'Registering...' : 'Register for Contest'}
              </button>
            )}
            {contest.isRegistered && (
              <div className="mt-3 text-xs text-emerald-400 flex items-center justify-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Registered
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contest Problems List */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Code2 className="w-5 h-5 text-emerald-400" />
          Contest Problems
        </h2>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3 w-16">#</th>
                <th className="px-4 py-3">Problem Title</th>
                <th className="px-4 py-3">Difficulty</th>
                <th className="px-4 py-3 text-right">Points</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {contest.problems?.map((cp, idx) => {
                const prob = cp.problem;
                const canAccess = contest.status !== 'upcoming' || user?.role === 'admin';

                return (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3.5 font-mono text-slate-400">
                      {String.fromCharCode(65 + idx)}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-200">
                      {canAccess ? (
                        <Link
                          to={`/problems/${prob.slug}?contestId=${contest._id}`}
                          className="hover:text-emerald-400 transition-colors"
                        >
                          {prob.title}
                        </Link>
                      ) : (
                        <span className="text-slate-500">Problem {String.fromCharCode(65 + idx)} (Locked)</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <DifficultyBadge difficulty={prob.difficulty} />
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-amber-400 font-bold">
                      {cp.points || 100} pts
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {canAccess ? (
                        <Link
                          to={`/problems/${prob.slug}?contestId=${contest._id}`}
                          className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                        >
                          Solve <ArrowRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-slate-600 text-xs">Unlocks at Start</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Contest Leaderboard */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Live Contest Standings
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Updated in real-time via Socket.IO
          </span>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3 w-16 text-center">Rank</th>
                <th className="px-4 py-3">Contestant</th>
                <th className="px-4 py-3 text-right">Score</th>
                <th className="px-4 py-3 text-right">Penalty</th>
                <th className="px-4 py-3 text-right">Problems Solved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    No accepted submissions yet. Be the first to solve!
                  </td>
                </tr>
              ) : (
                leaderboard.map((row) => (
                  <tr key={row.rank} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-center font-bold font-mono">
                      {row.rank === 1 ? (
                        <span className="text-amber-400 flex items-center justify-center gap-1">
                          🥇 1
                        </span>
                      ) : row.rank === 2 ? (
                        <span className="text-slate-300 flex items-center justify-center gap-1">
                          🥈 2
                        </span>
                      ) : row.rank === 3 ? (
                        <span className="text-amber-600 flex items-center justify-center gap-1">
                          🥉 3
                        </span>
                      ) : (
                        `#${row.rank}`
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-200">
                      <Link
                        to={`/profile/${row.user?.username}`}
                        className="hover:text-emerald-400 transition-colors flex items-center gap-2"
                      >
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                          {row.user?.username?.[0]?.toUpperCase()}
                        </div>
                        <span>{row.user?.name || row.user?.username}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                      {row.score}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-400">
                      {row.penalty} m
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-200">
                      {row.solvedCount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
