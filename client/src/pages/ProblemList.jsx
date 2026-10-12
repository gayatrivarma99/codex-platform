import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  CheckCircle2,
  Circle,
  ArrowUpDown,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import DifficultyBadge from '../components/DifficultyBadge';
import { problemService } from '../services/problemService';
import { useAuth } from '../context/AuthContext';

export default function ProblemList() {
  const { isAuthenticated } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  const [categories, setCategories] = useState({ topics: [], tags: [] });

  // Fetch unique categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await problemService.getCategories();
        if (res.success) {
          setCategories(res);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  // Fetch problems on parameter changes
  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 15,
          search: search.trim() || undefined,
          difficulty: difficulty || undefined,
          topic: topic || undefined,
          status: status || undefined,
          sortBy,
          order,
        };
        const res = await problemService.getProblems(params);
        if (res.success) {
          setProblems(res.problems || []);
          setTotal(res.total || 0);
          setTotalPages(res.pages || 1);
        }
      } catch (err) {
        console.error('Error fetching problems:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [page, search, difficulty, topic, status, sortBy, order]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-emerald-400" />
          Problem Explorer
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Explore {total} algorithmic challenges across dynamic programming, trees, graphs, and system design.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-6 backdrop-blur-md space-y-4">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search problems by title, topic, or keyword..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Difficulty Filter */}
            <select
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            {/* Status Filter */}
            {isAuthenticated && (
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="">All Statuses</option>
                <option value="solved">Solved</option>
                <option value="unsolved">Unsolved</option>
              </select>
            )}

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="createdAt">Newest First</option>
              <option value="difficulty">Difficulty</option>
              <option value="acceptanceRate">Acceptance Rate</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>
        </div>

        {/* Topic Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              setTopic('');
              setPage(1);
            }}
            className={`px-3 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
              topic === ''
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            All Topics
          </button>
          {(categories.topics || []).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTopic(topic === t ? '' : t);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                topic === t
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Problems Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 w-12 text-center">Status</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Difficulty</th>
                <th className="px-4 py-3 hidden md:table-cell">Topics</th>
                <th className="px-4 py-3 text-right">Acceptance</th>
                <th className="px-4 py-3 text-right hidden sm:table-cell">Submissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading algorithmic challenges...</span>
                    </div>
                  </td>
                </tr>
              ) : problems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No problems match your current criteria.
                  </td>
                </tr>
              ) : (
                problems.map((problem) => (
                  <tr
                    key={problem._id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Status */}
                    <td className="px-4 py-3.5 text-center">
                      {problem.isSolved ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-600 mx-auto" />
                      )}
                    </td>

                    {/* Title */}
                    <td className="px-4 py-3.5 font-medium text-slate-200">
                      <Link
                        to={`/problems/${problem.slug}`}
                        className="group-hover:text-emerald-400 transition-colors flex items-center gap-2 font-semibold"
                      >
                        {problem.title}
                      </Link>
                    </td>

                    {/* Difficulty */}
                    <td className="px-4 py-3.5">
                      <DifficultyBadge difficulty={problem.difficulty} />
                    </td>

                    {/* Topics */}
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(problem.topics || []).slice(0, 3).map((top, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md"
                          >
                            {top}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Acceptance */}
                    <td className="px-4 py-3.5 text-right font-mono text-slate-300">
                      {problem.acceptanceRate || 0}%
                    </td>

                    {/* Total Submissions */}
                    <td className="px-4 py-3.5 text-right font-mono text-slate-400 hidden sm:table-cell">
                      {problem.totalSubmissions || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Page <span className="text-slate-200 font-bold">{page}</span> of{' '}
              <span className="text-slate-200 font-bold">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition-colors"
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
