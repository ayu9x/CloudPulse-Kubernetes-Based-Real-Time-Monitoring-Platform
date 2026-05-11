import React from 'react';

// ============================================================
// StatusCard — Glassmorphic card displaying a single metric
// ============================================================

function StatusCard({ title, value, subtitle, icon, color = 'brand', trend }) {
  const colorMap = {
    brand: {
      bg: 'bg-brand-500/10',
      border: 'border-brand-500/20',
      text: 'text-brand-400',
      icon: 'text-brand-400',
      glow: 'shadow-brand-500/5',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      icon: 'text-emerald-400',
      glow: 'shadow-emerald-500/5',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      icon: 'text-amber-400',
      glow: 'shadow-amber-500/5',
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      icon: 'text-rose-400',
      glow: 'shadow-rose-500/5',
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      text: 'text-cyan-400',
      icon: 'text-cyan-400',
      glow: 'shadow-cyan-500/5',
    },
    violet: {
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
      text: 'text-violet-400',
      icon: 'text-violet-400',
      glow: 'shadow-violet-500/5',
    },
  };

  const c = colorMap[color] || colorMap.brand;

  return (
    <div className={`glass-card p-5 fade-in-up`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center shadow-lg ${c.glow}`}>
          <span className={`text-lg ${c.icon}`}>{icon}</span>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${
            trend >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            <svg className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-sm text-slate-400 font-medium mb-1">{title}</p>
      <p className={`text-2xl font-bold tracking-tight ${c.text}`}>
        {value ?? <span className="shimmer inline-block w-16 h-7">&nbsp;</span>}
      </p>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-1.5">{subtitle}</p>
      )}
    </div>
  );
}

export default StatusCard;
