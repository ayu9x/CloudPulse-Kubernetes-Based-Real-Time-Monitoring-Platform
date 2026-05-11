import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function MetricsChart({ metrics }) {
  const history = metrics?.history || [];
  const chartData = history.map((point) => ({
    ...point,
    time: new Date(point.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  }));

  return (
    <div className="glass-card p-5 fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Resource Usage</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-500"></div>
            <span className="text-slate-400">CPU</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <span className="text-slate-400">Memory</span>
          </div>
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#1e293b' }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#1e293b' }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', padding: '10px 14px' }} labelStyle={{ color: '#94a3b8', fontSize: 11 }} />
              <Area type="monotone" dataKey="cpu" name="CPU %" stroke="#6366f1" strokeWidth={2} fill="url(#cpuGrad)" dot={false} activeDot={{ r: 4, fill: '#6366f1' }} />
              <Area type="monotone" dataKey="memory" name="Memory %" stroke="#22c55e" strokeWidth={2} fill="url(#memGrad)" dot={false} activeDot={{ r: 4, fill: '#22c55e' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="chart-container flex items-center justify-center">
          <p className="text-slate-500 text-sm">Collecting metrics data...</p>
        </div>
      )}

      {metrics?.current && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-700/30">
          {[
            { label: 'CPU', value: `${metrics.current.cpu}%`, color: 'text-brand-400' },
            { label: 'Memory', value: `${metrics.current.memory.percentage}%`, color: 'text-emerald-400' },
            { label: 'Heap', value: `${metrics.current.processMemory}MB`, color: 'text-cyan-400' },
            { label: 'Uptime', value: `${Math.floor(metrics.current.uptime / 60)}m`, color: 'text-violet-400' },
          ].map((m) => (
            <div key={m.label} className="bg-slate-800/30 rounded-lg px-3 py-2 text-center">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">{m.label}</p>
              <p className={`text-sm font-bold mt-0.5 font-mono ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MetricsChart;
