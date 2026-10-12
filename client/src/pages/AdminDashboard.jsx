import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  BookOpen,
  CheckCircle2,
  Trophy,
  FileCheck,
  Search,
  Activity,
  Ban,
  UserCheck,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { adminService } from '../services/adminService';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // User table search & filter
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Active admin tab: 'overview' | 'users' | 'submissions'
  const [adminTab, setAdminTab] = useState('overview');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, subRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers({
          search: userSearch || undefined,
          role: roleFilter || undefined,
          status: statusFilter || undefined,
          limit: 50,
        }),
        adminService.getSubmissions({ limit: 30 }),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUsers(usersRes.users || []);
      if (subRes.success) setSubmissions(subRes.submissions || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [userSearch, roleFilter, statusFilter]);

  const handleToggleStatus = async (userId) => {
    try {
      const res = await adminService.toggleUserStatus(userId);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, status: res.status } : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const res = await adminService.changeUserRole(userId, newRole);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed');
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-400" />
            Platform Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Global system health, user moderation, submission telemetry, and platform stats.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdminTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              adminTab === 'overview'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-300'
            }`}
          >
            System Telemetry
          </button>
          <button
            onClick={() => setAdminTab('users')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              adminTab === 'users'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-300'
            }`}
          >
            User Moderation
          </button>
          <button
            onClick={() => setAdminTab('submissions')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              adminTab === 'submissions'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-300'
            }`}
          >
            Submissions Feed
          </button>
        </div>
      </div>

      {/* 1. Overview Tab */}
      {adminTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Total Users</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white mt-1">{stats.users.total}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                {stats.users.students} students • {stats.users.instructors} instructors
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Total Problems</span>
                <BookOpen className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{stats.problems.total}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                {stats.problems.easy} Easy • {stats.problems.medium} Med • {stats.problems.hard} Hard
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Total Submissions</span>
                <Activity className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-2xl font-bold text-white mt-1">{stats.submissions.total}</div>
              <div className="text-[11px] text-teal-400 mt-1">
                {stats.submissions.acceptanceRate}% acceptance rate
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Contests & Assessments</span>
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-400 mt-1">
                {stats.contests + stats.assessments}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {stats.contests} contests • {stats.assessments} assessments
              </div>
            </div>
          </div>

          {/* Submission Trends Bar Chart */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              7-Day Submissions Telemetry
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData}>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="submissions" name="Total Submissions" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="accepted" name="Accepted" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 2. User Moderation Tab */}
      {adminTab === 'users' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, or username..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
              >
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="px-3 py-2.5">User</th>
                  <th className="px-3 py-2.5">Email</th>
                  <th className="px-3 py-2.5">Role</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/30">
                    <td className="px-3 py-3 font-semibold text-slate-200">
                      <div>{u.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal font-mono">@{u.username}</div>
                    </td>
                    <td className="px-3 py-3 text-slate-300">{u.email}</td>
                    <td className="px-3 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u._id, e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-200"
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={() => handleToggleStatus(u._id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          u.status === 'active'
                            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Submissions Feed Tab */}
      {adminTab === 'submissions' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
          <h2 className="text-base font-bold text-white mb-4">Platform Submissions Live Feed</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="px-3 py-2.5">User</th>
                  <th className="px-3 py-2.5">Problem</th>
                  <th className="px-3 py-2.5">Verdict</th>
                  <th className="px-3 py-2.5">Runtime</th>
                  <th className="px-3 py-2.5">Language</th>
                  <th className="px-3 py-2.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {submissions.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-800/30">
                    <td className="px-3 py-3 font-semibold text-slate-200">
                      @{s.user?.username || 'user'}
                    </td>
                    <td className="px-3 py-3 text-slate-300">
                      {s.problem?.title || 'Problem'}
                    </td>
                    <td className="px-3 py-3 font-semibold">
                      <span
                        className={
                          s.status === 'Accepted'
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-slate-400">
                      {s.executionTime} ms
                    </td>
                    <td className="px-3 py-3 font-mono text-slate-400">
                      {s.language}
                    </td>
                    <td className="px-3 py-3 text-right text-slate-400 font-mono text-[11px]">
                      {new Date(s.submittedAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
