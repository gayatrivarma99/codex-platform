import React from 'react';
import { Code2, Github, Twitter, Terminal, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/80 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Code2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-sm font-bold text-slate-200">
            Codex Platform <span className="text-emerald-500">v2.0</span>
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            — Enterprise Algorithmic Assessment & Coding Arena
          </span>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-400">
          <Link to="/problems" className="hover:text-emerald-400 transition-colors">Problems</Link>
          <Link to="/contests" className="hover:text-emerald-400 transition-colors">Contests</Link>
          <Link to="/assessments" className="hover:text-emerald-400 transition-colors">Assessments</Link>
          <Link to="/leaderboard" className="hover:text-emerald-400 transition-colors">Rankings</Link>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>for Developers</span>
        </div>
      </div>
    </footer>
  );
}
