import React from 'react';

export default function ActivityHeatmap({ data = {} }) {
  // Generate past 365 days grouped into 52 weeks
  const today = new Date();
  const days = [];

  for (let i = 364; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = data[dateStr] || 0;
    days.push({
      date: dateStr,
      count,
      dayOfWeek: d.getDay(),
    });
  }

  // Determine intensity color
  const getColor = (count) => {
    if (count === 0) return 'bg-slate-800/60 dark:bg-slate-800/80';
    if (count === 1) return 'bg-emerald-900/90 text-emerald-100';
    if (count <= 3) return 'bg-emerald-600 text-white';
    return 'bg-emerald-400 text-black shadow-sm shadow-emerald-500/50';
  };

  const totalContributions = Object.values(data).reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-200">Activity Calendar</h3>
          <p className="text-xs text-slate-400">
            {totalContributions} submissions in the past year
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-slate-800"></div>
          <div className="w-3 h-3 rounded-sm bg-emerald-900"></div>
          <div className="w-3 h-3 rounded-sm bg-emerald-600"></div>
          <div className="w-3 h-3 rounded-sm bg-emerald-400"></div>
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="grid grid-flow-col grid-rows-7 gap-1 min-w-[680px]">
          {days.map((d, index) => (
            <div
              key={index}
              title={`${d.date}: ${d.count} submissions`}
              className={`w-3 h-3 rounded-[2px] transition-colors hover:scale-125 cursor-pointer ${getColor(
                d.count
              )}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
