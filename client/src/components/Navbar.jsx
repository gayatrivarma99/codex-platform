import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Code2,
  Trophy,
  FileCheck,
  Award,
  Search,
  Bell,
  Sun,
  Moon,
  User,
  LogOut,
  LayoutDashboard,
  Shield,
  GraduationCap,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { userService } from '../services/userService';

export default function Navbar() {
  const { user, isAuthenticated, logout, isInstructor, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const socket = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await userService.getNotifications();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [isAuthenticated]);

  // Real-time socket notification listener
  useEffect(() => {
    if (!socket) return;
    const handleNewNotif = (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('notification', handleNewNotif);
    return () => {
      socket.off('notification', handleNewNotif);
    };
  }, [socket]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await userService.search(searchQuery.trim());
        if (res.success) {
          setSearchResults(res.results);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await userService.markAllNotificationsAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const navLinks = [
    { label: 'Problems', path: '/problems', icon: Code2 },
    { label: 'Contests', path: '/contests', icon: Trophy },
    { label: 'Assessments', path: '/assessments', icon: FileCheck },
    { label: 'Leaderboard', path: '/leaderboard', icon: Award },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Code2 className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Codex<span className="text-emerald-400">.</span>
            </span>
          </Link>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, path, icon: Icon }) => {
              const isActive = location.pathname.startsWith(path);
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Search, Theme, Notifications & User Profile */}
        <div className="flex items-center gap-3">
          {/* Global Search Bar */}
          <div className="relative hidden sm:block" ref={searchRef}>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search problems, contests..."
                value={searchQuery}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                className="w-48 lg:w-64 bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Dropdown Modal */}
            {searchOpen && searchResults && (
              <div className="absolute top-full mt-2 left-0 right-0 w-80 sm:w-96 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 backdrop-blur-xl">
                {isSearching ? (
                  <div className="text-center py-4 text-xs text-slate-400">Searching...</div>
                ) : (
                  <div className="space-y-3">
                    {/* Problems */}
                    {searchResults.problems?.length > 0 && (
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1">
                          Problems
                        </div>
                        <div className="space-y-1">
                          {searchResults.problems.map((p) => (
                            <Link
                              key={p._id}
                              to={`/problems/${p.slug}`}
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs text-slate-200 transition-colors"
                            >
                              <span className="truncate">{p.title}</span>
                              <span
                                className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                  p.difficulty === 'Easy'
                                    ? 'text-emerald-400 bg-emerald-500/10'
                                    : p.difficulty === 'Medium'
                                    ? 'text-amber-400 bg-amber-500/10'
                                    : 'text-rose-400 bg-rose-500/10'
                                }`}
                              >
                                {p.difficulty}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Users */}
                    {searchResults.users?.length > 0 && (
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1">
                          Users
                        </div>
                        <div className="space-y-1">
                          {searchResults.users.map((u) => (
                            <Link
                              key={u._id}
                              to={`/profile/${u.username}`}
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs text-slate-200"
                            >
                              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                                {u.username[0]?.toUpperCase()}
                              </div>
                              <span className="truncate">{u.name} (@{u.username})</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contests */}
                    {searchResults.contests?.length > 0 && (
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1">
                          Contests
                        </div>
                        <div className="space-y-1">
                          {searchResults.contests.map((c) => (
                            <Link
                              key={c._id}
                              to={`/contests/${c.slug}`}
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs text-slate-200"
                            >
                              <span className="truncate">{c.title}</span>
                              <span className="text-[10px] text-slate-400">{c.duration} mins</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchResults.problems?.length === 0 &&
                      searchResults.users?.length === 0 &&
                      searchResults.contests?.length === 0 && (
                        <div className="text-center py-4 text-xs text-slate-400">
                          No matching results found
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Notifications Center */}
          {isAuthenticated && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                    <span className="text-xs font-semibold text-slate-200">
                      Notifications {unreadCount > 0 && `(${unreadCount})`}
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-emerald-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-center py-4 text-xs text-slate-400">
                        No notifications yet
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`p-2 rounded-lg text-xs transition-colors ${
                            n.isRead ? 'bg-slate-800/40 text-slate-300' : 'bg-emerald-500/10 text-slate-100 border border-emerald-500/20'
                          }`}
                        >
                          <div className="font-medium text-slate-200">{n.title}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{n.message}</div>
                          <div className="text-[9px] text-slate-400 mt-1">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Auth Controls */}
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-xs font-bold text-slate-950 shadow-md">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">@{user?.username}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                      {user?.role}
                    </span>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                    Student Dashboard
                  </Link>

                  <Link
                    to={`/profile/${user?.username}`}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <User className="w-4 h-4 text-teal-400" />
                    Public Profile
                  </Link>

                  {isInstructor && (
                    <Link
                      to="/instructor"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-amber-300 hover:bg-amber-500/10 transition-colors"
                    >
                      <GraduationCap className="w-4 h-4 text-amber-400" />
                      Instructor Portal
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-indigo-400" />
                      Admin Dashboard
                    </Link>
                  )}

                  <div className="border-t border-slate-800 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
