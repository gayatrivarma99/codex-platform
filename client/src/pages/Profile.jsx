import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Trophy,
  Flame,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  User,
  Star,
  Zap,
  Target,
  AlertCircle,
} from 'lucide-react';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import ActivityHeatmap from '../components/ActivityHeatmap';
import DifficultyBadge from '../components/DifficultyBadge';

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser, updateProfile } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit profile state
  const [editOpen, setEditOpen] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  const isOwner = currentUser?.username === username;

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await userService.getUserProfile(username);
      if (res.success) {
        setProfile(res.profile);
        setNameInput(res.profile.name);
        setBioInput(res.profile.bio || '');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Profile not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name: nameInput, bio: bioInput });
      setProfile((prev) => ({ ...prev, name: nameInput, bio: bioInput }));
      setEditOpen(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center px-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Profile Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">{error}</p>
        <Link to="/" className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl">
          Return Home
        </Link>
      </div>
    );
  }

  const stats = profile.stats || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-extrabold flex items-center justify-center text-3xl sm:text-4xl shadow-xl shadow-emerald-500/20">
            {profile.name?.[0]?.toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-white">{profile.name}</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {profile.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">@{profile.username}</p>
            <p className="text-xs text-slate-300 mt-2 max-w-xl">{profile.bio || 'Coding enthusiast & algorithmic thinker.'}</p>
            <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Joined {new Date(profile.memberSince).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={() => setEditOpen(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-2"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">Edit Profile</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Bio (max 200 chars)</label>
                <textarea
                  rows={3}
                  maxLength={200}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400">Total Solved</div>
          <div className="text-2xl font-bold text-white mt-1">{stats.totalSolved || 0}</div>
          <div className="text-[11px] text-emerald-400 mt-1">Challenges conquered</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400">Contest Rating</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{profile.rating || 1500}</div>
          <div className="text-[11px] text-slate-400 mt-1">Competitive standing</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400">Current Streak</div>
          <div className="text-2xl font-bold text-orange-400 mt-1">
            {profile.streak?.current || 0} Days
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Longest: {profile.streak?.longest || 0}d</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400">Acceptance Rate</div>
          <div className="text-2xl font-bold text-teal-400 mt-1">{stats.acceptanceRate || 0}%</div>
          <div className="text-[11px] text-slate-400 mt-1">{stats.totalSubmissions || 0} total submissions</div>
        </div>
      </div>

      {/* GitHub-like Contribution Heatmap */}
      <ActivityHeatmap data={profile.activityHeatmap || {}} />

      {/* Achievements / Badges Showcase */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          Badges & Achievements
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {profile.achievements?.length === 0 ? (
            <div className="col-span-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
              No badges unlocked yet. Solve coding problems to earn achievements!
            </div>
          ) : (
            profile.achievements?.map((ach) => (
              <div
                key={ach._id}
                className="bg-slate-900/60 border border-amber-500/20 rounded-2xl p-4 text-center hover:border-amber-500/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-md shadow-amber-500/10">
                  <Award className="w-6 h-6" />
                </div>
                <div className="font-bold text-slate-100 text-xs">{ach.title}</div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">{ach.description}</div>
                <div className="text-[9px] text-amber-400/80 mt-2 font-mono">
                  {new Date(ach.unlockedAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
