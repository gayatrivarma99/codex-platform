import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Award, Flame, Star, ChevronLeft, ChevronRight, Medal } from 'lucide-react';
import { userService } from '../services/userService';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await userService.getLeaderboard({ page, limit: 25 });
        if (res.success) {
          setLeaderboard(res.leaderboard || []);
          setTotal(res.total || 0);
          setTotalPages(res.pages || 1);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [page]);

  const topThree = leaderboard.slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3 shadow-lg shadow-amber-500/10">
          <Trophy className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Global Leaderboard</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Top algorithmic problem solvers and contest champions on Codex.
        </p>
      </div>

      {/* Podium Showcase for Top 3 */}
      {topThree.length >= 3 && page === 1 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto pt-6">
          {/* Rank 2 */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-4 sm:p-6 text-center flex flex-col items-center justify-end transform hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-700 text-slate-200 font-bold flex items-center justify-center text-lg sm:text-xl mb-3 shadow-lg">
              {topThree[1].username?.[0]?.toUpperCase()}
            </div>
            <div className="text-xs font-bold text-slate-300">🥈 #2</div>
            <Link
              to={`/profile/${topThree[1].username}`}
              className="text-xs sm:text-sm font-bold text-white hover:text-emerald-400 truncate max-w-full block mt-1"
            >
              {topThree[1].username}
            </Link>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">{topThree[1].rating} rating</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">{topThree[1].problemsSolved} solved</div>
          </div>

          {/* Rank 1 */}
          <div className="bg-gradient-to-b from-amber-500/10 to-slate-900/60 border border-amber-500/30 rounded-3xl p-4 sm:p-6 text-center flex flex-col items-center justify-end -translate-y-4 shadow-xl shadow-amber-500/10 hover:-translate-y-5 transition-all">
            <div className="text-2xl mb-1">👑</div>
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-extrabold flex items-center justify-center text-xl sm:text-2xl mb-3 shadow-xl">
              {topThree[0].username?.[0]?.toUpperCase()}
            </div>
            <div className="text-xs font-bold text-amber-400">🥇 Champion</div>
            <Link
              to={`/profile/${topThree[0].username}`}
              className="text-xs sm:text-sm font-bold text-white hover:text-amber-400 truncate max-w-full block mt-1"
            >
              {topThree[0].username}
            </Link>
            <div className="text-[11px] text-amber-300 mt-1 font-mono font-bold">{topThree[0].rating} rating</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">{topThree[0].problemsSolved} solved</div>
          </div>

          {/* Rank 3 */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-4 sm:p-6 text-center flex flex-col items-center justify-end transform hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-900/60 text-amber-200 font-bold flex items-center justify-center text-lg sm:text-xl mb-3 shadow-lg">
              {topThree[2].username?.[0]?.toUpperCase()}
            </div>
            <div className="text-xs font-bold text-amber-600">🥉 #3</div>
            <Link
              to={`/profile/${topThree[2].username}`}
              className="text-xs sm:text-sm font-bold text-white hover:text-emerald-400 truncate max-w-full block mt-1"
            >
              {topThree[2].username}
            </Link>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">{topThree[2].rating} rating</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">{topThree[2].problemsSolved} solved</div>
          </div>
        </div>
      )}

      {/* Rankings Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
            <tr>
              <th className="px-4 py-3 w-16 text-center">Rank</th>
              <th className="px-4 py-3">Coder</th>
              <th className="px-4 py-3 text-right">Rating</th>
              <th className="px-4 py-3 text-right">Streak</th>
              <th className="px-4 py-3 text-right">Solved</th>
              <th className="px-4 py-3 text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-slate-400">
                  Loading rankings...
                </td>
              </tr>
            ) : leaderboard.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-slate-400">
                  No users recorded on leaderboard yet.
                </td>
              </tr>
            ) : (
              leaderboard.map((item) => (
                <tr key={item._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-300">
                    #{item.rank}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-200">
                    <Link
                      to={`/profile/${item.username}`}
                      className="hover:text-emerald-400 transition-colors flex items-center gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                        {item.username[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div>{item.name}</div>
                        <div className="text-[11px] text-slate-400 font-normal">@{item.username}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-amber-400">
                    {item.rating || 1500}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-slate-300">
                    <span className="inline-flex items-center gap-1 text-orange-400">
                      <Flame className="w-3.5 h-3.5 fill-orange-400" />
                      {item.streak || 0}d
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-slate-200 font-semibold">
                    {item.problemsSolved}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-400">
                    {item.score}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Page <span className="text-white font-bold">{page}</span> of{' '}
              <span className="text-white font-bold">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
