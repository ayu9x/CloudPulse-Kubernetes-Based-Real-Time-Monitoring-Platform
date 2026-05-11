import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';

// ============================================================
// CloudPulse — Main App Component
// ============================================================
// Manages all application state and data fetching.
// Polls the backend every 5 seconds for real-time updates.
// ============================================================

// Backend API base URL — uses environment variable or defaults to localhost
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function App() {
  // ----- Application State -----
  const [status, setStatus] = useState(null);
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ----- Data Fetching -----
  const fetchData = useCallback(async () => {
    try {
      // Fetch all endpoints in parallel for efficiency
      const [statusRes, healthRes, metricsRes, logsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/status`, { timeout: 5000 }),
        axios.get(`${API_BASE}/api/health`, { timeout: 5000 }),
        axios.get(`${API_BASE}/api/metrics`, { timeout: 5000 }),
        axios.get(`${API_BASE}/api/logs?limit=20`, { timeout: 5000 }),
      ]);

      setStatus(statusRes.data);
      setHealth(healthRes.data);
      setMetrics(metricsRes.data);
      setLogs(logsRes.data.logs || []);
      setIsConnected(true);
      setLastUpdated(new Date());
      setError(null);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch data:', err.message);
      setIsConnected(false);
      setError(err.message);
      setIsLoading(false);
    }
  }, []);

  // ----- Polling: Fetch data every 5 seconds -----
  useEffect(() => {
    fetchData(); // Initial fetch

    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [fetchData]);

  // ----- Loading Screen -----
  if (isLoading) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center">
        <div className="text-center fade-in-up">
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto text-brand-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold gradient-text mb-2">CloudPulse</h1>
          <p className="text-slate-400">Connecting to monitoring backend...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient">
      <Navbar 
        isConnected={isConnected} 
        lastUpdated={lastUpdated} 
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && !isConnected && (
          <div className="mb-6 glass-card p-4 border-red-500/30 fade-in-up">
            <div className="flex items-center gap-3">
              <span className="pulse-dot red"></span>
              <div>
                <p className="text-red-400 font-semibold">Connection Error</p>
                <p className="text-slate-400 text-sm mt-1">
                  Unable to reach backend at {API_BASE}. 
                  Make sure the backend is running.
                </p>
              </div>
            </div>
          </div>
        )}
        <Dashboard
          status={status}
          health={health}
          metrics={metrics}
          logs={logs}
          isConnected={isConnected}
        />
      </main>
    </div>
  );
}

export default App;
