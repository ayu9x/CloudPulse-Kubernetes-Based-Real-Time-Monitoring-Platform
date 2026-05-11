import React from 'react';

function PodMonitor({ status }) {
  const pods = status?.pods || [];

  const statusColors = {
    Running: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'green' },
    Pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'yellow' },
    Failed: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', dot: 'red' },
  };

  return (
    <div className="glass-card p-5 fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Pod Monitor</h3>
        <span className="text-xs text-slate-500 font-mono">{pods.length} pods</span>
      </div>

      {pods.length > 0 ? (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {pods.map((pod, i) => {
            const sc = statusColors[pod.status] || statusColors.Pending;
            return (
              <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${sc.bg} border ${sc.border} transition-all hover:scale-[1.01]`}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`pulse-dot ${sc.dot} flex-shrink-0`}></span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate font-mono">{pod.name}</p>
                    <p className="text-xs text-slate-500">{pod.namespace} · {pod.age}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-slate-500">CPU</p>
                    <p className="text-xs font-mono text-brand-400">{pod.cpu}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-slate-500">MEM</p>
                    <p className="text-xs font-mono text-emerald-400">{pod.memory}</p>
                  </div>
                  <div className={`status-badge ${sc.bg} border ${sc.border}`}>
                    <span className={sc.text}>{pod.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-500 text-sm">No pod data available</p>
        </div>
      )}

      {status?.cluster && (
        <div className="mt-4 pt-3 border-t border-slate-700/30 grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Cluster</p>
            <p className="text-xs font-mono text-slate-300 mt-0.5">{status.cluster.name}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Provider</p>
            <p className="text-xs font-mono text-brand-400 mt-0.5">{status.cluster.provider}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Region</p>
            <p className="text-xs font-mono text-slate-300 mt-0.5">{status.cluster.region}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PodMonitor;
