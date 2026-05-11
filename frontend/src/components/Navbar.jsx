import React from 'react';

// ============================================================
// Navbar — Top navigation bar with branding & connection status
// ============================================================

function Navbar({ isConnected, lastUpdated }) {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-700/50 bg-surface-900/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                <span className="gradient-text">CloudPulse</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase -mt-0.5">
                Monitoring Platform
              </p>
            </div>
          </div>

          {/* Right Side — Status & Info */}
          <div className="flex items-center gap-4">
            {/* Last Updated */}
            {lastUpdated && (
              <span className="hidden sm:block text-xs text-slate-500 font-mono">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}

            {/* Connection Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50">
              <span className={`pulse-dot ${isConnected ? 'green' : 'red'}`}></span>
              <span className={`text-xs font-semibold ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* K8s Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20">
              <svg className="w-3.5 h-3.5 text-brand-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span className="text-xs font-semibold text-brand-300">k3s</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
