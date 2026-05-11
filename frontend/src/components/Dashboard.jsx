import React from 'react';
import StatusCard from './StatusCard';
import MetricsChart from './MetricsChart';
import PodMonitor from './PodMonitor';
import HealthIndicator from './HealthIndicator';

function Dashboard({ status, health, metrics, logs, isConnected }) {
  const cpu = metrics?.current?.cpu ?? '--';
  const mem = metrics?.current?.memory?.percentage ?? '--';
  const totalReqs = metrics?.requests?.total ?? 0;
  const rpm = metrics?.requests?.requestsPerMinute ?? 0;
  const podCount = status?.pods?.length ?? 0;
  const uptime = status?.server?.uptime ?? '--';

  return (
    <div className="space-y-6">
      {/* Status Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatusCard title="CPU Usage" value={`${cpu}%`} icon="⚡" color="brand" subtitle="Current load" />
        <StatusCard title="Memory" value={`${mem}%`} icon="🧠" color="emerald" subtitle="RAM utilization" />
        <StatusCard title="Requests" value={totalReqs} icon="📡" color="cyan" subtitle="Total processed" />
        <StatusCard title="RPM" value={rpm} icon="🔄" color="violet" subtitle="Requests/min" />
        <StatusCard title="Pods" value={podCount} icon="🐳" color="amber" subtitle="Active pods" />
        <StatusCard title="Uptime" value={uptime} icon="⏱️" color="rose" subtitle="Server uptime" />
      </div>

      {/* Charts & Health Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MetricsChart metrics={metrics} />
        </div>
        <div>
          <HealthIndicator health={health} isConnected={isConnected} />
        </div>
      </div>

      {/* Pods & Logs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PodMonitor status={status} />

        {/* Logs Panel */}
        <div className="glass-card p-5 fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Recent Logs</h3>
            <span className="text-xs text-slate-500 font-mono">{logs.length} entries</span>
          </div>
          <div className="space-y-0.5 max-h-80 overflow-y-auto rounded-lg bg-surface-900/50 p-2">
            {logs.length > 0 ? (
              logs.map((log, i) => (
                <div key={i} className={`log-entry ${log.level}`}>
                  <span className="text-slate-600">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}</span>
                  {' '}
                  <span className={
                    log.level === 'error' ? 'text-red-400' :
                    log.level === 'warn' ? 'text-amber-400' : 'text-blue-400'
                  }>
                    [{log.level?.toUpperCase()}]
                  </span>
                  {' '}
                  <span className="text-slate-300">{log.message}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm">No logs yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 border-t border-slate-800/50">
        <p className="text-xs text-slate-600">
          CloudPulse v1.0.0 · Kubernetes-Based Real-Time Monitoring Platform · 
          <span className="text-brand-500/60"> Built with React, Express, Prometheus & Grafana</span>
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
