import React from 'react';

// ============================================================
// HealthIndicator — API endpoint health display with pulse
// ============================================================

function HealthIndicator({ health, isConnected }) {
  const getStatusColor = () => {
    if (!isConnected) return 'red';
    if (!health) return 'yellow';
    if (health.status === 'healthy') return 'green';
    if (health.status === 'degraded') return 'yellow';
    return 'red';
  };

  const statusColor = getStatusColor();

  const endpoints = [
    { name: '/api/health', status: isConnected ? 'UP' : 'DOWN' },
    { name: '/api/status', status: isConnected ? 'UP' : 'DOWN' },
    { name: '/api/metrics', status: isConnected ? 'UP' : 'DOWN' },
    { name: '/api/logs', status: isConnected ? 'UP' : 'DOWN' },
    { name: '/metrics', status: isConnected ? 'UP' : 'DOWN' },
  ];

  return (
    <div className="glass-card p-5 fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          API Health
        </h3>
        <div className="flex items-center gap-2">
          <span className={`pulse-dot ${statusColor}`}></span>
          <span className={`text-xs font-bold uppercase ${
            statusColor === 'green' ? 'text-emerald-400' :
            statusColor === 'yellow' ? 'text-amber-400' : 'text-red-400'
          }`}>
            {health?.status || (isConnected ? 'Checking...' : 'Offline')}
          </span>
        </div>
      </div>

      {/* Health Checks */}
      {health?.checks && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {Object.entries(health.checks).map(([key, val]) => (
            <div key={key} className="bg-slate-800/40 rounded-lg px-3 py-2 text-center">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">{key}</p>
              <p className={`text-xs font-bold mt-0.5 ${
                val === 'up' || val === 'healthy' || val === 'responsive'
                  ? 'text-emerald-400' 
                  : val === 'warning' ? 'text-amber-400' : 'text-red-400'
              }`}>
                {val}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Endpoint List */}
      <div className="space-y-1.5">
        {endpoints.map((ep) => (
          <div key={ep.name} className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-slate-800/30 transition-colors">
            <code className="text-xs text-slate-400 font-mono">{ep.name}</code>
            <span className={`text-xs font-bold ${
              ep.status === 'UP' ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {ep.status}
            </span>
          </div>
        ))}
      </div>

      {/* Uptime */}
      {health?.uptime && (
        <div className="mt-4 pt-3 border-t border-slate-700/50">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Uptime</span>
            <span className="text-slate-300 font-mono">{formatSeconds(health.uptime)}</span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-slate-500">Version</span>
            <span className="text-brand-400 font-mono">{health.version}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function formatSeconds(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  return `${minutes}m ${secs}s`;
}

export default HealthIndicator;
