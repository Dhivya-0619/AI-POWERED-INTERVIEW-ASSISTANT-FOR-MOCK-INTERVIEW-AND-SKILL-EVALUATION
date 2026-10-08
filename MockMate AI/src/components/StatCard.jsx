import React from 'react';

const StatCard = ({ title, value, subtitle, trend, icon: Icon, color = 'indigo' }) => {
  const colorMap = {
    indigo: {
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-100',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-100',
    },
    violet: {
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-100',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-100',
    },
  };

  const style = colorMap[color] || colorMap.indigo;

  return (
    <div className="card card-hover group">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.12em]">
            {title}
          </p>
          <h3 className="text-2xl md:text-[1.75rem] text-slate-900 mt-1.5 font-heading tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>
          )}
          {trend && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-2.5 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
              {trend}
            </span>
          )}
        </div>

        {Icon && (
          <div
            className={`w-11 h-11 rounded-xl ${style.bg} ${style.border} border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105`}
          >
            <Icon className={`w-5 h-5 ${style.text}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
