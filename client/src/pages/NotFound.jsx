import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <Terminal className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-2">404</h1>
        <h2 className="text-lg font-bold text-slate-200 mb-2">Page Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">
          The requested path does not exist on the platform. Check the URL or return to safety.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
