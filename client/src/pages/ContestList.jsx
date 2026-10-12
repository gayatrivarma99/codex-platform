import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Clock, Users, ArrowRight, CheckCircle2, Calendar } from 'lucide-react';
import { contestService } from '../services/contestService';
import { useAuth } from '../context/AuthContext';

export default function ContestList() {
  const { isAuthenticated } = useAuth();
  const [contests, setContests] = useState([]);
  const [serverTime, setServerTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await contestService.getContests();
        if (res.success) {
          setContests(res.contests || []);
          if (res.serverTime) setServerTime(new Date(res.serverTime));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  const liveContests = contests.filter((c) => c.status === 'live');
  const upcomingContests = contests.filter((c) => c.status === 'upcoming');
  const pastContests = contests.filter((c) => c.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Trophy className="w-7 h-7 text-amber-400" />
          Contest Arena
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Compete in live algorithmic tournaments, gain rating points, and climb the platform leaderboards.
        </p>
      </div>

      {/* 1. Live Contests Section */}
      {liveContests.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <h2 className="text-lg font-bold text-white">Live Now</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {liveContests.map((c) => (
              <div
                key={c._id}
                className="bg-gradient-to-r from-rose-950/20 via-slate-900 to-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                    Live
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {c.participantCount || 0} participants
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{c.title}</h3>
                <p className="text-xs text-slate-400 mb-6 line-clamp-2">{c.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div className="text-xs text-slate-300">
                    Duration: <strong>{c.duration} mins</strong>
                  </div>
                  <Link
                    to={`/contests/${c.slug}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition-all"
                  >
                    Enter Arena
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Upcoming Contests */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-400" />
          Upcoming Contests
        </h2>

        {upcomingContests.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No upcoming contests scheduled currently.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingContests.map((c) => (
              <div
                key={c._id}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      Upcoming
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {c.duration} mins
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mb-1">{c.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">{c.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    {new Date(c.startTime).toLocaleDateString()} {new Date(c.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <Link
                    to={`/contests/${c.slug}`}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Completed Contests */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Past Contests</h2>
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Contest Title</th>
                <th className="px-4 py-3">Concluded On</th>
                <th className="px-4 py-3">Participants</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {pastContests.map((c) => (
                <tr key={c._id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-semibold text-slate-200">{c.title}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(c.endTime).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{c.participantCount || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/contests/${c.slug}`}
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      View Leaderboard
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
