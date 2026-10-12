import React from 'react';

export default function DifficultyBadge({ difficulty, size = 'sm' }) {
  const diff = difficulty || 'Easy';

  const styles = {
    Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Hard: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    Hidden: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  };

  const sizes = {
    xs: 'text-[11px] px-1.5 py-0.5',
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${
        styles[diff] || styles.Easy
      } ${sizes[size]}`}
    >
      {diff}
    </span>
  );
}
